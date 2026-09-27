import React from 'react';

export const MazeBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-stone-500/5 ${className}`}
    />
  );
};
