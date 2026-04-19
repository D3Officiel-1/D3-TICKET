
"use client"

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { TicketConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TicketPreviewProps {
  config: TicketConfig;
  number: string | number;
  isPrintView?: boolean;
  isVerso?: boolean;
  onConfigChange?: (config: TicketConfig) => void;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({ config, number, isPrintView = false, isVerso = false, onConfigChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Formatting logic: Prefix + PaddedNumber + Suffix
  const displayValue = useMemo(() => {
    if (number === "") return "";
    const formattedNum = String(number).padStart(5, '0');
    return `${config.numberPrefix || ''}${formattedNum}${config.numberSuffix || ''}`;
  }, [number, config.numberPrefix, config.numberSuffix]);

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

  const detectBestColor = useCallback(() => {
    if (!isValidUrl || !imageUrl || isVerso || !onConfigChange || !config.autoContrast) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 100;
      canvas.height = 100;

      ctx.drawImage(img, 0, 0, 100, 100);

      const x = Math.floor(config.numberX);
      const y = Math.floor(config.numberY);

      // Sample a small area around the number position
      const sampleSize = 5;
      const data = ctx.getImageData(
        Math.max(0, x - sampleSize), 
        Math.max(0, y - sampleSize), 
        sampleSize * 2, 
        sampleSize * 2
      ).data;

      let totalLuminance = 0;
      for (let i = 0; i < data.length; i += 4) {
        // Luminance calculation: 0.299R + 0.587G + 0.114B
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalLuminance += (0.299 * r + 0.587 * g + 0.114 * b);
      }

      const avgLuminance = totalLuminance / (data.length / 4);
      
      // If dark background, use white. If light background, use black.
      const bestColor = avgLuminance > 128 ? "#000000" : "#FFFFFF";
      
      if (config.color !== bestColor) {
        onConfigChange({ ...config, color: bestColor });
      }
    };
  }, [imageUrl, isValidUrl, isVerso, config, onConfigChange]);

  useEffect(() => {
    if (config.autoContrast) {
      detectBestColor();
    }
  }, [config.autoContrast, config.numberX, config.numberY, config.backgroundImage, detectBestColor]);

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
        // Handle Size (+ / -)
        if (e.key === '+' || e.key === '=' || e.key === '-') {
          e.preventDefault();
          const step = 2;
          const currentSize = config.numberSize || 24;
          let newSize = currentSize;

          if (e.key === '+' || e.key === '=') {
            newSize = Math.min(150, currentSize + step);
          } else if (e.key === '-') {
            newSize = Math.max(6, currentSize - step);
          }

          if (newSize !== currentSize) {
            onConfigChange({ ...config, numberSize: newSize });
          }
        }

        // Handle Rotation (Left / Right)
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const step = 5; // Degrees
          const currentRotation = config.numberRotation || 0;
          let newRotation = currentRotation;

          if (e.key === 'ArrowRight') {
            newRotation = (currentRotation + step) % 360;
          } else if (e.key === 'ArrowLeft') {
            newRotation = (currentRotation - step + 360) % 360;
          }

          if (newRotation !== currentRotation) {
            onConfigChange({ ...config, numberRotation: newRotation });
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

  const previewStyles = useMemo(() => {
    if (isPrintView) return {
      width: '100%',
      height: '100%'
    };
    
    // Aspect ratios based on manual or preset dimensions
    const ratio = (config.ticketHeight || 70) / (config.ticketWidth || 140);
    const maxWidth = 600;
    
    return {
      width: `${maxWidth}px`,
      height: `${maxWidth * ratio}px`
    };
  }, [config.ticketWidth, config.ticketHeight, isPrintView]);

  const fontSize = useMemo(() => {
    const base = config.numberSize || 24;
    // Sur l'impression, on convertit les points en fonction de la taille réelle si nécessaire
    // Ici on garde une proportionnelle standard pour la lisibilité
    return isPrintView ? `${base * 0.75}pt` : `${base}pt`;
  }, [config.numberSize, isPrintView]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-white overflow-hidden",
        isPrintView 
          ? "" 
          : "shadow-2xl rounded-xl group select-none cursor-move",
        isDragging && "scale-[1.01] transition-transform z-50 ring-4 ring-primary/30"
      )}
      style={previewStyles}
      onMouseDown={handleMouseDown}
    >
      {isValidUrl && imageUrl ? (
        <img 
          ref={imageRef}
          src={imageUrl} 
          alt={isVerso ? "Verso" : "Recto"} 
          className="absolute inset-0 w-full h-full object-fill block"
          draggable={false}
          crossOrigin="anonymous"
        />
      ) : (
        <div className="absolute inset-0 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground font-bold text-sm h-full p-4 text-center">
          <p>{isVerso ? "Design du Verso" : "Design du Recto"}</p>
          <p className="text-[10px] font-normal mt-2 opacity-60">
            {config.ticketWidth}mm x {config.ticketHeight}mm
          </p>
        </div>
      )}

      {!isVerso && displayValue !== "" && (
        <div 
          className={cn(
            "absolute font-bold whitespace-nowrap pointer-events-none select-none z-20 origin-center",
            isDragging && "opacity-80"
          )}
          style={{ 
            left: `${config.numberX}%`, 
            top: `${config.numberY}%`,
            transform: `translate(-50%, -50%) rotate(${config.numberRotation || 0}deg)`,
            color: config.color,
            fontSize: fontSize,
            textShadow: config.color === "#FFFFFF" 
              ? '0 0 3px black, 0 0 6px rgba(0,0,0,0.5)' 
              : '0 0 3px white, 0 0 6px rgba(255,255,255,0.5)'
          }}
        >
          {displayValue}
        </div>
      )}

      {!isPrintView && !isVerso && !isDragging && (
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <span className="bg-white/95 text-accent px-4 py-2 rounded-full font-bold shadow-lg border border-accent/20">
              Glissez pour placer le numéro
            </span>
            <div className="flex flex-wrap justify-center gap-1">
              <span className="bg-primary/95 text-white text-[11px] px-3 py-1 rounded-full font-bold shadow-md">
                Ctrl + / - : Taille
              </span>
              <span className="bg-accent/95 text-white text-[11px] px-3 py-1 rounded-full font-bold shadow-md">
                Ctrl + ← → : Rotation
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
