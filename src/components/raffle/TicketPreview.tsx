
"use client"

import React, { useMemo } from 'react';
import { TicketConfig } from '@/lib/types';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TicketPreviewProps {
  config: TicketConfig;
  number: string | number;
  isPrintView?: boolean;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({ config, number, isPrintView = false }) => {
  const formattedNumber = String(number).padStart(5, '0');

  // Simple validation to prevent Next.js Image from crashing on malformed URLs while typing
  const displayImage = useMemo(() => {
    if (!config.backgroundImage) return null;
    
    // If it's an external URL, check if it's at least potentially valid
    if (config.backgroundImage.startsWith('http')) {
      try {
        new URL(config.backgroundImage);
        return config.backgroundImage;
      } catch {
        return null; // Don't render if it's a malformed URL
      }
    }
    
    return config.backgroundImage;
  }, [config.backgroundImage]);

  return (
    <div 
      className={cn(
        "relative flex bg-white border-2 overflow-hidden transition-all mx-auto",
        isPrintView 
          ? "w-full shadow-none border-dashed border-gray-400 h-[4.5cm]" 
          : "w-[650px] h-[200px] max-w-full shadow-lg rounded-xl hover:scale-[1.01]"
      )}
      style={{ borderColor: config.color }}
    >
      {/* Background Image Overlay - 100% opacity as requested */}
      {displayImage && (
        <div className="absolute inset-0 opacity-100 pointer-events-none">
          <Image 
            src={displayImage} 
            alt="Background" 
            fill 
            className="object-cover"
            unoptimized={true}
          />
        </div>
      )}

      {/* Left Stub (Souche) - Ensures full height with white backdrop for readability */}
      <div 
        className={cn(
          "flex flex-col items-center justify-center border-r-2 border-dashed bg-white/80 backdrop-blur-sm relative z-10 h-full",
          isPrintView ? "w-16 p-1" : "w-1/4 p-4"
        )} 
        style={{ borderColor: config.color }}
      >
        <div className="rotate-[-90deg] whitespace-nowrap flex items-center gap-2">
           <span className={cn("font-bold", isPrintView ? "text-sm" : "text-xl")} style={{ color: config.color }}>
            N° {formattedNumber}
           </span>
        </div>
        {!isPrintView && (
          <div className="mt-8 flex flex-col items-center gap-1">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Souche</p>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Main Part - Content area is empty to let the background image show through fully */}
      <div className={cn("flex-1 relative z-10 h-full", isPrintView ? "p-3" : "p-6")}>
        {/* L'image de fond contient déjà tous les textes et détails */}
      </div>
    </div>
  );
};
