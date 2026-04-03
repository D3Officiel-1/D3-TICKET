
"use client"

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { TicketConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TicketPreviewProps {
  config: TicketConfig;
  number: string | number;
  isPrintView?: boolean;
  onConfigChange?: (config: TicketConfig) => void;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({ config, number, isPrintView = false, onConfigChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const formattedNumber = String(number).padStart(5, '0');

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !onConfigChange) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    onConfigChange({
      ...config,
      numberX: Math.max(0, Math.min(100, x)),
      numberY: Math.max(0, Math.min(100, y))
    });
  }, [config, onConfigChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPrintView || !onConfigChange) return;
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX, e.clientY);
  }, [isDragging, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const displayImage = useMemo(() => {
    if (!config.backgroundImage) return null;
    try {
      new URL(config.backgroundImage);
      return config.backgroundImage;
    } catch {
      return null;
    }
  }, [config.backgroundImage]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative inline-block bg-white border-2 overflow-hidden transition-shadow mx-auto",
        isPrintView 
          ? "w-full shadow-none border-dashed border-gray-400" 
          : "shadow-xl rounded-xl cursor-move group select-none",
        isDragging && "shadow-2xl scale-[1.02] transition-transform"
      )}
      style={{ borderColor: config.color }}
      onMouseDown={handleMouseDown}
    >
      {/* Background Image */}
      {displayImage ? (
        <img 
          src={displayImage} 
          alt="Background" 
          className="max-w-full h-auto block"
          draggable={false}
        />
      ) : (
        /* Fallback if no image */
        <div className={cn("bg-muted/20", isPrintView ? "w-full h-[4.5cm]" : "w-[650px] h-[200px]")} />
      )}

      {/* Floating Number */}
      <div 
        className={cn(
          "absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap pointer-events-none select-none flex flex-col items-center",
          isDragging && "opacity-80"
        )}
        style={{ 
          left: `${config.numberX}%`, 
          top: `${config.numberY}%`,
          color: config.color,
          fontSize: isPrintView ? '14pt' : '24pt',
          textShadow: '0 0 4px white, 0 0 4px white, 0 0 4px white, 0 0 4px white'
        }}
      >
        <span>N° {formattedNumber}</span>
      </div>

      {/* Interactive Hint */}
      {!isPrintView && !isDragging && (
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
          <span className="bg-white/90 text-accent px-4 py-2 rounded-full font-bold shadow-lg border border-accent/20">
            Maintenez et glissez pour déplacer le numéro
          </span>
        </div>
      )}
    </div>
  );
};
