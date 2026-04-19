
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

    // Détermination heuristique du nombre par page si non prédéfini
    let ticketsPerPage = 10;
    let cols = 2;
    let paddingY = '15mm';
    let paddingX = '5mm';

    if (config.ticketType === 'event_vip') {
      ticketsPerPage = 4;
      cols = 1;
      paddingY = '8.5mm';
      paddingX = '35mm';
    } else if (config.ticketType === 'event') {
      ticketsPerPage = 8;
      cols = 2;
      paddingY = '8.5mm';
      paddingX = '5mm';
    } else if (config.ticketType === 'raffle') {
      ticketsPerPage = 10;
      cols = 2;
      paddingY = '23.5mm';
      paddingX = '5mm';
    } else {
      // Calcul automatique simplifié pour le mode personnalisé sur A4 (210x297mm)
      const fitsX = Math.floor(200 / w) || 1;
      const fitsY = Math.floor(280 / h) || 1;
      cols = fitsX;
      ticketsPerPage = fitsX * fitsY;
      paddingX = `${(210 - (fitsX * w)) / 2}mm`;
      paddingY = `${(297 - (fitsY * h)) / 2}mm`;
    }

    return {
      ticketsPerPage,
      cols,
      width: `${w}mm`,
      height: `${h}mm`,
      paddingY,
      paddingX
    };
  }, [config.ticketType, config.ticketWidth, config.ticketHeight]);

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
            className="page-break-after h-[297mm] w-[210mm] grid content-start"
            style={{ 
              paddingTop: layout.paddingY, 
              paddingBottom: layout.paddingY, 
              paddingLeft: layout.paddingX, 
              paddingRight: layout.paddingX,
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
                className="border-[0.3mm] border-dashed border-gray-400 box-border overflow-hidden"
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
              className="page-break-after h-[297mm] w-[210mm] grid content-start"
              style={{ 
                paddingTop: layout.paddingY, 
                paddingBottom: layout.paddingY, 
                paddingLeft: layout.paddingX, 
                paddingRight: layout.paddingX,
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
                  className="border-[0.3mm] border-dashed border-gray-400 box-border overflow-hidden"
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
