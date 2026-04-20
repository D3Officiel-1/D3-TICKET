
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { TicketConfig, DEFAULT_CONFIG } from '@/lib/types';
import { TicketForm } from '@/components/raffle/TicketForm';
import { TicketPreview } from '@/components/raffle/TicketPreview';
import { PrintSheet } from '@/components/raffle/PrintSheet';
import { Ticket, Star, MousePointer2, Layers, Repeat, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'd3_tombola_config';

export default function Home() {
  const [config, setConfig] = useState<TicketConfig>(DEFAULT_CONFIG);
  const [activeFace, setActiveFace] = useState<'recto' | 'verso'>('recto');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Security sequence state
  const [showAccessAlert, setShowAccessAlert] = useState(true);
  const [lockClicks, setLockClicks] = useState(0);
  const [titleClicks, setTitleClicks] = useState(0);
  const [descClicks, setDescClicks] = useState(0);

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          numberings: Array.isArray(parsed.numberings) && parsed.numberings.length > 0 
            ? parsed.numberings 
            : DEFAULT_CONFIG.numberings,
          ticketWidth: Number(parsed.ticketWidth) || DEFAULT_CONFIG.ticketWidth,
          ticketHeight: Number(parsed.ticketHeight) || DEFAULT_CONFIG.ticketHeight,
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

  // Security Logic
  const handleLockClick = () => {
    if (lockClicks < 3) {
      setLockClicks(prev => prev + 1);
    }
  };

  const handleTitleClick = () => {
    if (lockClicks === 3 && titleClicks < 2) {
      setTitleClicks(prev => prev + 1);
    }
  };

  const handleDescClick = () => {
    if (lockClicks === 3 && titleClicks === 2 && descClicks < 4) {
      const nextCount = descClicks + 1;
      setDescClicks(nextCount);
      if (nextCount === 4) {
        setShowAccessAlert(false);
      }
    }
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen pb-20">
      {/* Full Screen Access Restriction Overlay */}
      {showAccessAlert && (
        <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-2 border-primary/20 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
            {/* Step 1: Lock Icon */}
            <div 
              onClick={handleLockClick}
              className={cn(
                "cursor-pointer p-6 rounded-3xl transition-all duration-300",
                lockClicks > 0 ? "bg-primary/20 scale-110" : "bg-primary/10 hover:bg-primary/15"
              )}
            >
              <Lock className={cn(
                "w-16 h-16 transition-colors",
                lockClicks === 3 ? "text-primary" : "text-primary/60"
              )} />
            </div>

            <div className="space-y-4">
              {/* Step 2: Title */}
              <h1 
                onClick={handleTitleClick}
                className={cn(
                  "text-3xl font-black uppercase tracking-tight transition-colors cursor-default select-none",
                  titleClicks > 0 ? "text-accent" : "text-accent/40"
                )}
              >
                Accès Restreint
              </h1>

              {/* Step 3: Description */}
              <p 
                onClick={handleDescClick}
                className={cn(
                  "text-lg font-medium leading-relaxed transition-colors cursor-default select-none",
                  descClicks > 0 ? "text-muted-foreground" : "text-muted-foreground/30"
                )}
              >
                Cette application est totalement privée. L'accès est strictement réservé aux personnes autorisées. Toute utilisation non autorisée est interdite.
              </p>
            </div>

            {/* Hidden Progress Feedback for Debugging/Support */}
            <div className="flex gap-1 opacity-10">
              <div className={cn("w-2 h-2 rounded-full", lockClicks === 3 ? "bg-green-500" : "bg-gray-300")} />
              <div className={cn("w-2 h-2 rounded-full", titleClicks === 2 ? "bg-green-500" : "bg-gray-300")} />
              <div className={cn("w-2 h-2 rounded-full", descClicks === 4 ? "bg-green-500" : "bg-gray-300")} />
            </div>
          </div>
        </div>
      )}

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
