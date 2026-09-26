// Utility to evaluate rate freshness, accuracy level, and confidence score based on last update timestamp.

export type RateFreshnessLevel = 'LIVE_OPTIMAL' | 'RECENT_HIGH' | 'MODERATE_ACCEPTABLE' | 'STALE_WARNING';

export interface RateFreshnessInfo {
  level: RateFreshnessLevel;
  confidencePercent: number; // 0 - 100
  timeAgoTextAr: string;
  timeAgoTextFr: string;
  statusLabelAr: string;
  statusLabelFr: string;
  descriptionAr: string;
  descriptionFr: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    dot: string;
    ring: string;
  };
  minutesElapsed: number;
}

export function evaluateRateFreshness(updatedAtIso?: string): RateFreshnessInfo {
  if (!updatedAtIso) {
    return {
      level: 'STALE_WARNING',
      confidencePercent: 45,
      timeAgoTextAr: 'غير محدد',
      timeAgoTextFr: 'Indéterminé',
      statusLabelAr: 'يحتاج لتحديث',
      statusLabelFr: 'À actualiser',
      descriptionAr: 'لم يتم تسجيل زمن التحديث الأخير. يرجى المزامنة مع النشرة الرسمية.',
      descriptionFr: 'Aucune date de mise à jour enregistrée.',
      colorClass: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        ring: 'ring-rose-400'
      },
      minutesElapsed: 9999
    };
  }

  const updateTime = new Date(updatedAtIso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - updateTime);
  const minutesElapsed = Math.floor(diffMs / (1000 * 60));

  let timeAgoTextAr = '';
  let timeAgoTextFr = '';

  if (minutesElapsed < 1) {
    timeAgoTextAr = 'الآن (لحظي)';
    timeAgoTextFr = 'À l\'instant';
  } else if (minutesElapsed === 1) {
    timeAgoTextAr = 'منذ دقيقة';
    timeAgoTextFr = 'Il y a 1 min';
  } else if (minutesElapsed === 2) {
    timeAgoTextAr = 'منذ دقيقتين';
    timeAgoTextFr = 'Il y a 2 min';
  } else if (minutesElapsed < 11) {
    timeAgoTextAr = `منذ ${minutesElapsed} دقائق`;
    timeAgoTextFr = `Il y a ${minutesElapsed} min`;
  } else if (minutesElapsed < 60) {
    timeAgoTextAr = `منذ ${minutesElapsed} دقيقة`;
    timeAgoTextFr = `Il y a ${minutesElapsed} min`;
  } else {
    const hours = Math.floor(minutesElapsed / 60);
    if (hours === 1) {
      timeAgoTextAr = 'منذ ساعة';
      timeAgoTextFr = 'Il y a 1 heure';
    } else if (hours === 2) {
      timeAgoTextAr = 'منذ ساعتين';
      timeAgoTextFr = 'Il y a 2 heures';
    } else if (hours < 11) {
      timeAgoTextAr = `منذ ${hours} ساعات`;
      timeAgoTextFr = `Il y a ${hours} heures`;
    } else {
      const days = Math.floor(hours / 24);
      if (days >= 1) {
        timeAgoTextAr = `منذ ${days} يوم`;
        timeAgoTextFr = `Il y a ${days} jour(s)`;
      } else {
        timeAgoTextAr = `منذ ${hours} ساعة`;
        timeAgoTextFr = `Il y a ${hours} heures`;
      }
    }
  }

  // Bracket logic
  if (minutesElapsed <= 15) {
    return {
      level: 'LIVE_OPTIMAL',
      confidencePercent: 99,
      timeAgoTextAr,
      timeAgoTextFr,
      statusLabelAr: 'دقة فائقة (مباشر)',
      statusLabelFr: 'Précision Maximale',
      descriptionAr: 'البيانات حديثة جداً ومطابقة للنشرة الحالية لمصرف ليبيا المركزي وتداولات السوق الموازي الفعلي.',
      descriptionFr: 'Données ultra-fraîches alignées sur le bulletin CBL.',
      colorClass: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        dot: 'bg-emerald-500',
        ring: 'ring-emerald-400'
      },
      minutesElapsed
    };
  }

  if (minutesElapsed <= 60) {
    return {
      level: 'RECENT_HIGH',
      confidencePercent: 92,
      timeAgoTextAr,
      timeAgoTextFr,
      statusLabelAr: 'دقة عالية (موثوق)',
      statusLabelFr: 'Haute Précision',
      descriptionAr: 'السعر محدث خلال الساعة الحالية وموثوق للعمليات التجارية والمعاملات المباشرة.',
      descriptionFr: 'Taux mis à jour au cours de l\'heure actuelle.',
      colorClass: {
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-300',
        dot: 'bg-teal-500',
        ring: 'ring-teal-400'
      },
      minutesElapsed
    };
  }

  if (minutesElapsed <= 240) { // Up to 4 hours
    return {
      level: 'MODERATE_ACCEPTABLE',
      confidencePercent: 78,
      timeAgoTextAr,
      timeAgoTextFr,
      statusLabelAr: 'دقة مقبولة (متوسط)',
      statusLabelFr: 'Précision Modérée',
      descriptionAr: 'السعر تم تحديثه في وقت سابق اليوم. ينصح بالتأكيد قبل العمليات الكبيرة ذات القيمة المرتفعة.',
      descriptionFr: 'Taux de la session précédente, actualisation conseillée.',
      colorClass: {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500',
        ring: 'ring-amber-400'
      },
      minutesElapsed
    };
  }

  return {
    level: 'STALE_WARNING',
    confidencePercent: 55,
    timeAgoTextAr,
    timeAgoTextFr,
    statusLabelAr: 'بحاجة لتحديث (قديم)',
    statusLabelFr: 'À Actualiser',
    descriptionAr: 'مضى وقت طويل على آخر تحديث. يرجى التحقق من أحدث نشرة CBL ومزامنة الأسعار لضمان دقة الحسابات.',
    descriptionFr: 'Mise à jour requise pour éviter les écarts de change.',
    colorClass: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-300',
      dot: 'bg-rose-500',
      ring: 'ring-rose-400'
    },
    minutesElapsed
  };
}
