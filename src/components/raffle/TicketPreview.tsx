
"use client"

import React, { useMemo } from 'react';
import { TicketConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TicketPreviewProps {
  config: TicketConfig;
  number: string | number;
  isPrintView?: boolean;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({ config, number, isPrintView = false }) => {
  const formattedNumber = String(number).padStart(5, '0');

  const displayImage = useMemo(() => {
    if (!config.backgroundImage) return null;
    
    if (config.backgroundImage.startsWith('http')) {
      try {
        new URL(config.backgroundImage);
        return config.backgroundImage;
      } catch {
        return null;
      }
    }
    
    return config.backgroundImage;
  }, [config.backgroundImage]);

  return (
    <div 
      className={cn(
        "relative flex bg-white border-2 overflow-hidden transition-all mx-auto",
        isPrintView 
          ? "w-full shadow-none border-dashed border-gray-400" 
          : "w-[650px] max-w-full shadow-lg rounded-xl hover:scale-[1.01]"
      )}
      style={{ borderColor: config.color }}
    >
      {/* Background Image - This now defines the height of the parent div */}
      {displayImage ? (
        <img 
          src={displayImage} 
          alt="Background" 
          className="w-full h-auto block"
          loading="lazy"
        />
      ) : (
        /* Fallback if no image */
        <div className={cn("w-full bg-muted/20", isPrintView ? "h-[4.5cm]" : "h-[200px]")} />
      )}

      {/* Left Stub (Souche) - Absolute to stay on top and match height automatically */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 flex flex-col items-center justify-center border-r-2 border-dashed bg-white/80 backdrop-blur-sm z-10",
          isPrintView ? "w-16 p-1" : "w-1/4 p-4"
        )} 
        style={{ borderColor: config.color }}
      >
        <div className="rotate-[-90deg] whitespace-nowrap flex items-center gap-2">
           <span className={cn("font-bold", isPrintView ? "text-sm" : "text-xl")} style={{ color: config.color }}>
            N° {formattedNumber}
           </span>
        </div>
      </div>
    </div>
  );
};
