
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
  }, [config]);

  return (
    <div className="hidden print:block bg-white p-4">
      <div className="grid grid-cols-1 gap-4">
        {tickets.map((num, i) => (
          <div key={i} className="break-inside-avoid mb-4">
            <TicketPreview config={config} number={num} isPrintView={true} />
          </div>
        ))}
      </div>
    </div>
  );
};
