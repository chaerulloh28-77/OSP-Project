import React from 'react';
import { getPriorityMeta, PriorityMeta, PRIORITY_TIERS } from '../utils/priorityHelpers';

export { getPriorityMeta, PRIORITY_TIERS };
export type { PriorityMeta };

interface PriorityBadgeProps {
  priority?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLevel?: boolean;
  showIcon?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'sm',
  showLevel = false,
  showIcon = true,
  interactive = false,
  onClick,
  className = '',
}) => {
  const meta = getPriorityMeta(priority);
  const Icon = meta.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const isHighTier = meta.level === 1;

  return (
    <span
      onClick={onClick}
      title={`${meta.tierName} - ${meta.description}`}
      className={`inline-flex items-center rounded-md font-semibold border transition-all duration-150 select-none ${meta.bgColor} ${meta.textColor} ${meta.borderColor} ${sizeClasses} ${
        interactive ? 'cursor-pointer hover:shadow-xs hover:scale-102 active:scale-98' : ''
      } ${className}`}
    >
      {/* High urgency pulsing indicator dot */}
      {isHighTier && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600" />
        </span>
      )}

      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}

      {showLevel && (
        <span className="font-mono text-[9px] uppercase px-1 py-0.2 rounded bg-black/10 text-current shrink-0">
          L{meta.level}
        </span>
      )}

      <span className="truncate">{meta.badgeLabel}</span>
    </span>
  );
};
