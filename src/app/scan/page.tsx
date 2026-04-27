
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { validateTicketScanAction } from '@/app/actions/scan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ShieldCheck, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ScanPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [scanning]);

  const startScanner = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setHasCameraPermission(true);
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanFailure
        );
        setScanning(true);
      } else {
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Caméra introuvable",
          description: "Veuillez vérifier vos branchements."
        });
      }
    } catch (err) {
      console.error(err);
      setHasCameraPermission(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error("Erreur lors de l'arrêt:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (loading) return;
    
    setLoading(true);
    let code = decodedText;

    // Nettoyage du code (extraction si URL)
    try {
        const url = new URL(decodedText);
        const params = new URLSearchParams(url.search);
        code = params.get('code') || decodedText;
    } catch (e) {}

    try {
      const result = await validateTicketScanAction(code);
      setLastResult(result);
      
      if (result.success) {
        if (result.alreadyValidated) {
            toast({ title: "Déjà utilisé", description: result.message, variant: "destructive" });
        } else {
            toast({ title: "Validé !", description: result.message });
        }
      } else {
        toast({ variant: "destructive", title: "Invalide", description: result.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Problème de connexion Firestore." });
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = () => {};

  return (
    <main className="min-h-screen bg-background p-4 flex flex-col items-center">
      <header className="w-full max-w-md flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 font-bold">
            <ArrowLeft className="w-4 h-4" /> Accueil
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-black text-accent uppercase tracking-tighter">SCANNER D3</h1>
        </div>
      </header>

      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center pb-2 bg-accent/5 border-b">
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-accent flex items-center justify-center gap-2">
            <Ticket className="w-6 h-6" /> Validation
          </CardTitle>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Contrôle d'accès en direct</p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="relative aspect-square bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
            <div id="reader" className="w-full h-full"></div>
            
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/10 backdrop-blur-[2px]">
                <div className="p-8 bg-white/90 rounded-full shadow-xl mb-6">
                  <Camera className="w-16 h-16 text-accent" />
                </div>
                <Button onClick={startScanner} className="h-14 px-10 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl transition-transform active:scale-95">
                  Lancer le Scan
                </Button>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
                <p className="text-white font-black uppercase tracking-widest">Validation...</p>
              </div>
            )}
          </div>

          {hasCameraPermission === false && (
            <Alert variant="destructive" className="rounded-2xl border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-bold">Accès refusé</AlertTitle>
              <AlertDescription className="text-xs font-medium">
                Vous devez autoriser la caméra pour valider les tickets.
              </AlertDescription>
            </Alert>
          )}

          {lastResult && (
            <div className={cn(
                "p-5 rounded-[1.5rem] border-2 animate-in fade-in slide-in-from-top-4 duration-500",
                lastResult.success && !lastResult.alreadyValidated ? "bg-green-50 border-green-500 text-green-900" : 
                lastResult.alreadyValidated ? "bg-amber-50 border-amber-500 text-amber-900" :
                "bg-red-50 border-red-500 text-red-900"
            )}>
              <div className="flex items-center gap-3 mb-4">
                {lastResult.success && !lastResult.alreadyValidated ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-amber-600" />}
                <div>
                    <p className="font-black uppercase text-base tracking-tight">{lastResult.message}</p>
                    <p className="text-[10px] font-bold uppercase opacity-60">Status: {lastResult.alreadyValidated ? 'Déjà scanné' : 'Validé à l\'instant'}</p>
                </div>
              </div>
              
              {lastResult.ticket && (
                <div className="bg-white/80 p-4 rounded-xl text-xs space-y-2 border border-black/5 shadow-inner">
                  <div className="flex justify-between">
                    <span className="font-bold text-muted-foreground">CODE :</span>
                    <span className="font-black font-code text-sm">{lastResult.ticket.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-muted-foreground">TYPE :</span>
                    <span className="font-black uppercase px-2 py-0.5 bg-accent/10 rounded text-accent">{lastResult.ticket.type}</span>
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full mt-6 h-12 font-black uppercase tracking-widest gap-2 bg-white border-2 hover:bg-white/90"
                onClick={() => setLastResult(null)}
              >
                <RefreshCw className="w-4 h-4" /> Ticket Suivant
              </Button>
            </div>
          )}

          {scanning && !lastResult && (
            <div className="text-center space-y-4">
                <p className="text-xs font-black text-muted-foreground animate-pulse uppercase tracking-widest">
                  Visez le QR code du ticket
                </p>
                <Button variant="ghost" size="sm" onClick={stopScanner} className="font-bold text-red-500 hover:text-red-600 hover:bg-red-50">
                  Arrêter la caméra
                </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-40">
        <p>© 2024 D3 TICKET — Validation Sécurisée Firestore</p>
      </footer>
    </main>
  );
}
