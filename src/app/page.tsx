
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { TicketConfig, DEFAULT_CONFIG } from '@/lib/types';
import { TicketForm } from '@/components/raffle/TicketForm';
import { TicketPreview } from '@/components/raffle/TicketPreview';
import { PrintSheet } from '@/components/raffle/PrintSheet';
import { Ticket, Star, MousePointer2, Layers, Repeat, Lock, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'd3_tombola_config_v2';
const UNLOCK_STORAGE_KEY = 'd3_ticket_access_unlocked';

export default function Home() {
  const [config, setConfig] = useState<TicketConfig>(DEFAULT_CONFIG);
  const [activeFace, setActiveFace] = useState<'recto' | 'verso'>('recto');
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  
  // Security state
  const [securityStage, setSecurityStage] = useState<'clicks' | 'password' | 'unlocked'>('clicks');
  const [lockClicks, setLockClicks] = useState(0);
  const [titleClicks, setTitleClicks] = useState(0);
  const [descClicks, setDescClicks] = useState(0);
  const [passwordInput, setPasswordInput] = useState('');

  // Load config and security state from localStorage on mount
  useEffect(() => {
    // Check persistent security status
    const isUnlocked = localStorage.getItem(UNLOCK_STORAGE_KEY) === 'true';
    if (isUnlocked) {
      setSecurityStage('unlocked');
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration for multiple QR codes if necessary
        const qrCodes = Array.isArray(parsed.qrCodes) && parsed.qrCodes.length > 0
          ? parsed.qrCodes
          : (parsed.qrCodeContent 
              ? [{ id: 'qr-migrated', content: parsed.qrCodeContent, size: parsed.qrCodeSize || 40, x: parsed.qrCodeX || 15, y: parsed.qrCodeY || 50 }]
              : DEFAULT_CONFIG.qrCodes);

        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          numberings: Array.isArray(parsed.numberings) && parsed.numberings.length > 0 
            ? parsed.numberings 
            : DEFAULT_CONFIG.numberings,
          qrCodes: qrCodes,
          activeQRCodeId: parsed.activeQRCodeId || (qrCodes[0]?.id || DEFAULT_CONFIG.activeQRCodeId),
          ticketWidth: Number(parsed.ticketWidth) || DEFAULT_CONFIG.ticketWidth,
          ticketHeight: Number(parsed.ticketHeight) || DEFAULT_CONFIG.ticketHeight,
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

  // Security Logic - Stage 1 (Clicks)
  const handleLockClick = () => {
    if (securityStage !== 'clicks') return;
    if (lockClicks < 3) {
      setLockClicks(prev => prev + 1);
    }
  };

  const handleTitleClick = () => {
    if (securityStage !== 'clicks') return;
    if (lockClicks === 3 && titleClicks < 2) {
      setTitleClicks(prev => prev + 1);
    }
  };

  const handleDescClick = () => {
    if (securityStage !== 'clicks') return;
    if (lockClicks === 3 && titleClicks === 2 && descClicks < 4) {
      const nextCount = descClicks + 1;
      setDescClicks(nextCount);
      if (nextCount === 4) {
        setSecurityStage('password');
      }
    }
  };

  // Security Logic - Stage 2 (Password)
  const handlePasswordSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwordInput === 'De3691215') {
      setSecurityStage('unlocked');
      // Persistence of the unlocked state
      localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
      toast({
        title: "Accès autorisé",
        description: "Bienvenue sur D3 TICKET.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Mot de passe incorrect",
        description: "Veuillez réessayer.",
      });
      setPasswordInput('');
    }
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen pb-20">
      {/* Security Overlays */}
      {securityStage !== 'unlocked' && (
        <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center p-4">
          {securityStage === 'clicks' ? (
            <div className="max-w-md w-full bg-white border-2 border-primary/20 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
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
                <h1 
                  onClick={handleTitleClick}
                  className="text-3xl font-black uppercase tracking-tight text-accent cursor-default select-none"
                >
                  Accès Restreint
                </h1>

                <p 
                  onClick={handleDescClick}
                  className="text-lg font-medium leading-relaxed text-muted-foreground cursor-default select-none"
                >
                  Cette application est totalement privée. L'accès est strictement réservé aux personnes autorisées. Toute utilisation non autorisée est interdite.
                </p>
              </div>

              <div className="flex gap-1 opacity-5">
                <div className={cn("w-2 h-2 rounded-full", lockClicks === 3 ? "bg-green-500" : "bg-gray-300")} />
                <div className={cn("w-2 h-2 rounded-full", titleClicks === 2 ? "bg-green-500" : "bg-gray-300")} />
                <div className={cn("w-2 h-2 rounded-full", descClicks === 4 ? "bg-green-500" : "bg-gray-300")} />
              </div>
            </div>
          ) : (
            <div className="max-w-md w-full bg-white border-2 border-primary/20 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-500">
              <div className="bg-primary/10 p-6 rounded-3xl">
                <ShieldCheck className="w-16 h-16 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-accent uppercase tracking-tight">Vérification Requise</h2>
                <p className="text-muted-foreground font-medium">Saisissez le code d'accès pour continuer.</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    type="password"
                    placeholder="Mot de passe"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="pl-12 h-14 text-lg font-bold rounded-2xl border-2 focus:border-primary transition-all"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-transform active:scale-95">
                  Déverrouiller <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Header section */}
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

      <div className="no-print max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <TicketForm 
            config={config} 
            onChange={setConfig} 
            onPrint={handlePrint}
          />
        </div>

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
                {activeFace === 'recto' && (config.showNumbering || config.showQRCode) && (
                  <div className="flex items-center gap-2 text-[10px] bg-accent/10 text-accent px-2 py-1 rounded-md font-bold">
                    <MousePointer2 className="w-3 h-3" />
                    Glissez les éléments
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

      <PrintSheet config={config} />

      <footer className="no-print mt-20 pt-10 border-t text-center text-muted-foreground px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-medium">© 2024 D3 TICKET — Vos données sont stockées localement sur cet ordinateur.</p>
        </div>
      </footer>
    </main>
  );
}
