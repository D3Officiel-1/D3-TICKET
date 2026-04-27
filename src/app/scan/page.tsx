
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { validateTicketScanAction } from '@/app/actions/scan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Camera, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';
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
    // Nettoyage au démontage
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
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanFailure
        );
        setScanning(true);
      } else {
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Caméra introuvable",
          description: "Aucun appareil de capture vidéo n'a été détecté."
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
        console.error("Erreur lors de l'arrêt du scanner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (loading) return;
    
    setLoading(true);
    let code = decodedText;

    // Extraction du code si c'est une URL
    try {
        const url = new URL(decodedText);
        const params = new URLSearchParams(url.search);
        code = params.get('code') || decodedText;
    } catch (e) {}

    try {
      const result = await validateTicketScanAction(code);
      setLastResult(result);
      
      if (result.success) {
        toast({ title: result.alreadyValidated ? "Déjà validé" : "Succès", description: result.message });
      } else {
        toast({ variant: "destructive", title: "Erreur", description: result.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur serveur", description: "Impossible de valider le ticket." });
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = () => {
    // Silencieux pendant la détection
  };

  return (
    <main className="min-h-screen bg-background p-4 flex flex-col items-center">
      <header className="w-full max-w-md flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-black text-accent uppercase tracking-tighter">D3 SCANNER</h1>
        </div>
      </header>

      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl rounded-[2rem] overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-accent">
            Validation Ticket
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium">Scannez le QR Code pour valider l'entrée.</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="relative aspect-square bg-black rounded-3xl overflow-hidden shadow-inner border-4 border-muted/20">
            <div id="reader" className="w-full h-full"></div>
            
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/10 backdrop-blur-[2px]">
                <Camera className="w-20 h-20 text-accent/20 mb-4" />
                <Button onClick={startScanner} className="h-14 px-8 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                  Activer la Caméra
                </Button>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            )}
          </div>

          {hasCameraPermission === false && (
            <Alert variant="destructive" className="rounded-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Caméra requise</AlertTitle>
              <AlertDescription>
                Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur pour scanner les tickets.
              </AlertDescription>
            </Alert>
          )}

          {lastResult && (
            <div className={cn(
                "p-4 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2",
                lastResult.success ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"
            )}>
              <div className="flex items-center gap-3 mb-2">
                {lastResult.success ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
                <p className="font-black uppercase text-sm tracking-widest">{lastResult.message}</p>
              </div>
              {lastResult.ticket && (
                <div className="bg-white/50 p-3 rounded-xl text-xs space-y-1 border border-black/5">
                  <p><strong>Code:</strong> {lastResult.ticket.code}</p>
                  <p><strong>Type:</strong> <span className="uppercase font-bold">{lastResult.ticket.type}</span></p>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4 h-10 font-bold gap-2 bg-white"
                onClick={() => setLastResult(null)}
              >
                <RefreshCw className="w-4 h-4" /> Suivant
              </Button>
            </div>
          )}

          {scanning && (
            <Button variant="secondary" onClick={stopScanner} className="w-full h-12 rounded-xl font-bold">
              Arrêter le scanner
            </Button>
          )}
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-muted-foreground text-xs font-medium">
        <p>© 2024 D3 TICKET — Système de validation sécurisé</p>
      </footer>
    </main>
  );
}
