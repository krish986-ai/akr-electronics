import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  badge?: React.ReactNode;
}

export function Avatar({ src, alt, initials, size = 'md', badge }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn('rounded-full bg-neutral-200 object-cover', sizeClasses[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold flex items-center justify-center',
            sizeClasses[size]
          )}
        >
          {initials}
        </div>
      )}
      {badge && (
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
          {badge}
        </div>
      )}
    </div>
  );
}

export function AvatarGroup({ avatars, max = 3 }: { avatars: AvatarProps[]; max?: number }) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {displayAvatars.map((avatar, i) => (
        <div key={i} className="ring-2 ring-white">
          <Avatar {...avatar} size="sm" />
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 ring-2 ring-white">
          +{remaining}
        </div>
      )}
    </div>
  );
}
