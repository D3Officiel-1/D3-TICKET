
"use client"

import React, { useState, useEffect } from 'react';
import { TicketConfig, DEFAULT_CONFIG } from '@/lib/types';
import { TicketForm } from '@/components/raffle/TicketForm';
import { TicketPreview } from '@/components/raffle/TicketPreview';
import { PrintSheet } from '@/components/raffle/PrintSheet';
import { Ticket, Star, MousePointer2, Layers, Repeat, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STORAGE_KEY = 'd3_tombola_config';

export default function Home() {
  const [config, setConfig] = useState<TicketConfig>(DEFAULT_CONFIG);
  const [activeFace, setActiveFace] = useState<'recto' | 'verso'>('recto');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAccessAlert, setShowAccessAlert] = useState(true);

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure new features (like multiple numberings and dimensions) are present
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          // Extra safety for the numberings array which was a newer feature
          numberings: Array.isArray(parsed.numberings) && parsed.numberings.length > 0 
            ? parsed.numberings 
            : DEFAULT_CONFIG.numberings,
          // Ensure dimensions are numbers
          ticketWidth: Number(parsed.ticketWidth) || DEFAULT_CONFIG.ticketWidth,
          ticketHeight: Number(parsed.ticketHeight) || DEFAULT_CONFIG.ticketHeight,
          // Ensure showNumbering is present
          showNumbering: typeof parsed.showNumbering === 'boolean' ? parsed.showNumbering : DEFAULT_CONFIG.showNumbering
        });
      } catch (e) {
        console.error("Erreur de chargement de la config locale", e);
        setConfig(DEFAULT_CONFIG);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save config to localStorage on every change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [config, isLoaded]);

  const handlePrint = () => {
    window.print();
  };

  const toggleVerso = () => {
    const newHasVerso = !config.hasVerso;
    setConfig(prev => ({ ...prev, hasVerso: newHasVerso }));
    if (!newHasVerso) setActiveFace('recto');
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen pb-20">
      {/* Access Restriction Alert */}
      <AlertDialog open={showAccessAlert} onOpenChange={setShowAccessAlert}>
        <AlertDialogContent className="bg-white border-2 border-primary/20 rounded-3xl p-8 max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-2xl w-fit mb-4">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-accent text-center uppercase tracking-tight">
              Accès Restreint
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium text-muted-foreground text-center pt-2 leading-relaxed">
              Cette application est totalement privée. L'accès est strictement réservé aux personnes autorisées. Toute utilisation non autorisée est interdite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 sm:justify-center">
            <AlertDialogAction 
              onClick={() => setShowAccessAlert(false)}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-10 py-6 rounded-xl text-lg shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              J'ai compris
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header section (Non-printable) */}
      <header className="no-print bg-white border-b py-6 px-4 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/20">
              <Ticket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-accent tracking-tight font-headline uppercase">D3 TICKET</h1>
              <p className="text-sm text-muted-foreground font-medium">Génération de tickets professionnels</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <h2 className="text-xl font-bold text-accent flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" /> Édition du ticket
              </h2>
              
              <div className="flex items-center gap-2">
                {config.hasVerso && (
                  <Tabs value={activeFace} onValueChange={(v) => setActiveFace(v as 'recto' | 'verso')} className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="recto" className="font-bold">Recto</TabsTrigger>
                      <TabsTrigger value="verso" className="font-bold">Verso</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
                <Button 
                  variant={config.hasVerso ? "secondary" : "outline"}
                  size="sm"
                  onClick={toggleVerso}
                  className="gap-2 font-bold"
                >
                  <Layers className="w-4 h-4" />
                  {config.hasVerso ? "Désactiver Verso" : "Activer Verso"}
                </Button>
              </div>
            </div>
            
            <div className="bg-white/50 p-4 sm:p-8 rounded-3xl border-2 border-dashed border-primary/20 flex flex-col gap-4 justify-center items-center min-h-[450px] overflow-hidden relative">
              <div className="absolute top-4 left-4 flex flex-col gap-1 z-20">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">
                  Mode: {activeFace === 'recto' ? 'Recto' : 'Verso'}
                </span>
                {activeFace === 'recto' && config.showNumbering && (
                  <div className="flex items-center gap-2 text-[10px] bg-accent/10 text-accent px-2 py-1 rounded-md font-bold">
                    <MousePointer2 className="w-3 h-3" />
                    Glissez le numéro
                  </div>
                )}
              </div>

              <div className="transition-all duration-500 ease-in-out transform scale-100 hover:scale-[1.02]">
                <TicketPreview 
                  config={config} 
                  number={activeFace === 'recto' ? config.startingNumber : ""} 
                  isVerso={activeFace === 'verso'}
                  onConfigChange={setConfig}
                />
              </div>

              {config.hasVerso && (
                <p className="text-xs text-muted-foreground font-medium animate-pulse flex items-center gap-2">
                  <Repeat className="w-3 h-3" /> Basculez entre les faces pour prévisualiser
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sheet (Hidden on screen) */}
      <PrintSheet config={config} />

      {/* Footer (Non-printable) */}
      <footer className="no-print mt-20 pt-10 border-t text-center text-muted-foreground px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium">© 2024 D3 TICKET — Vos données sont stockées localement sur cet ordinateur.</p>
        </div>
      </footer>
    </main>
  );
}
