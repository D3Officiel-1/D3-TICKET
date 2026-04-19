
"use client"

import React, { useState, useEffect } from 'react';
import { TicketConfig, TicketType, NumberingInstance, DEFAULT_CONFIG } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Printer, Image as ImageIcon, Palette, Layers, Ticket, Star, X, Wand2, Ruler, Plus, Target } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

interface TicketFormProps {
  config: TicketConfig;
  onChange: (config: TicketConfig) => void;
  onPrint: () => void;
}

const LIBRARY_STORAGE_KEY = 'd3_tombola_library';

export const TicketForm: React.FC<TicketFormProps> = ({ config, onChange, onPrint }) => {
  const [localLibrary, setLocalLibrary] = useState<string[]>([]);

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

  const addNumbering = () => {
    const newId = `num-${Date.now()}`;
    const newNum: NumberingInstance = {
      id: newId,
      x: 50,
      y: 50,
      size: 24,
      rotation: 0
    };
    const currentNumberings = config.numberings || DEFAULT_CONFIG.numberings;
    updateFields({ 
      numberings: [...currentNumberings, newNum],
      activeNumberingId: newId
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

  const backgroundPresets = PlaceHolderImages.filter(img => img.id.startsWith('bg-'));
  const numberings = config.numberings || DEFAULT_CONFIG.numberings;
  const activeNumbering = numberings.find(n => n.id === config.activeNumberingId) || numberings[0];

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
                <SelectItem value="event_vip">Événement Standard VIP (14x7cm)</SelectItem>
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
                onChange={(e) => updateFields({ ticketWidth: Math.max(10, parseInt(e.target.value) || 0), ticketType: 'custom' })}
                className="font-bold bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-accent"><Ruler className="w-4 h-4 rotate-90" /> Hauteur (mm)</Label>
              <Input 
                type="number"
                value={config.ticketHeight}
                onChange={(e) => updateFields({ ticketHeight: Math.max(10, parseInt(e.target.value) || 0), ticketType: 'custom' })}
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
                  value={activeNumbering.size}
                  onChange={(e) => updateActiveNumbering({ size: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="bg-white font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Rotation (°)</Label>
                <Input 
                  type="number"
                  value={activeNumbering.rotation}
                  onChange={(e) => updateActiveNumbering({ rotation: parseInt(e.target.value) || 0 })}
                  className="bg-white font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visuals Section */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent">
          <Palette className="w-5 h-5" /> Design & Couleurs
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Couleur universelle des numéros</Label>
              <Button 
                variant={config.autoContrast ? "default" : "outline"}
                size="sm"
                className="h-7 text-[10px] gap-1 px-2 uppercase font-black"
                onClick={() => updateFields({ autoContrast: !config.autoContrast })}
              >
                <Wand2 className="w-3 h-3" /> {config.autoContrast ? "Contraste Auto : ON" : "Activer Contraste Auto"}
              </Button>
            </div>
            <div className="flex gap-2">
               <Input type="color" className="w-12 h-10 p-1 cursor-pointer" value={config.color} onChange={(e) => updateFields({ color: e.target.value, autoContrast: false })} />
               <Input value={config.color} onChange={(e) => updateFields({ color: e.target.value, autoContrast: false })} placeholder="#000000" className="font-mono" />
            </div>
          </div>
        </div>
      </div>

      {/* Images Section */}
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

      {/* Generation Section */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent"><Sparkles className="w-5 h-5" /> Séries & Numéros</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Quantité</Label><Input type="number" value={config.quantity} onChange={(e) => updateFields({ quantity: Math.max(1, parseInt(e.target.value) || 1) })} /></div>
          <div className="space-y-2"><Label>Départ</Label><Input type="number" value={config.startingNumber} onChange={(e) => updateFields({ startingNumber: Math.max(0, parseInt(e.target.value) || 0) })} /></div>
          <div className="space-y-2"><Label>Préfixe</Label><Input value={config.numberPrefix} onChange={(e) => updateFields({ numberPrefix: e.target.value })} placeholder="Ex: A-" /></div>
          <div className="space-y-2"><Label>Suffixe</Label><Input value={config.numberSuffix} onChange={(e) => updateFields({ numberSuffix: e.target.value })} placeholder="Ex: -B" /></div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button onClick={onPrint} className="w-full bg-primary hover:bg-primary/90 text-white h-14 text-xl shadow-xl transition-transform hover:scale-[1.01]">
          <Printer className="w-6 h-6 mr-3" /> Générer les Tickets
        </Button>
      </div>
    </div>
  );
};
