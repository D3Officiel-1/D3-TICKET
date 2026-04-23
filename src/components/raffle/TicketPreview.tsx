"use client"

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { TicketConfig, NumberingInstance, QRCodeInstance, DEFAULT_CONFIG } from '@/lib/types';
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
  const [dragTarget, setDragTarget] = useState<{ type: 'number' | 'qrcode', id: string } | null>(null);

  const numberings = config.numberings || DEFAULT_CONFIG.numberings;
  const qrCodes = config.qrCodes || DEFAULT_CONFIG.qrCodes;

  const displayValue = useMemo(() => {
    if (number !== undefined && number !== null && number !== "") {
      return String(number);
    }
    
    if (!isPrintView && config.fetchedCodes && config.fetchedCodes.length > 0) {
      return config.fetchedCodes[0];
    }
    
    return isPrintView ? "" : "00001";
  }, [number, isPrintView, config.fetchedCodes]);

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

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current || !onConfigChange || isVerso || !dragTarget) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    if (dragTarget.type === 'number') {
      const newNumberings = numberings.map(n => 
        n.id === dragTarget.id 
          ? { ...n, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
          : n
      );
      onConfigChange({ ...config, numberings: newNumberings });
    } else if (dragTarget.type === 'qrcode') {
      const newQRs = qrCodes.map(q => 
        q.id === dragTarget.id 
          ? { ...q, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
          : q
      );
      onConfigChange({ ...config, qrCodes: newQRs });
    }
  }, [config, onConfigChange, isVerso, dragTarget, numberings, qrCodes]);

  const handleMouseDown = (e: React.MouseEvent, type: 'number' | 'qrcode', id: string) => {
    if (isPrintView || !onConfigChange || isVerso) return;
    setDragTarget({ type, id });
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseUp = useCallback(() => {
    setDragTarget(null);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragTarget) return;
    updatePosition(e.clientX, e.clientY);
  }, [dragTarget, updatePosition]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!onConfigChange || isVerso || isPrintView) return;
    
    if (config.activeQRCodeId && (e.ctrlKey || e.metaKey)) {
      const currentQRs = qrCodes;
      const activeQR = currentQRs.find(q => q.id === config.activeQRCodeId);
      if (!activeQR) return;

      let updated = false;
      const newQRs = currentQRs.map(q => {
        if (q.id === config.activeQRCodeId) {
          if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            updated = true;
            return { ...q, size: (q.size || 40) + 2 };
          }
          if (e.key === '-') {
            e.preventDefault();
            updated = true;
            return { ...q, size: Math.max(10, (q.size || 40) - 2) };
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            updated = true;
            return { ...q, rotation: ((q.rotation || 0) - 5) % 360 };
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            updated = true;
            return { ...q, rotation: ((q.rotation || 0) + 5) % 360 };
          }
        }
        return q;
      });

      if (updated) {
        onConfigChange({ ...config, qrCodes: newQRs });
      }
    }
  }, [config, onConfigChange, isVerso, isPrintView, qrCodes]);

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

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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
              handleMouseDown(e, 'number', num.id);
            }}
            className={cn(
              "absolute font-bold whitespace-nowrap select-none z-20 origin-center transition-opacity",
              !isPrintView && "cursor-pointer pointer-events-auto",
              !isPrintView && config.activeNumberingId === num.id && "ring-2 ring-primary ring-offset-2 rounded-sm"
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

      {!isVerso && config.showQRCode && qrCodes.map((qr) => {
        // Remplacement dynamique des placeholders
        const qrContent = qr.content
          .replace("[NUM]", displayValue)
          .replace("[TYPE]", config.ticketType);
          
        const marginPx = (qr.margin || 0) * fontScaleFactor;
        
        return (
          <div 
            key={qr.id}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (isPrintView || !onConfigChange) return;
              onConfigChange({ ...config, activeQRCodeId: qr.id });
              handleMouseDown(e, 'qrcode', qr.id);
            }}
            className={cn(
              "absolute z-30 transition-opacity flex items-center justify-center box-border",
              !isPrintView && "cursor-move pointer-events-auto",
              !isPrintView && config.activeQRCodeId === qr.id && "ring-2 ring-primary ring-offset-2 rounded-sm"
            )}
            style={{
              left: `${qr.x}%`,
              top: `${qr.y}%`,
              transform: `translate(-50%, -50%) rotate(${qr.rotation || 0}deg)`,
              width: `${(qr.size || 40) * fontScaleFactor}px`,
              height: `${(qr.size || 40) * fontScaleFactor}px`,
              backgroundColor: qr.bgColor || "#FFFFFF",
              padding: `${marginPx}px`
            }}
          >
            <QRCodeCanvas 
              value={qrContent || " "} 
              size={(qr.size || 40) * (isPrintView ? 4 : 1)}
              style={{ width: '100%', height: '100%' }}
              level={qr.level || "H"}
              fgColor={qr.fgColor || "#000000"}
              bgColor={qr.bgColor || "#FFFFFF"}
            />
          </div>
        );
      })}
    </div>
  );
};
