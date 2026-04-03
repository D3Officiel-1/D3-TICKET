
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

  // Grouper les tickets par page de 4 pour un alignement parfait (Format A4)
  const TICKETS_PER_PAGE = 4;
  const pages = useMemo(() => {
    const p = [];
    for (let i = 0; i < tickets.length; i += TICKETS_PER_PAGE) {
      p.push(tickets.slice(i, i + TICKETS_PER_PAGE));
    }
    return p;
  }, [tickets]);

  return (
    <div className="hidden print:block bg-white w-[210mm] mx-auto">
      {/* SECTION RECTOS : Toutes les faces avant d'abord */}
      <div className="rectos-section">
        {pages.map((pageTickets, pageIdx) => (
          <div key={`recto-page-${pageIdx}`} className="page-break-after h-[297mm] py-[10mm] px-[10mm] flex flex-col items-center gap-[5mm]">
            {pageTickets.map((num, i) => (
              <div key={`recto-${num}`} className="w-[190mm] h-[65mm] border border-gray-100 overflow-hidden">
                <TicketPreview config={config} number={num} isPrintView={true} isVerso={false} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* SECTION VERSOS : Toutes les faces arrière en dernier */}
      {config.hasVerso && (
        <div className="versos-section">
          {pages.map((pageTickets, pageIdx) => (
            <div key={`verso-page-${pageIdx}`} className="page-break-after h-[297mm] py-[10mm] px-[10mm] flex flex-col items-center gap-[5mm]">
              {pageTickets.map((num, i) => (
                <div key={`verso-${num}`} className="w-[190mm] h-[65mm] border border-gray-100 overflow-hidden">
                  <TicketPreview config={config} number="" isPrintView={true} isVerso={true} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
