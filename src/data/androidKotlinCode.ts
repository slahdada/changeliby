export interface KotlinFile {
  filename: string;
  path: string;
  description: string;
  code: string;
}

export const ANDROID_KOTLIN_FILES: KotlinFile[] = [
  {
    filename: 'Entities.kt',
    path: 'app/src/main/java/com/libya/exchange/data/local/entity/Entities.kt',
    description: 'كائنات بيانات Room Database للتخزين المحلي offline-first',
    code: `package com.libya.exchange.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class UserRole { ADMIN, TELLER }
enum class TransactionType { BUY, SELL }
enum class KycStatus { VERIFIED, PENDING, EXPIRED }
enum class RiskLevel { LOW, MEDIUM, HIGH }

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val username: String,
    val fullName: String,
    val role: UserRole,
    val branch: String,
    val pinHash: String,
    val active: Boolean = true
)

@Entity(tableName = "currencies")
data class CurrencyEntity(
    @PrimaryKey val code: String, // e.g., "USD", "EUR", "LYD"
    val nameAr: String,
    val nameFr: String,
    val symbol: String,
    val flagEmoji: String,
    val isBase: Boolean = false
)

@Entity(tableName = "exchange_rates")
data class ExchangeRateEntity(
    @PrimaryKey val currencyCode: String,
    val buyRateLyd: Double,  // Rate to buy foreign currency from customer
    val sellRateLyd: Double, // Rate to sell foreign currency to customer
    val officialRateLyd: Double?,
    val updatedAt: Long,
    val updatedBy: String,
    val note: String? = null
)

@Entity(tableName = "customers")
data class CustomerEntity(
    @PrimaryKey val id: String,
    val fullName: String,
    val nationalId: String, // الرقم الوطني الليبي
    val passportNumber: String?,
    val phone: String,
    val nationality: String,
    val kycStatus: KycStatus,
    val riskLevel: RiskLevel,
    val totalExchangedLyd: Double = 0.0
)

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val receiptNumber: String,
    val type: TransactionType,
    val currencyCode: String,
    val foreignAmount: Double,
    val exchangeRate: Double,
    val lydAmount: Double,
    val commissionLyd: Double,
    val netLydAmount: Double,
    val customerId: String?,
    val customerName: String,
    val tellerId: String,
    val tellerName: String,
    val timestamp: Long,
    val paymentMethod: String
)

@Entity(tableName = "cash_drawer")
data class CashDrawerEntity(
    @PrimaryKey val currencyCode: String,
    val balance: Double,
    val lastUpdated: Long
)
`
  },
  {
    filename: 'ExchangeDao.kt',
    path: 'app/src/main/java/com/libya/exchange/data/local/dao/ExchangeDao.kt',
    description: 'واجهة Room DAO للاستعلامات المحلية مع دعم Flow المباشر',
    code: `package com.libya.exchange.data.local.dao

import androidx.room.*
import com.libya.exchange.data.local.entity.*
import kotlinx.coroutines.flow.Flow

@Dao
interface ExchangeDao {

    // Exchange Rates
    @Query("SELECT * FROM exchange_rates")
    fun getAllRates(): Flow<List<ExchangeRateEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateRates(rates: List<ExchangeRateEntity>)

    // Transactions
    @Query("SELECT * FROM transactions ORDER BY timestamp DESC")
    fun getAllTransactions(): Flow<List<TransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insertTransaction(transaction: TransactionEntity)

    // Customers / KYC
    @Query("SELECT * FROM customers WHERE nationalId = :nationalId OR passportNumber = :passport LIMIT 1")
    suspend fun findCustomerByIdentifier(nationalId: String, passport: String): CustomerEntity?

    @Query("SELECT * FROM customers ORDER BY fullName ASC")
    fun getAllCustomers(): Flow<List<CustomerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity)

    // Cash Drawer
    @Query("SELECT * FROM cash_drawer")
    fun getDrawerBalances(): Flow<List<CashDrawerEntity>>

    @Query("UPDATE cash_drawer SET balance = balance + :deltaAmount, lastUpdated = :now WHERE currencyCode = :code")
    suspend fun updateDrawerBalance(code: String, deltaAmount: Double, now: Long = System.currentTimeMillis())
}
`
  },
  {
    filename: 'ExchangeRepository.kt',
    path: 'app/src/main/java/com/libya/exchange/data/repository/ExchangeRepository.kt',
    description: 'مستودع البيانات (Repository Pattern) وإدارة المعاملات المحلية',
    code: `package com.libya.exchange.data.repository

import com.libya.exchange.data.local.dao.ExchangeDao
import com.libya.exchange.data.local.entity.*
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ExchangeRepository @Inject constructor(
    private val dao: ExchangeDao
) {
    val allRates: Flow<List<ExchangeRateEntity>> = dao.getAllRates()
    val allTransactions: Flow<List<TransactionEntity>> = dao.getAllTransactions()
    val allCustomers: Flow<List<CustomerEntity>> = dao.getAllCustomers()
    val drawerBalances: Flow<List<CashDrawerEntity>> = dao.getDrawerBalances()

    suspend fun updateRates(rates: List<ExchangeRateEntity>) {
        dao.insertOrUpdateRates(rates)
    }

    suspend fun executeTransaction(transaction: TransactionEntity): Result<Unit> {
        return try {
            dao.insertTransaction(transaction)

            // Update cash drawer atomically
            if (transaction.type == TransactionType.BUY) {
                // Office buys foreign currency -> +Foreign, -LYD
                dao.updateDrawerBalance(transaction.currencyCode, transaction.foreignAmount)
                dao.updateDrawerBalance("LYD", -transaction.netLydAmount)
            } else {
                // Office sells foreign currency -> -Foreign, +LYD
                dao.updateDrawerBalance(transaction.currencyCode, -transaction.foreignAmount)
                dao.updateDrawerBalance("LYD", transaction.netLydAmount)
            }

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun saveCustomer(customer: CustomerEntity) {
        dao.insertCustomer(customer)
    }
}
`
  },
  {
    filename: 'PosViewModel.kt',
    path: 'app/src/main/java/com/libya/exchange/ui/pos/PosViewModel.kt',
    description: 'نموذج العرض (ViewModel) لحسابات الشراء/البيع والتحقق في Compose',
    code: `package com.libya.exchange.ui.pos

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.libya.exchange.data.local.entity.*
import com.libya.exchange.data.repository.ExchangeRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

data class PosUiState(
    val selectedType: TransactionType = TransactionType.BUY,
    val selectedCurrency: String = "USD",
    val foreignAmountInput: String = "",
    val exchangeRate: Double = 6.86,
    val totalLyd: Double = 0.0,
    val selectedCustomer: CustomerEntity? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val lastCompletedTxn: TransactionEntity? = null
)

@HiltViewModel
class PosViewModel @Inject constructor(
    private val repository: ExchangeRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(PosUiState())
    val uiState: StateFlow<PosUiState> = _uiState.asStateFlow()

    fun onAmountChanged(input: String) {
        val amount = input.toDoubleOrNull() ?: 0.0
        val total = amount * _uiState.value.exchangeRate
        _uiState.update { it.copy(foreignAmountInput = input, totalLyd = total) }
    }

    fun onTransactionTypeChanged(type: TransactionType) {
        _uiState.update { it.copy(selectedType = type) }
    }

    fun submitTransaction(tellerName: String, tellerId: String) {
        val state = _uiState.value
        val amount = state.foreignAmountInput.toDoubleOrNull() ?: return

        if (amount <= 0) {
            _uiState.update { it.copy(errorMessage = "يرجى إدخال مبلغ صحيح أكبر من الصفر") }
            return
        }

        viewModelScope.launch {
            val txn = TransactionEntity(
                id = UUID.randomUUID().toString(),
                receiptNumber = "REC-\${System.currentTimeMillis().toString().takeLast(6)}",
                type = state.selectedType,
                currencyCode = state.selectedCurrency,
                foreignAmount = amount,
                exchangeRate = state.exchangeRate,
                lydAmount = state.totalLyd,
                commissionLyd = 0.0,
                netLydAmount = state.totalLyd,
                customerId = state.selectedCustomer?.id,
                customerName = state.selectedCustomer?.fullName ?: "زبون عابر",
                tellerId = tellerId,
                tellerName = tellerName,
                timestamp = System.currentTimeMillis(),
                paymentMethod = "CASH"
            )

            repository.executeTransaction(txn).fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            foreignAmountInput = "",
                            totalLyd = 0.0,
                            lastCompletedTxn = txn,
                            errorMessage = null
                        )
                    }
                },
                onFailure = { err ->
                    _uiState.update { it.copy(errorMessage = err.localizedMessage) }
                }
            )
        }
    }
}
`
  },
  {
    filename: 'PosScreen.kt',
    path: 'app/src/main/java/com/libya/exchange/ui/pos/PosScreen.kt',
    description: 'واجهة Jetpack Compose الحديثة لشراء وبيع العملات للشركة',
    code: `package com.libya.exchange.ui.pos

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.libya.exchange.data.local.entity.TransactionType

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PosScreen(
    viewModel: PosViewModel,
    onPrintReceipt: (String) -> Unit
) {
    val state by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "شاشة الشراء والبيع - صرافة ليبيا",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )

        // Type Switcher
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { viewModel.onTransactionTypeChanged(TransactionType.BUY) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (state.selectedType == TransactionType.BUY) Color(0xFF16A34A) else Color.Gray
                ),
                modifier = Modifier.weight(1f)
            ) {
                Text("شراء عملة (من الزبون)")
            }

            Button(
                onClick = { viewModel.onTransactionTypeChanged(TransactionType.SELL) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (state.selectedType == TransactionType.SELL) Color(0xFFDC2626) else Color.Gray
                ),
                modifier = Modifier.weight(1f)
            ) {
                Text("بيع عملة (للزبون)")
            }
        }

        // Amount Input Field
        OutlinedTextField(
            value = state.foreignAmountInput,
            onValueChange = { viewModel.onAmountChanged(it) },
            label = { Text("المبلغ بالعملة الأجنبية (\${state.selectedCurrency})") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )

        // Calculated LYD Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("سعر الصرف الحالي: \${state.exchangeRate} د.ل")
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "المبلغ المطلوب بالدينار: \${String.format("%.2f", state.totalLyd)} د.ل",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A)
                )
            }
        }

        // Action Button
        Button(
            onClick = { viewModel.submitTransaction("علي المحمودي", "USR-002") },
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("تأكيد العملية وإصدار الفاتورة", fontSize = 16.sp)
        }

        // Last Receipt Alert
        state.lastCompletedTxn?.let { txn ->
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFDCFCE7)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .padding(16.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("تمت العملية: \${txn.receiptNumber}")
                    TextButton(onClick = { onPrintReceipt(txn.id) }) {
                        Text("طباعة الوصل الحراري")
                    }
                }
            }
        }
    }
}
`
  },
  {
    filename: 'ThermalReceiptPrinter.kt',
    path: 'app/src/main/java/com/libya/exchange/util/ThermalReceiptPrinter.kt',
    description: 'معد طابعات الفواتير الحرارية ESC/POS عبر Bluetooth أو USB (80mm/58mm)',
    code: `package com.libya.exchange.util

import com.libya.exchange.data.local.entity.TransactionEntity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ThermalReceiptPrinter {

    fun generateEscPosCommands(txn: TransactionEntity): ByteArray {
        val bytes = mutableListOf<Byte>()

        fun String.toArabicBytes(): ByteArray = this.toByteArray(charset("Windows-1256"))

        // Initialize Printer ESC @
        bytes.addAll(listOf(0x1B, 0x40).map { it.toByte() })

        // Center Alignment ESC a 1
        bytes.addAll(listOf(0x1B, 0x61, 0x01).map { it.toByte() })

        // Header Title
        bytes.addAll("مكتب الفارس للصرافة والخدمات المالية\\n".toArabicBytes().toList())
        bytes.addAll("طرابلس - ليبيا | +218 21 334 5678\\n".toArabicBytes().toList())
        bytes.addAll("================================\\n".toByteArray().toList())

        // Left Alignment ESC a 0
        bytes.addAll(listOf(0x1B, 0x61, 0x00).map { it.toByte() })

        val df = SimpleDateFormat("yyyy/MM/dd HH:mm", Locale.getDefault())
        val dateStr = df.format(Date(txn.timestamp))

        bytes.addAll("رقم الوصل: \${txn.receiptNumber}\\n".toArabicBytes().toList())
        bytes.addAll("التاريخ: \$dateStr\\n".toArabicBytes().toList())
        bytes.addAll("الصراف: \${txn.tellerName}\\n".toArabicBytes().toList())
        bytes.addAll("العميل: \${txn.customerName}\\n".toArabicBytes().toList())
        bytes.addAll("--------------------------------\\n".toByteArray().toList())

        val typeText = if (txn.type.name == "BUY") "شراء عملة" else "بيع عملة"
        bytes.addAll("الخدمة: \$typeText\\n".toArabicBytes().toList())
        bytes.addAll("المبلغ: \${txn.foreignAmount} \${txn.currencyCode}\\n".toArabicBytes().toList())
        bytes.addAll("سعر الصرف: \${txn.exchangeRate} د.ل\\n".toArabicBytes().toList())
        bytes.addAll("إجمالي الدينار: \${txn.netLydAmount} د.ل\\n".toArabicBytes().toList())

        bytes.addAll("================================\\n".toByteArray().toList())
        bytes.addAll("شكراً لزيارتكم - نتمنى لكم يوماً سعيداً\\n\\n\\n".toArabicBytes().toList())

        // Cut Paper Command GS V 66 0
        bytes.addAll(listOf(0x1D, 0x56, 0x42, 0x00).map { it.toByte() })

        return bytes.toByteArray()
    }
}
`
  }
];
