
"use client"

import React, { useMemo } from 'react';
import { TicketConfig } from '@/lib/types';
import { TicketPreview } from './TicketPreview';

interface PrintSheetProps {
  config: TicketConfig;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ config }) => {
  const tickets = useMemo(() => {
    const list = [];
    if (config.generationMode === 'sequential') {
      for (let i = 0; i < config.quantity; i++) {
        list.push(config.startingNumber + i);
      }
    } else {
      const uniqueRandoms = new Set<number>();
      while (uniqueRandoms.size < config.quantity) {
        uniqueRandoms.add(Math.floor(Math.random() * 99999) + 1);
      }
      list.push(...Array.from(uniqueRandoms));
    }
    return list;
  }, [config.quantity, config.startingNumber, config.generationMode]);

  return (
    <div className="hidden print:block bg-white p-0">
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {tickets.map((num, i) => (
          <React.Fragment key={i}>
            {/* Recto */}
            <div className="break-inside-avoid">
              <TicketPreview config={config} number={num} isPrintView={true} />
            </div>
            
            {/* Si verso activé, on peut choisir de l'imprimer immédiatement après ou gérer autrement.
                Ici, on l'ajoute pour chaque ticket pour une impression recto/verso simplifiée */}
            {config.hasVerso && (
              <div className="break-inside-avoid">
                <TicketPreview config={config} number="" isPrintView={true} isVerso={true} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
