import React, { useState } from 'react';
import { User } from '../../types';

interface UserAvatarProps {
  user: Pick<User, 'fullName' | 'avatar' | 'role'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ringColor?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  ringColor = 'ring-yellow-500/40'
}) => {
  const [imageError, setImageError] = useState(false);

  // Size dimensions map
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base'
  }[size];

  // Try avatar source, or fallback to /slah2.jpg if this is Slah Ayari
  let avatarSrc = user.avatar;
  if (!avatarSrc && (user.fullName.includes('صلاح') || user.fullName.includes('العياري'))) {
    avatarSrc = '/slah2.jpg';
  }

  // Text alternative: initials or name
  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .slice(0, 2)
        .join('')
    : 'ص';

  return (
    <div 
      className={`relative rounded-full shrink-0 aspect-square overflow-hidden flex items-center justify-center select-none ${sizeClasses} ring-2 ${ringColor} ${className}`}
      title={user.fullName}
    >
      {avatarSrc && !imageError ? (
        <img
          src={avatarSrc}
          alt={user.fullName || 'صلاح العياري'}
          className="w-full h-full object-cover object-center rounded-full aspect-square"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div 
          className="w-full h-full bg-slate-900 text-yellow-400 font-bold flex items-center justify-center text-center p-0.5 rounded-full"
          aria-label={user.fullName || 'صلاح العياري'}
        >
          <span className="truncate">{initials || 'صلاح العياري'}</span>
        </div>
      )}
    </div>
  );
};
