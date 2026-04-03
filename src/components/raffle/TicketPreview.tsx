
"use client"

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { TicketConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TicketPreviewProps {
  config: TicketConfig;
  number: string | number;
  isPrintView?: boolean;
  isVerso?: boolean;
  onConfigChange?: (config: TicketConfig) => void;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({ config, number, isPrintView = false, isVerso = false, onConfigChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const formattedNumber = String(number).padStart(5, '0');

  const imageUrl = isVerso ? config.versoBackgroundImage : config.backgroundImage;

  const isValidUrl = useMemo(() => {
    if (!imageUrl) return false;
    try {
      new URL(imageUrl);
      return true;
    } catch {
      return false;
    }
  }, [imageUrl]);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !onConfigChange || isVerso) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    onConfigChange({
      ...config,
      numberX: Math.max(0, Math.min(100, x)),
      numberY: Math.max(0, Math.min(100, y))
    });
  }, [config, onConfigChange, isVerso]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPrintView || !onConfigChange || isVerso) return;
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
    if (isPrintView || !onConfigChange || isVerso) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=' || e.key === '-') {
          e.preventDefault();
          const step = 2;
          const currentSize = config.numberSize || 24;
          let newSize = currentSize;

          if (e.key === '+' || e.key === '=') {
            newSize = Math.min(120, currentSize + step);
          } else if (e.key === '-') {
            newSize = Math.max(8, currentSize - step);
          }

          if (newSize !== currentSize) {
            onConfigChange({ ...config, numberSize: newSize });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, onConfigChange, isPrintView, isVerso]);

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

  const fontSize = useMemo(() => {
    const base = config.numberSize || 24;
    return isPrintView ? `${base * 0.75}pt` : `${base}pt`;
  }, [config.numberSize, isPrintView]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-white transition-shadow mx-auto",
        isPrintView 
          ? "w-full border-2 border-dashed border-gray-300" 
          : "shadow-xl rounded-xl group select-none overflow-hidden",
        !isVerso && !isPrintView && "cursor-move",
        isDragging && "shadow-2xl scale-[1.01] transition-transform"
      )}
      style={{ 
        width: isPrintView ? '100%' : '650px',
        aspectRatio: '650/200' 
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Background Image */}
      {isValidUrl && imageUrl ? (
        <Image 
          src={imageUrl} 
          alt={isVerso ? "Verso" : "Recto"} 
          fill
          className="object-cover"
          draggable={false}
          unoptimized
        />
      ) : (
        /* Fallback if no image */
        <div className="absolute inset-0 bg-muted/20 flex items-center justify-center text-muted-foreground font-bold text-sm">
          {isVerso ? "Image du Verso manquante" : "Ajoutez une image de fond"}
        </div>
      )}

      {/* Floating Number (Only on Recto) */}
      {!isVerso && number !== "" && (
        <div 
          className={cn(
            "absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap pointer-events-none select-none",
            isDragging && "opacity-80"
          )}
          style={{ 
            left: `${config.numberX}%`, 
            top: `${config.numberY}%`,
            color: config.color,
            fontSize: fontSize,
            textShadow: '2px 2px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 0 2px 0 white, 0 -2px 0 white, 2px 0 0 white, -2px 0 0 white'
          }}
        >
          N° {formattedNumber}
        </div>
      )}

      {/* Interactive Hint */}
      {!isPrintView && !isVerso && !isDragging && (
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <span className="bg-white/90 text-accent px-4 py-2 rounded-full font-bold shadow-lg border border-accent/20">
              Glissez pour placer le numéro
            </span>
            <span className="bg-primary/90 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-md">
              Ctrl + / - pour la taille
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
