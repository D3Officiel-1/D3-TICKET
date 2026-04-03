
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
      // Use a fixed seed or reference to avoid hydration mismatch if needed, 
      // but for print sheet generated on client it's fine.
      while (uniqueRandoms.size < config.quantity) {
        uniqueRandoms.add(Math.floor(Math.random() * 99999) + 1);
      }
      list.push(...Array.from(uniqueRandoms));
    }
    return list;
  }, [config.quantity, config.startingNumber, config.generationMode]);

  return (
    <div className="hidden print:block bg-white p-0">
      <div className="grid grid-cols-2 gap-2">
        {tickets.map((num, i) => (
          <div key={i} className="break-inside-avoid mb-1">
            <TicketPreview config={config} number={num} isPrintView={true} />
          </div>
        ))}
      </div>
    </div>
  );
};
