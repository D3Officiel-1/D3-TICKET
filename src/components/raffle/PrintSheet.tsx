
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
    const w = config.ticketWidth || 140;
    const h = config.ticketHeight || 70;

    // Dimensions d'une page A4 en mm
    const pageW = 210;
    const pageH = 297;

    // Calcul dynamique du nombre de tickets par ligne et par colonne
    const cols = Math.floor(pageW / w) || 1;
    const rows = Math.floor(pageH / h) || 1;
    const ticketsPerPage = cols * rows;

    return {
      ticketsPerPage,
      cols,
      rows,
      width: `${w}mm`,
      height: `${h}mm`
    };
  }, [config.ticketWidth, config.ticketHeight]);

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
            className="page-break-after h-[297mm] w-[210mm] grid place-content-center overflow-hidden"
            style={{ 
              gridTemplateColumns: `repeat(${layout.cols}, ${layout.width})`,
              gridAutoRows: layout.height
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
                className="border-[0.1mm] border-gray-100 box-border overflow-hidden relative"
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
              className="page-break-after h-[297mm] w-[210mm] grid place-content-center overflow-hidden"
              style={{ 
                gridTemplateColumns: `repeat(${layout.cols}, ${layout.width})`,
                gridAutoRows: layout.height
              }}
            >
              {pageTickets.map((_, idx) => (
                <div 
                  key={`verso-${pageIdx}-${idx}`} 
                  style={{ 
                    width: layout.width, 
                    height: layout.height,
                    boxSizing: 'border-box'
                  }}
                  className="border-[0.1mm] border-gray-100 box-border overflow-hidden relative"
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
