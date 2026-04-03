
"use client"

import React from 'react';
import { TicketConfig } from '@/lib/types';
import { Star, Trophy, Calendar, MapPin, User, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        "relative flex w-full max-w-2xl bg-white border-2 overflow-hidden shadow-lg rounded-xl transition-all",
        isPrintView ? "shadow-none border-dashed border-gray-300" : "hover:scale-[1.01]"
      )}
      style={{ borderColor: config.color }}
    >
      {/* Left Stub */}
      <div className="w-1/4 flex flex-col items-center justify-center border-r-2 border-dashed p-4 bg-muted/20" style={{ borderColor: config.color }}>
        <div className="rotate-[-90deg] whitespace-nowrap flex items-center gap-2">
           <span className="font-bold text-xl" style={{ color: config.color }}>N° {formattedNumber}</span>
        </div>
        <div className="mt-8 flex flex-col items-center gap-1">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Souche</p>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
            <User className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>

      {/* Main Part */}
      <div className="flex-1 p-6 relative">
        <div className="absolute top-2 right-4 flex gap-1 opacity-20">
          <Star className="w-6 h-6 fill-current" style={{ color: config.color }} />
          <Star className="w-4 h-4 fill-current mt-2" style={{ color: config.color }} />
        </div>

        <div className="flex flex-col gap-3">
          <header className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold font-headline leading-tight" style={{ color: config.color }}>
                {config.title}
              </h3>
              <p className="text-sm font-medium flex items-center gap-1 text-muted-foreground mt-1">
                <User className="w-3 h-3" /> {config.organizer}
              </p>
            </div>
            <div className="text-right">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                Prix: {config.price}
              </span>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-accent" />
                <span>{new Date(config.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="line-clamp-1">{config.location}</span>
              </div>
            </div>
            <div className="bg-accent/5 p-3 rounded-lg border border-accent/10">
              <div className="flex items-center gap-2 mb-1 text-accent font-bold text-xs uppercase tracking-widest">
                <Trophy className="w-3 h-3" /> Lots à gagner
              </div>
              <ul className="text-[11px] list-disc list-inside">
                {config.prizes.map((p, i) => (
                  <li key={i} className="truncate">{p}</li>
                ))}
              </ul>
            </div>
          </div>

          <footer className="mt-4 pt-4 border-t flex justify-between items-end border-dashed">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 border border-gray-200">
                  LOGO
               </div>
               <p className="text-[10px] italic text-muted-foreground">Billet généré par D3 TOMBOLA</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Numéro de tirage</p>
              <p className="text-2xl font-black tabular-nums tracking-tighter" style={{ color: config.color }}>
                #{formattedNumber}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
