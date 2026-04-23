
"use client"

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { TicketConfig, NumberingInstance, DEFAULT_CONFIG } from '@/lib/types';
import { cn } from '@/lib/utils';
import { QRCodeCanvas } from 'qrcode.react';

interface TicketPreviewProps {
  config: TicketConfig;
  number: string | number;
  isPrintView?: boolean;
  isVerso?: boolean;
  onConfigChange?: (config: TicketConfig) => void;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({ config, number, isPrintView = false, isVerso = false, onConfigChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragTarget, setDragTarget] = useState<'number' | 'qrcode' | null>(null);

  const numberings = config.numberings || DEFAULT_CONFIG.numberings;

  const displayValue = useMemo(() => {
    if (number === "") return "";
    const formattedNum = String(number).padStart(5, '0');
    return `${config.numberPrefix || ''}${formattedNum}${config.numberSuffix || ''}`;
  }, [number, config.numberPrefix, config.numberSuffix]);

  const qrValue = useMemo(() => {
    if (number === "") return config.qrCodeContent || "";
    const formattedNum = String(number).padStart(5, '0');
    return (config.qrCodeContent || "").replace("[NUM]", formattedNum);
  }, [number, config.qrCodeContent]);

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

  const fontScaleFactor = useMemo(() => {
    if (isPrintView) return 1;
    const wMm = config.ticketWidth || 140;
    const naturalWidthPx = wMm * 3.7795275591;
    const displayWidthPx = 550;
    return displayWidthPx / naturalWidthPx;
  }, [config.ticketWidth, isPrintView]);

  const detectBestColorForPoint = useCallback((num: NumberingInstance, img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);

    const x = Math.floor(num.x);
    const y = Math.floor(num.y);
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
    return avgLuminance > 128 ? "#000000" : "#FFFFFF";
  }, []);

  useEffect(() => {
    if (!isValidUrl || !imageUrl || isVerso || !onConfigChange) return;

    const needsAutoContrast = numberings.some(n => n.autoContrast || (n.autoContrast === undefined && config.autoContrast));
    if (!needsAutoContrast) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      let hasChanged = false;
      const newNumberings = numberings.map(n => {
        const shouldAuto = n.autoContrast || (n.autoContrast === undefined && config.autoContrast);
        if (shouldAuto) {
          const bestColor = detectBestColorForPoint(n, img);
          const currentColor = n.color || config.color;
          if (bestColor && bestColor !== currentColor) {
            hasChanged = true;
            return { ...n, color: bestColor, autoContrast: true };
          }
        }
        return n;
      });

      if (hasChanged) {
        onConfigChange({ ...config, numberings: newNumberings });
      }
    };
  }, [imageUrl, isValidUrl, isVerso, config, onConfigChange, numberings, detectBestColorForPoint]);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !onConfigChange || isVerso || !dragTarget) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    if (dragTarget === 'number' && config.showNumbering) {
      const newNumberings = numberings.map(n => 
        n.id === config.activeNumberingId 
          ? { ...n, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
          : n
      );
      onConfigChange({ ...config, numberings: newNumberings });
    } else if (dragTarget === 'qrcode' && config.showQRCode) {
      onConfigChange({ 
        ...config, 
        qrCodeX: Math.max(0, Math.min(100, x)), 
        qrCodeY: Math.max(0, Math.min(100, y)) 
      });
    }
  }, [config, onConfigChange, isVerso, dragTarget, numberings]);

  const handleMouseDown = (e: React.MouseEvent, target: 'number' | 'qrcode') => {
    if (isPrintView || !onConfigChange || isVerso) return;
    setDragTarget(target);
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseUp = useCallback(() => {
    setDragTarget(null);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragTarget) return;
    updatePosition(e.clientX, e.clientY);
  }, [dragTarget, updatePosition]);

  useEffect(() => {
    if (dragTarget) {
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
  }, [dragTarget, handleMouseMove, handleMouseUp]);

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
        dragTarget && "scale-[1.01] transition-transform z-50 ring-4 ring-primary/30"
      )}
      style={previewStyles}
      onMouseDown={(e) => {
        if (!dragTarget) handleMouseDown(e, 'number');
      }}
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

      {!isVerso && config.showNumbering && displayValue !== "" && numberings.map((num) => {
        const currentColor = num.color || config.color;
        const finalSize = num.size * fontScaleFactor;
        
        return (
          <div 
            key={num.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (isPrintView || !onConfigChange) return;
              onConfigChange({ ...config, activeNumberingId: num.id });
              handleMouseDown(e, 'number');
            }}
            className={cn(
              "absolute font-bold whitespace-nowrap select-none z-20 origin-center transition-opacity",
              !isPrintView && "cursor-pointer pointer-events-auto",
              dragTarget === 'number' && num.id === config.activeNumberingId ? "opacity-80" : "opacity-100",
              !isPrintView && num.id === config.activeNumberingId && "ring-2 ring-primary ring-offset-2 rounded-sm"
            )}
            style={{ 
              left: `${num.x}%`, 
              top: `${num.y}%`,
              transform: `translate(-50%, -50%) rotate(${num.rotation || 0}deg)`,
              color: currentColor,
              fontSize: `${finalSize}pt`,
              textShadow: currentColor === "#FFFFFF" 
                ? '0 0 3px black, 0 0 6px rgba(0,0,0,0.5)' 
                : '0 0 3px white, 0 0 6px rgba(255,255,255,0.5)'
            }}
          >
            {displayValue}
          </div>
        );
      })}

      {!isVerso && config.showQRCode && (
        <div 
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(e, 'qrcode');
          }}
          className={cn(
            "absolute z-30 transition-opacity",
            !isPrintView && "cursor-move pointer-events-auto",
            dragTarget === 'qrcode' ? "opacity-70" : "opacity-100",
            !isPrintView && "hover:ring-2 hover:ring-primary hover:ring-offset-2"
          )}
          style={{
            left: `${config.qrCodeX}%`,
            top: `${config.qrCodeY}%`,
            transform: `translate(-50%, -50%)`,
            width: `${(config.qrCodeSize || 40) * fontScaleFactor}px`,
            height: `${(config.qrCodeSize || 40) * fontScaleFactor}px`,
          }}
        >
          <QRCodeCanvas 
            value={qrValue} 
            size={(config.qrCodeSize || 40) * (isPrintView ? 4 : 1)} // Higher resolution for printing
            style={{ width: '100%', height: '100%' }}
            level="H"
          />
        </div>
      )}
    </div>
  );
};
