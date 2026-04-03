
"use client"

import React from 'react';
import { TicketConfig } from '@/lib/types';
import { Star, Trophy, Calendar, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TicketPreviewProps {
  config: TicketConfig;
  number: string | number;
  isPrintView?: boolean;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({ config, number, isPrintView = false }) => {
  const formattedNumber = String(number).padStart(5, '0');

  return (
    <div 
      className={cn(
        "relative flex w-full bg-white border-2 overflow-hidden transition-all",
        isPrintView 
          ? "shadow-none border-dashed border-gray-400 h-[4.5cm]" 
          : "max-w-2xl shadow-lg rounded-xl hover:scale-[1.01]"
      )}
      style={{ borderColor: config.color }}
    >
      {/* Background Image Overlay */}
      {config.backgroundImage && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image 
            src={config.backgroundImage} 
            alt="Background" 
            fill 
            className="object-cover"
          />
        </div>
      )}

      {/* Left Stub (Souche) */}
      <div 
        className={cn(
          "flex flex-col items-center justify-center border-r-2 border-dashed bg-muted/20 relative z-10",
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

      {/* Main Part */}
      <div className={cn("flex-1 relative z-10", isPrintView ? "p-3" : "p-6")}>
        {!isPrintView && (
          <div className="absolute top-2 right-4 flex gap-1 opacity-20">
            <Star className="w-6 h-6 fill-current" style={{ color: config.color }} />
            <Star className="w-4 h-4 fill-current mt-2" style={{ color: config.color }} />
          </div>
        )}

        <div className="flex flex-col h-full justify-between">
          <header className="flex justify-between items-start">
            <div className="max-w-[70%]">
              <h3 
                className={cn(
                  "font-bold font-headline leading-tight truncate drop-shadow-sm", 
                  isPrintView ? "text-sm" : "text-2xl"
                )} 
                style={{ color: config.color }}
              >
                {config.title}
              </h3>
              <p className={cn("font-medium flex items-center gap-1 text-muted-foreground", isPrintView ? "text-[10px]" : "text-sm mt-1")}>
                <User className="w-3 h-3" /> {config.organizer}
              </p>
            </div>
            <div className="text-right">
              <span className={cn("bg-primary text-white rounded-full font-bold shadow-sm", isPrintView ? "px-1.5 py-0.5 text-[9px]" : "px-3 py-1 text-sm")}>
                {config.price}
              </span>
            </div>
          </header>

          <div className={cn("grid gap-2", isPrintView ? "grid-cols-1" : "grid-cols-2 mt-2")}>
            <div className="flex flex-col gap-1">
              <div className={cn("flex items-center gap-2", isPrintView ? "text-[9px]" : "text-sm")}>
                <Calendar className={cn("text-accent", isPrintView ? "w-3 h-3" : "w-4 h-4")} />
                <span>{new Date(config.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className={cn("flex items-center gap-2", isPrintView ? "text-[9px]" : "text-sm")}>
                <MapPin className={cn("text-accent", isPrintView ? "w-3 h-3" : "w-4 h-4")} />
                <span className="line-clamp-1">{config.location}</span>
              </div>
            </div>
            
            <div className={cn("bg-accent/5 rounded-lg border border-accent/10 backdrop-blur-[1px]", isPrintView ? "p-1.5" : "p-3")}>
              <div className={cn("flex items-center gap-2 mb-0.5 text-accent font-bold uppercase tracking-widest", isPrintView ? "text-[8px]" : "text-xs")}>
                <Trophy className={cn(isPrintView ? "w-2.5 h-2.5" : "w-3 h-3")} /> Lots
              </div>
              <ul className={cn("list-none", isPrintView ? "text-[8px] leading-tight" : "text-[11px] list-disc list-inside")}>
                {config.prizes.slice(0, isPrintView ? 2 : 3).map((p, i) => (
                  <li key={i} className="truncate">• {p}</li>
                ))}
                {isPrintView && config.prizes.length > 2 && <li className="italic text-[7px]">...et plus</li>}
              </ul>
            </div>
          </div>

          <footer className={cn("flex justify-between items-end border-dashed", isPrintView ? "mt-1 pt-1 border-t" : "mt-4 pt-4 border-t")}>
            <div className="flex items-center gap-1.5">
               <div className={cn("rounded bg-gray-100/80 flex items-center justify-center text-gray-400 border border-gray-200", isPrintView ? "w-5 h-5 text-[7px]" : "w-8 h-8 text-[10px]")}>
                  L
               </div>
               {!isPrintView && <p className="text-[10px] italic text-muted-foreground">Généré par D3 TOMBOLA</p>}
            </div>
            <div className="flex flex-col items-end">
              <p className={cn("text-muted-foreground uppercase tracking-widest font-bold", isPrintView ? "text-[7px]" : "text-[10px]")}>Tirage</p>
              <p 
                className={cn("font-black tabular-nums tracking-tighter drop-shadow-sm", isPrintView ? "text-lg leading-none" : "text-2xl")} 
                style={{ color: config.color }}
              >
                #{formattedNumber}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
