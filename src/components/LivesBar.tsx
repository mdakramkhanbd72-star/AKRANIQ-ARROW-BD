import React from 'react';
import { Heart } from 'lucide-react';
import { MAX_LIVES } from '../core/constants';

interface LivesBarProps {
  lives: number;
  maxLives?: number;
  className?: string;
}

export const LivesBar: React.FC<LivesBarProps> = ({
  lives,
  maxLives = MAX_LIVES,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur shadow-sm border border-stone-200/50 dark:border-stone-700/50 ${className}`}
    >
      {Array.from({ length: maxLives }, (_, i) => {
        const isFilled = i < lives;
        return (
          <Heart
            key={i}
            className={`w-4 h-4 transition-all duration-300 ${
              isFilled
                ? 'fill-red-500 text-red-500 scale-100 drop-shadow-sm'
                : 'text-stone-300 dark:text-stone-600 scale-90'
            }`}
          />
        );
      })}
    </div>
  );
};
