
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

  // Style dynamique selon le type de ticket pour l'aperçu
  const previewStyles = useMemo(() => {
    if (isPrintView) return {};
    
    // On garde un ratio fixe pour l'aperçu basé sur le type
    const ratio = config.ticketType === 'event' ? 7/10 : 5/10;
    const width = 600;
    return {
      width: `${width}px`,
      height: `${width * ratio}px`
    };
  }, [config.ticketType, isPrintView]);

  const fontSize = useMemo(() => {
    const base = config.numberSize || 24;
    // On ajuste la taille du texte pour l'impression (pt vs px)
    return isPrintView ? `${base * 0.75}pt` : `${base}pt`;
  }, [config.numberSize, isPrintView]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-white overflow-hidden",
        isPrintView 
          ? "w-full h-full" 
          : "shadow-2xl rounded-xl group select-none cursor-move",
        isDragging && "scale-[1.01] transition-transform z-50"
      )}
      style={previewStyles}
      onMouseDown={handleMouseDown}
    >
      {isValidUrl && imageUrl ? (
        <Image 
          src={imageUrl} 
          alt={isVerso ? "Verso" : "Recto"} 
          fill
          className="object-fill block"
          draggable={false}
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground font-bold text-sm h-full p-4 text-center">
          <p>{isVerso ? "Image du Verso" : "Image du Recto"}</p>
          <p className="text-[10px] font-normal mt-2 opacity-60">
            {config.ticketType === 'event' ? "Format Évènement (10x7cm)" : "Format Tombola (10x5cm)"}
          </p>
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
            textShadow: '0 0 4px white, 0 0 8px white, 1px 1px 0 white, -1px -1px 0 white'
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
