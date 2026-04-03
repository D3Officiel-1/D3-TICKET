
"use client"

import React, { useState } from 'react';
import { TicketConfig, DEFAULT_CONFIG } from '@/lib/types';
import { TicketForm } from '@/components/raffle/TicketForm';
import { TicketPreview } from '@/components/raffle/TicketPreview';
import { PrintSheet } from '@/components/raffle/PrintSheet';
import { Ticket, Sparkles, Star, MousePointer2 } from 'lucide-react';

export default function Home() {
  const [config, setConfig] = useState<TicketConfig>(DEFAULT_CONFIG);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen pb-20">
      {/* Header section (Non-printable) */}
      <header className="no-print bg-white border-b py-6 px-4 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-accent tracking-tight font-headline uppercase">D3 TOMBOLA</h1>
              <p className="text-sm text-muted-foreground font-medium">Génération de tickets professionnels</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 text-primary font-bold">
               <Sparkles className="w-5 h-5" />
               <span>100% Gratuit</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area (Non-printable) */}
      <div className="no-print max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <TicketForm 
            config={config} 
            onChange={setConfig} 
            onPrint={handlePrint}
          />
        </div>

        {/* Right Column: Dynamic Preview */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
          <div className="sticky top-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-accent flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" /> Aperçu en temps réel
              </h2>
              <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold">
                <MousePointer2 className="w-3 h-3" />
                Cliquez sur le ticket pour placer le numéro
              </div>
            </div>
            
            <div className="bg-white/50 p-4 sm:p-8 rounded-3xl border-2 border-dashed border-primary/20 flex justify-center items-center min-h-[450px] overflow-hidden">
              <TicketPreview 
                config={config} 
                number={config.startingNumber} 
                onConfigChange={setConfig}
              />
            </div>

            <div className="mt-8 bg-accent text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                  <Ticket className="w-32 h-32 rotate-12" />
               </div>
               <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2">Instructions de placement</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-4">
                    Le numéro n'est plus bloqué à gauche. Déplacez-le librement sur votre image de fond en cliquant simplement là où vous voulez qu'il apparaisse.
                  </p>
                  <ul className="text-xs space-y-1.5 opacity-90 font-medium">
                    <li className="flex items-center gap-2">✓ Positionnement libre par clic</li>
                    <li className="flex items-center gap-2">✓ Rendu identique à l'impression</li>
                    <li className="flex items-center gap-2">✓ Lisibilité garantie avec effet de contour</li>
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sheet (Hidden on screen) */}
      <PrintSheet config={config} />

      {/* Footer (Non-printable) */}
      <footer className="no-print mt-20 pt-10 border-t text-center text-muted-foreground px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium">© 2024 D3 TOMBOLA — Conçu avec passion pour vos événements.</p>
        </div>
      </footer>
    </main>
  );
}
