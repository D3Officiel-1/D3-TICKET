
"use client"

import React, { useMemo } from 'react';
import { TicketConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TicketPreviewProps {
  config: TicketConfig;
  number: string | number;
  isPrintView?: boolean;
  onConfigChange?: (config: TicketConfig) => void;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({ config, number, isPrintView = false, onConfigChange }) => {
  const formattedNumber = String(number).padStart(5, '0');

  const displayImage = useMemo(() => {
    if (!config.backgroundImage) return null;
    return config.backgroundImage;
  }, [config.backgroundImage]);

  const handleTicketClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPrintView || !onConfigChange) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onConfigChange({
      ...config,
      numberX: Math.max(0, Math.min(100, x)),
      numberY: Math.max(0, Math.min(100, y))
    });
  };

  return (
    <div 
      className={cn(
        "relative inline-block bg-white border-2 overflow-hidden transition-all mx-auto",
        isPrintView 
          ? "w-full shadow-none border-dashed border-gray-400" 
          : "shadow-lg rounded-xl cursor-crosshair group"
      )}
      style={{ borderColor: config.color }}
      onClick={handleTicketClick}
    >
      {/* Background Image */}
      {displayImage ? (
        <img 
          src={displayImage} 
          alt="Background" 
          className="max-w-full h-auto block"
          loading="lazy"
        />
      ) : (
        /* Fallback if no image */
        <div className={cn("bg-muted/20", isPrintView ? "w-full h-[4.5cm]" : "w-[650px] h-[200px]")} />
      )}

      {/* Floating Number */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap pointer-events-none select-none flex flex-col items-center"
        style={{ 
          left: `${config.numberX}%`, 
          top: `${config.numberY}%`,
          color: config.color,
          fontSize: isPrintView ? '14pt' : '24pt',
          textShadow: '0 0 8px white, 0 0 8px white, 0 0 8px white'
        }}
      >
        <span>N° {formattedNumber}</span>
      </div>

      {/* Interactive Hint */}
      {!isPrintView && (
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
          <span className="bg-white/90 text-accent px-4 py-2 rounded-full font-bold shadow-lg border border-accent/20">
            Cliquez n'importe où pour placer le numéro
          </span>
        </div>
      )}
    </div>
  );
};
