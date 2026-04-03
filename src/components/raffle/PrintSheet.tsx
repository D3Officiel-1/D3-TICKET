
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

  // Dimensions et mise en page selon le type
  const layout = useMemo(() => {
    if (config.ticketType === 'event') {
      return {
        ticketsPerPage: 8,
        cols: 2,
        width: '100mm',
        height: '70mm',
        gap: '0mm'
      };
    } else {
      return {
        ticketsPerPage: 10,
        cols: 2,
        width: '100mm',
        height: '50mm',
        gap: '0mm'
      };
    }
  }, [config.ticketType]);

  const pages = useMemo(() => {
    const p = [];
    for (let i = 0; i < tickets.length; i += layout.ticketsPerPage) {
      p.push(tickets.slice(i, i + layout.ticketsPerPage));
    }
    return p;
  }, [tickets, layout.ticketsPerPage]);

  return (
    <div className="hidden print:block bg-white w-[210mm] mx-auto">
      {/* SECTION RECTOS */}
      <div className="rectos-section">
        {pages.map((pageTickets, pageIdx) => (
          <div 
            key={`recto-page-${pageIdx}`} 
            className="page-break-after h-[297mm] w-[210mm] flex flex-wrap content-start items-start justify-center py-[5mm] px-[5mm]"
          >
            {pageTickets.map((num) => (
              <div 
                key={`recto-${num}`} 
                style={{ width: layout.width, height: layout.height }}
                className="border-[0.1mm] border-gray-100 overflow-hidden"
              >
                <TicketPreview config={config} number={num} isPrintView={true} isVerso={false} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* SECTION VERSOS */}
      {config.hasVerso && (
        <div className="versos-section">
          {pages.map((pageTickets, pageIdx) => (
            <div 
              key={`verso-page-${pageIdx}`} 
              className="page-break-after h-[297mm] w-[210mm] flex flex-wrap content-start items-start justify-center py-[5mm] px-[5mm]"
            >
              {/* Note: Pour un alignement parfait au dos, on pourrait devoir inverser l'ordre des colonnes 
                  mais comme on utilise 2 colonnes identiques (100mm x 2), l'inversion est transparente */}
              {pageTickets.map((num) => (
                <div 
                  key={`verso-${num}`} 
                  style={{ width: layout.width, height: layout.height }}
                  className="border-[0.1mm] border-gray-100 overflow-hidden"
                >
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
