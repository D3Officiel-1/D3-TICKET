
"use client"

import React, { useState, useEffect } from 'react';
import { TicketConfig, TicketType, NumberingInstance, QRCodeInstance, DEFAULT_CONFIG } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Printer, Image as ImageIcon, Palette, Layers, Ticket, Star, X, Wand2, Ruler, Plus, Target, Sparkles, CheckCheck, FileDown, Loader2, QrCode, RefreshCw, Type } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { fetchTicketsAction } from '@/app/actions/tickets';

interface TicketFormProps {
  config: TicketConfig;
  onChange: (config: TicketConfig) => void;
  onPrint: () => void;
}

const LIBRARY_STORAGE_KEY = 'd3_tombola_library';

export const TicketForm: React.FC<TicketFormProps> = ({ config, onChange, onPrint }) => {
  const [localLibrary, setLocalLibrary] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isFetchingCodes, setIsFetchingCodes] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (saved) {
      try {
        setLocalLibrary(JSON.parse(saved));
      } catch (e) {
        console.error("Erreur bibliothèque locale", e);
      }
    }
  }, []);

  const updateFields = (updates: Partial<TicketConfig>) => {
    const newConfig = { ...config, ...updates };
    onChange(newConfig);

    if (updates.backgroundImage || updates.versoBackgroundImage) {
      const url = updates.backgroundImage || updates.versoBackgroundImage;
      if (url) {
        try {
          new URL(url);
          if (!localLibrary.includes(url)) {
            const newLib = [url, ...localLibrary].slice(0, 10);
            setLocalLibrary(newLib);
            localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(newLib));
          }
        } catch (e) {}
      }
    }
  };

  const fetchCodesFromAPI = async (quantity: number) => {
    setIsFetchingCodes(true);
    try {
      const codes = await fetchTicketsAction(quantity, config.ticketType);
      
      updateFields({ fetchedCodes: codes });
      toast({
        title: "Codes récupérés",
        description: `${codes.length} codes officiels ont été synchronisés avec succès.`,
      });
      return codes;
    } catch (error: any) {
      console.error("Erreur récupération codes:", error);
      toast({
        variant: "destructive",
        title: "Erreur de synchronisation",
        description: error.message || "Impossible de récupérer les codes officiels.",
      });
      return [];
    } finally {
      setIsFetchingCodes(false);
    }
  };

  const addNumbering = () => {
    const newId = `num-${Date.now()}`;
    const newNum: NumberingInstance = {
      id: newId,
      x: 50,
      y: 50,
      size: 24,
      rotation: 0,
      color: config.color,
      autoContrast: config.autoContrast
    };
    const currentNumberings = config.numberings || DEFAULT_CONFIG.numberings;
    updateFields({ 
      numberings: [...currentNumberings, newNum],
      activeNumberingId: newId,
      showNumbering: true
    });
  };

  const removeNumbering = (id: string) => {
    const currentNumberings = config.numberings || DEFAULT_CONFIG.numberings;
    if (currentNumberings.length <= 1) return;
    const newNumberings = currentNumberings.filter(n => n.id !== id);
    const newActiveId = config.activeNumberingId === id ? newNumberings[0].id : config.activeNumberingId;
    updateFields({ numberings: newNumberings, activeNumberingId: newActiveId });
  };

  const updateActiveNumbering = (updates: Partial<NumberingInstance>) => {
    const currentNumberings = config.numberings || DEFAULT_CONFIG.numberings;
    const newNumberings = currentNumberings.map(n => 
      n.id === config.activeNumberingId ? { ...n, ...updates } : n
    );
    updateFields({ numberings: newNumberings });
  };

  const applyActiveToAll = () => {
    const currentNumberings = config.numberings || DEFAULT_CONFIG.numberings;
    const active = currentNumberings.find(n => n.id === config.activeNumberingId);
    if (!active) return;

    const newNumberings = currentNumberings.map(n => ({
      ...n,
      color: active.color,
      autoContrast: active.autoContrast,
      size: active.size,
      rotation: active.rotation
    }));
    updateFields({ numberings: newNumberings });
  };

  const addQRCode = () => {
    const newId = `qr-${Date.now()}`;
    const newQR: QRCodeInstance = {
      id: newId,
      content: "[NUM]",
      size: 40,
      x: 50,
      y: 50,
      fgColor: "#000000",
      bgColor: "#FFFFFF",
      includeMargin: false,
      level: 'H'
    };
    const currentQRs = config.qrCodes || DEFAULT_CONFIG.qrCodes;
    updateFields({ 
      qrCodes: [...currentQRs, newQR],
      activeQRCodeId: newId,
      showQRCode: true
    });
  };

  const removeQRCode = (id: string) => {
    const currentQRs = config.qrCodes || DEFAULT_CONFIG.qrCodes;
    if (currentQRs.length <= 1) return;
    const newQRs = currentQRs.filter(q => q.id !== id);
    const newActiveId = config.activeQRCodeId === id ? newQRs[0].id : config.activeQRCodeId;
    updateFields({ qrCodes: newQRs, activeQRCodeId: newActiveId });
  };

  const updateActiveQRCode = (updates: Partial<QRCodeInstance>) => {
    const currentQRs = config.qrCodes || DEFAULT_CONFIG.qrCodes;
    const newQRs = currentQRs.map(q => 
      q.id === config.activeQRCodeId ? { ...q, ...updates } : q
    );
    updateFields({ qrCodes: newQRs });
  };

  const handleTypeChange = (type: TicketType) => {
    let width = config.ticketWidth;
    let height = config.ticketHeight;

    switch (type) {
      case 'event_vip': width = 140; height = 70; break;
      case 'event': width = 100; height = 70; break;
      case 'raffle': width = 100; height = 50; break;
    }

    updateFields({ ticketType: type, ticketWidth: width, ticketHeight: height });
  };

  const prepareAndAction = async (action: () => void) => {
    if (config.fetchedCodes.length < config.quantity) {
      const codes = await fetchCodesFromAPI(config.quantity);
      if (codes && codes.length > 0) {
        setTimeout(action, 100);
      }
    } else {
      action();
    }
  };

  const handleExportPDF = async () => {
    if (isExporting) return;
    
    await prepareAndAction(async () => {
      try {
        setIsExporting(true);
        toast({
          title: "Génération du PDF",
          description: "Préparation de votre fichier d3-ticket.pdf...",
        });

        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        const container = document.getElementById('print-sheet-container');
        if (!container) throw new Error("Conteneur d'impression introuvable");

        container.classList.remove('hidden');
        container.classList.add('export-active');

        const doc = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
          compress: true
        });

        const pages = container.querySelectorAll('.page-break-after');
        
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i] as HTMLElement;
          const canvas = await html2canvas(page, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) doc.addPage();
          doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        }

        doc.save('d3-ticket.pdf');
        
        toast({
          title: "Succès",
          description: "Votre fichier d3-ticket.pdf a été téléchargé.",
        });
      } catch (error) {
        console.error("Erreur PDF:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la génération du PDF.",
        });
      } finally {
        const container = document.getElementById('print-sheet-container');
        if (container) {
          container.classList.add('hidden');
          container.classList.remove('export-active');
        }
        setIsExporting(false);
      }
    });
  };

  const backgroundPresets = PlaceHolderImages.filter(img => img.id.startsWith('bg-'));
  const numberings = config.numberings || DEFAULT_CONFIG.numberings;
  const qrCodes = config.qrCodes || DEFAULT_CONFIG.qrCodes;
  const activeQR = qrCodes.find(q => q.id === config.activeQRCodeId) || qrCodes[0];

  return (
    <div className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-border">
      {/* Format Section */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent">
          <Ticket className="w-5 h-5" /> Format du Ticket
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profil de format</Label>
            <Select value={config.ticketType} onValueChange={(v: TicketType) => handleTypeChange(v)}>
              <SelectTrigger className="w-full h-12 font-bold">
                <SelectValue placeholder="Choisir un format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event_vip">Événement Standard VIP (14x7cm - 4/page)</SelectItem>
                <SelectItem value="event">Événement Petit (10x7cm)</SelectItem>
                <SelectItem value="raffle">Tombola Classique (10x5cm)</SelectItem>
                <SelectItem value="custom">Format Manuel (Personnalisé)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-accent/5 rounded-xl border border-accent/10">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-accent"><Ruler className="w-4 h-4" /> Largeur (mm)</Label>
              <Input 
                type="number"
                value={config.ticketWidth}
                onChange={(e) => updateFields({ ticketWidth: Math.max(1, parseInt(e.target.value) || 0), ticketType: 'custom' })}
                className="font-bold bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-accent"><Ruler className="w-4 h-4 rotate-90" /> Hauteur (mm)</Label>
              <Input 
                type="number"
                value={config.ticketHeight}
                onChange={(e) => updateFields({ ticketHeight: Math.max(1, parseInt(e.target.value) || 0), ticketType: 'custom' })}
                className="font-bold bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Numbering Management Section */}
      <div>
        <h2 className="text-xl font-bold flex items-center justify-between mb-6 text-accent">
          <div className="flex items-center gap-2"><Target className="w-5 h-5" /> Points de numérotation</div>
          <Button size="sm" onClick={addNumbering} className="h-8 gap-1"><Plus className="w-4 h-4" /> Ajouter</Button>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
            <Label className="font-bold">Activer la numérotation</Label>
            <Switch 
              checked={config.showNumbering} 
              onCheckedChange={(val) => updateFields({ showNumbering: val })} 
            />
          </div>

          {config.showNumbering && (
            <>
              <div className="flex flex-wrap gap-2">
                {numberings.map((num, idx) => (
                  <div key={num.id} className="relative group">
                    <Button
                      variant={config.activeNumberingId === num.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFields({ activeNumberingId: num.id })}
                      className="h-9 px-4 font-bold"
                    >
                      N° {idx + 1}
                    </Button>
                    {numberings.length > 1 && (
                      <button 
                        onClick={() => removeNumbering(num.id)}
                        className="absolute -top-2 -right-2 bg-white border border-red-200 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Taille (pt)</Label>
                    <Input 
                      type="number"
                      value={numberings.find(n => n.id === config.activeNumberingId)?.size || 24}
                      onChange={(e) => updateActiveNumbering({ size: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Rotation (°)</Label>
                    <Input 
                      type="number"
                      value={numberings.find(n => n.id === config.activeNumberingId)?.rotation || 0}
                      onChange={(e) => updateActiveNumbering({ rotation: parseInt(e.target.value) || 0 })}
                      className="bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Couleur Point N° {numberings.findIndex(n => n.id === config.activeNumberingId) + 1}</Label>
                    <Button 
                      variant={(numberings.find(n => n.id === config.activeNumberingId)?.autoContrast) ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-[9px] gap-1 px-2 uppercase font-black"
                      onClick={() => updateActiveNumbering({ autoContrast: !numberings.find(n => n.id === config.activeNumberingId)?.autoContrast })}
                    >
                      <Wand2 className="w-3 h-3" /> Auto
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      className="w-10 h-8 p-1 cursor-pointer" 
                      value={numberings.find(n => n.id === config.activeNumberingId)?.color || config.color} 
                      onChange={(e) => updateActiveNumbering({ color: e.target.value, autoContrast: false })} 
                    />
                    <Button variant="outline" size="sm" onClick={applyActiveToAll} className="h-8 text-[9px] font-bold gap-1 ml-auto">
                      <CheckCheck className="w-3 h-3" /> Tous
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR Code Management Section */}
      <div>
        <h2 className="text-xl font-bold flex items-center justify-between mb-6 text-accent">
          <div className="flex items-center gap-2"><QrCode className="w-5 h-5" /> Points QR Code</div>
          <Button size="sm" onClick={addQRCode} className="h-8 gap-1"><Plus className="w-4 h-4" /> Ajouter</Button>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
            <Label className="font-bold">Activer les QR Codes</Label>
            <Switch 
              checked={config.showQRCode} 
              onCheckedChange={(val) => updateFields({ showQRCode: val })} 
            />
          </div>

          {config.showQRCode && (
            <>
              <div className="flex flex-wrap gap-2">
                {qrCodes.map((qr, idx) => (
                  <div key={qr.id} className="relative group">
                    <Button
                      variant={config.activeQRCodeId === qr.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFields({ activeQRCodeId: qr.id })}
                      className="h-9 px-4 font-bold"
                    >
                      QR {idx + 1}
                    </Button>
                    {qrCodes.length > 1 && (
                      <button 
                        onClick={() => removeQRCode(qr.id)}
                        className="absolute -top-2 -right-2 bg-white border border-red-200 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Contenu du QR Code {qrCodes.findIndex(q => q.id === config.activeQRCodeId) + 1}</Label>
                  <Input 
                    value={activeQR.content}
                    onChange={(e) => updateActiveQRCode({ content: e.target.value })}
                    placeholder="Ex: [NUM] ou https://site.fr/[NUM]"
                    className="bg-white font-medium"
                  />
                  <p className="text-[10px] text-muted-foreground">Utilisez <strong>[NUM]</strong> pour insérer le code récupéré via l'API.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Taille (px)</Label>
                    <Input 
                      type="number"
                      value={activeQR.size}
                      onChange={(e) => updateActiveQRCode({ size: Math.max(10, parseInt(e.target.value) || 10) })}
                      className="bg-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-bold text-muted-foreground">Correction</Label>
                    <Select value={activeQR.level} onValueChange={(v: 'L'|'M'|'Q'|'H') => updateActiveQRCode({ level: v })}>
                      <SelectTrigger className="h-10 bg-white font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Basse (7%)</SelectItem>
                        <SelectItem value="M">Moyenne (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">Haute (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Couleur Code</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          className="w-full h-8 p-1 cursor-pointer" 
                          value={activeQR.fgColor || "#000000"} 
                          onChange={(e) => updateActiveQRCode({ fgColor: e.target.value })} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Couleur Fond</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          className="w-full h-8 p-1 cursor-pointer" 
                          value={activeQR.bgColor || "#FFFFFF"} 
                          onChange={(e) => updateActiveQRCode({ bgColor: e.target.value })} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg border border-dashed mt-2">
                    <Label className="text-xs font-bold">Inclure une marge</Label>
                    <Switch 
                      checked={activeQR.includeMargin} 
                      onCheckedChange={(val) => updateActiveQRCode({ includeMargin: val })} 
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Design Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-accent"><ImageIcon className="w-5 h-5" /> Design (Recto)</h2>
          <div className="space-y-4">
            <Input value={config.backgroundImage} onChange={(e) => updateFields({ backgroundImage: e.target.value })} placeholder="URL de l'image recto" className="bg-muted/30" />
            <div className="grid grid-cols-4 gap-2">
              <Button variant={config.backgroundImage === "" ? "default" : "outline"} className="h-12 text-xs" onClick={() => updateFields({ backgroundImage: "" })}>Aucun</Button>
              {backgroundPresets.slice(0, 3).map((bg) => (
                <Button key={bg.id} variant={config.backgroundImage === bg.imageUrl ? "default" : "outline"} className="h-12 p-0 overflow-hidden relative" onClick={() => updateFields({ backgroundImage: bg.imageUrl })}>
                  <img src={bg.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  <span className="relative z-10 text-[10px] font-bold bg-white/50 px-1">{bg.description.split(' ')[1]}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/10 rounded-xl border border-dashed">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold flex items-center gap-2 text-accent"><Layers className="w-4 h-4" /> Verso</h2>
            <Switch checked={config.hasVerso} onCheckedChange={(val) => updateFields({ hasVerso: val })} />
          </div>
          {config.hasVerso && <Input value={config.versoBackgroundImage} onChange={(e) => updateFields({ versoBackgroundImage: e.target.value })} placeholder="URL de l'image verso" className="bg-white mt-2" />}
        </div>
      </div>

      {/* Series Section */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent"><Sparkles className="w-5 h-5" /> Séries & Numéros</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Quantité</Label>
            <Input 
              type="number" 
              value={config.quantity} 
              onChange={(e) => updateFields({ quantity: Math.max(1, parseInt(e.target.value) || 1), fetchedCodes: [] })} 
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              className="w-full h-10 gap-2 font-bold"
              onClick={() => fetchCodesFromAPI(config.quantity)}
              disabled={isFetchingCodes}
            >
              {isFetchingCodes ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Synchroniser Firestore
            </Button>
          </div>
        </div>
        {config.fetchedCodes.length > 0 && (
          <p className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1">
            <CheckCheck className="w-3 h-3" /> {config.fetchedCodes.length} codes chargés depuis Firestore.
          </p>
        )}
      </div>

      <div className="pt-4 border-t space-y-3">
        <Button 
          onClick={() => prepareAndAction(onPrint)} 
          className="w-full bg-primary hover:bg-primary/90 text-white h-14 text-xl shadow-xl transition-transform hover:scale-[1.01]"
          disabled={isFetchingCodes}
        >
          {isFetchingCodes ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Printer className="w-6 h-6 mr-3" />}
          Imprimer les Tickets
        </Button>
        <Button 
          onClick={handleExportPDF} 
          disabled={isExporting || isFetchingCodes} 
          variant="outline" 
          className="w-full h-12 text-accent font-bold gap-2 border-accent/20 hover:bg-accent/5"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
          Télécharger d3-ticket.pdf
        </Button>
      </div>
    </div>
  );
};
