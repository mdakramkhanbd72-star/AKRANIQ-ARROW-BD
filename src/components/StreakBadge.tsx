import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streakDays: number;
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streakDays,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur shadow-sm border border-stone-200/50 dark:border-stone-700/50 ${className}`}
    >
      <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
        {streakDays}
      </span>
    </div>
  );
};
