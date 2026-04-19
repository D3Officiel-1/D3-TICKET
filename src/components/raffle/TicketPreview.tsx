
"use client"

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { TicketConfig, NumberingInstance } from '@/lib/types';
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

    const activeNum = config.numberings.find(n => n.id === config.activeNumberingId);
    if (!activeNum) return;

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

      const x = Math.floor(activeNum.x);
      const y = Math.floor(activeNum.y);
      const sampleSize = 5;
      const data = ctx.getImageData(
        Math.max(0, x - sampleSize), 
        Math.max(0, y - sampleSize), 
        sampleSize * 2, 
        sampleSize * 2
      ).data;

      let totalLuminance = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalLuminance += (0.299 * r + 0.587 * g + 0.114 * b);
      }

      const avgLuminance = totalLuminance / (data.length / 4);
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
  }, [config.autoContrast, config.numberings, config.backgroundImage, detectBestColor]);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !onConfigChange || isVerso) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const newNumberings = config.numberings.map(n => 
      n.id === config.activeNumberingId 
        ? { ...n, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
        : n
    );

    onConfigChange({ ...config, numberings: newNumberings });
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
      const activeNum = config.numberings.find(n => n.id === config.activeNumberingId);
      if (!activeNum) return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=' || e.key === '-') {
          e.preventDefault();
          const step = 2;
          let newSize = activeNum.size;
          if (e.key === '+' || e.key === '=') newSize = Math.min(150, activeNum.size + step);
          else if (e.key === '-') newSize = Math.max(6, activeNum.size - step);
          
          if (newSize !== activeNum.size) {
            const newNumberings = config.numberings.map(n => n.id === activeNum.id ? { ...n, size: newSize } : n);
            onConfigChange({ ...config, numberings: newNumberings });
          }
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const step = 5;
          let newRotation = activeNum.rotation;
          if (e.key === 'ArrowRight') newRotation = (activeNum.rotation + step) % 360;
          else if (e.key === 'ArrowLeft') newRotation = (activeNum.rotation - step + 360) % 360;
          
          if (newRotation !== activeNum.rotation) {
            const newNumberings = config.numberings.map(n => n.id === activeNum.id ? { ...n, rotation: newRotation } : n);
            onConfigChange({ ...config, numberings: newNumberings });
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
    if (isPrintView) return { width: '100%', height: '100%' };
    const w = config.ticketWidth || 140;
    const h = config.ticketHeight || 70;
    const ratio = h / w;
    const maxWidth = 550;
    return { width: `${maxWidth}px`, height: `${maxWidth * ratio}px` };
  }, [config.ticketWidth, config.ticketHeight, isPrintView]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-white overflow-hidden transition-all duration-300",
        isPrintView ? "" : "shadow-2xl rounded-xl group select-none cursor-move",
        isDragging && "scale-[1.01] transition-transform z-50 ring-4 ring-primary/30"
      )}
      style={previewStyles}
      onMouseDown={handleMouseDown}
    >
      {isValidUrl && imageUrl ? (
        <img 
          src={imageUrl} 
          alt={isVerso ? "Verso" : "Recto"} 
          className="absolute inset-0 w-full h-full object-fill block"
          draggable={false}
          crossOrigin="anonymous"
        />
      ) : (
        <div className="absolute inset-0 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground font-bold text-sm h-full p-4 text-center">
          <p>{isVerso ? "Design du Verso" : "Design du Recto"}</p>
          <p className="text-[10px] font-normal mt-2 opacity-60">{config.ticketWidth}mm x {config.ticketHeight}mm</p>
        </div>
      )}

      {!isVerso && displayValue !== "" && config.numberings.map((num) => (
        <div 
          key={num.id}
          onClick={(e) => {
            if (isPrintView || !onConfigChange) return;
            e.stopPropagation();
            onConfigChange({ ...config, activeNumberingId: num.id });
          }}
          className={cn(
            "absolute font-bold whitespace-nowrap select-none z-20 origin-center transition-opacity",
            !isPrintView && "cursor-pointer pointer-events-auto",
            isDragging && num.id === config.activeNumberingId ? "opacity-80" : "opacity-100",
            !isPrintView && num.id === config.activeNumberingId && "ring-2 ring-primary ring-offset-2 rounded-sm"
          )}
          style={{ 
            left: `${num.x}%`, 
            top: `${num.y}%`,
            transform: `translate(-50%, -50%) rotate(${num.rotation || 0}deg)`,
            color: config.color,
            fontSize: isPrintView ? `${num.size * 0.75}pt` : `${num.size}pt`,
            textShadow: config.color === "#FFFFFF" 
              ? '0 0 3px black, 0 0 6px rgba(0,0,0,0.5)' 
              : '0 0 3px white, 0 0 6px rgba(255,255,255,0.5)'
          }}
        >
          {displayValue}
        </div>
      ))}

      {!isPrintView && !isVerso && !isDragging && (
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <span className="bg-white/95 text-accent px-4 py-2 rounded-full font-bold shadow-lg border border-accent/20">
              Format: {config.ticketWidth}x{config.ticketHeight}mm
            </span>
            <div className="flex flex-wrap justify-center gap-1">
              <span className="bg-primary/95 text-white text-[11px] px-3 py-1 rounded-full font-bold shadow-md">Ctrl + / - : Taille</span>
              <span className="bg-accent/95 text-white text-[11px] px-3 py-1 rounded-full font-bold shadow-md">Ctrl + ← → : Rotation</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
