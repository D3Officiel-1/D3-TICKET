
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
          paddingY: '8.5mm',
          paddingX: '35mm'
        };
      case 'event':
        return {
          ticketsPerPage: 8,
          cols: 2,
          width: '100mm',
          height: '70mm',
          paddingY: '8.5mm',
          paddingX: '4mm' // Réduit de 5mm à 4mm pour éviter les rognages
        };
      case 'raffle':
      default:
        return {
          ticketsPerPage: 10,
          cols: 2,
          width: '100mm',
          height: '50mm',
          paddingY: '23.5mm',
          paddingX: '4mm' // Réduit de 5mm à 4mm pour éviter les rognages
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
            style={{ 
              paddingTop: layout.paddingY, 
              paddingBottom: layout.paddingY, 
              paddingLeft: layout.paddingX, 
              paddingRight: layout.paddingX 
            }}
          >
            {pageTickets.map((num, idx) => (
              <div 
                key={`recto-${num}-${idx}`} 
                style={{ 
                  width: layout.width, 
                  height: layout.height,
                  boxSizing: 'border-box'
                }}
                className="border-[0.3mm] border-dashed border-gray-500 box-border"
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
              style={{ 
                paddingTop: layout.paddingY, 
                paddingBottom: layout.paddingY, 
                paddingLeft: layout.paddingX, 
                paddingRight: layout.paddingX 
              }}
            >
              {pageTickets.map((num, idx) => (
                <div 
                  key={`verso-${pageIdx}-${idx}`} 
                  style={{ 
                    width: layout.width, 
                    height: layout.height,
                    boxSizing: 'border-box'
                  }}
                  className="border-[0.3mm] border-dashed border-gray-500 box-border"
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
