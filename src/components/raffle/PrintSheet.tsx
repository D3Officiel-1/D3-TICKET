
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

  const layout = useMemo(() => {
    switch (config.ticketType) {
      case 'event_vip':
        return {
          ticketsPerPage: 4,
          cols: 1,
          width: '140mm',
          height: '70mm',
          // Centrage sur A4 (210x297)
          // 210 - 140 = 70 / 2 = 35mm de marge latérale
          // 297 - (4*70) = 17 / 2 = 8.5mm de marge haut/bas
          paddingY: '8.5mm',
          paddingX: '35mm'
        };
      case 'event':
        return {
          ticketsPerPage: 8,
          cols: 2,
          width: '100mm',
          height: '70mm',
          // 210 - (2*100) = 10 / 2 = 5mm de marge latérale
          // 297 - (4*70) = 17 / 2 = 8.5mm de marge haut/bas
          paddingY: '8.5mm',
          paddingX: '5mm'
        };
      case 'raffle':
      default:
        return {
          ticketsPerPage: 10,
          cols: 2,
          width: '100mm',
          height: '50mm',
          // 210 - (2*100) = 10 / 2 = 5mm de marge latérale
          // 297 - (5*50) = 47 / 2 = 23.5mm de marge haut/bas
          paddingY: '23.5mm',
          paddingX: '5mm'
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
            className="page-break-after h-[297mm] w-[210mm] flex flex-wrap content-start items-start justify-center"
            style={{ paddingTop: layout.paddingY, paddingBottom: layout.paddingY, paddingLeft: layout.paddingX, paddingRight: layout.paddingX }}
          >
            {pageTickets.map((num) => (
              <div 
                key={`recto-${num}`} 
                style={{ 
                  width: layout.width, 
                  height: layout.height,
                  boxSizing: 'border-box'
                }}
                className="border-[0.1mm] border-dashed border-gray-300 overflow-hidden"
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
              className="page-break-after h-[297mm] w-[210mm] flex flex-wrap content-start items-start justify-center"
              style={{ paddingTop: layout.paddingY, paddingBottom: layout.paddingY, paddingLeft: layout.paddingX, paddingRight: layout.paddingX }}
            >
              {pageTickets.map((num) => (
                <div 
                  key={`verso-${num}`} 
                  style={{ 
                    width: layout.width, 
                    height: layout.height,
                    boxSizing: 'border-box'
                  }}
                  className="border-[0.1mm] border-dashed border-gray-300 overflow-hidden"
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
