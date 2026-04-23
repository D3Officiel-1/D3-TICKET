"use client"

import React, { useMemo } from 'react';
import { TicketConfig } from '@/lib/types';
import { TicketPreview } from './TicketPreview';

interface PrintSheetProps {
  config: TicketConfig;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ config }) => {
  const tickets = useMemo(() => {
    // Priorité absolue aux codes récupérés (même si moins nombreux que la quantité demandée)
    if (config.fetchedCodes && config.fetchedCodes.length > 0) {
      return config.fetchedCodes.slice(0, config.quantity);
    }
    
    // Fallback de génération locale si aucun code n'est chargé
    const list = [];
    if (config.generationMode === 'sequential') {
      for (let i = 0; i < config.quantity; i++) {
        list.push(String(config.startingNumber + i).padStart(5, '0'));
      }
    } else {
      const uniqueRandoms = new Set<number>();
      while (uniqueRandoms.size < config.quantity) {
        uniqueRandoms.add(Math.floor(Math.random() * 99999) + 1);
      }
      list.push(...Array.from(uniqueRandoms).map(n => String(n).padStart(5, '0')));
    }
    return list;
  }, [config.quantity, config.startingNumber, config.generationMode, config.fetchedCodes]);

  const layout = useMemo(() => {
    const w = config.ticketWidth || 140;
    const h = config.ticketHeight || 70;

    const pageW = 210;
    const pageH = 297;

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
    <div id="print-sheet-container" className="hidden print:block bg-white w-[210mm] mx-auto">
      <div className="rectos-section">
        {pages.map((pageTickets, pageIdx) => (
          <div 
            key={`recto-page-${pageIdx}`} 
            className="page-break-after h-[297mm] w-[210mm] grid place-content-center overflow-hidden bg-white"
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

      {config.hasVerso && (
        <div className="versos-section">
          {pages.map((pageTickets, pageIdx) => (
            <div 
              key={`verso-page-${pageIdx}`} 
              className="page-break-after h-[297mm] w-[210mm] grid place-content-center overflow-hidden bg-white"
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
