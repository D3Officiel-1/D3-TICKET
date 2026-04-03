
"use client"

import React, { useState, useEffect } from 'react';
import { TicketConfig, TicketType } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings2, Sparkles, Printer, Image as ImageIcon, Palette, Layers, Ticket, Star, History, X, Wand2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface TicketFormProps {
  config: TicketConfig;
  onChange: (config: TicketConfig) => void;
  onPrint: () => void;
}

const LIBRARY_STORAGE_KEY = 'd3_tombola_library';

export const TicketForm: React.FC<TicketFormProps> = ({ config, onChange, onPrint }) => {
  const [localLibrary, setLocalLibrary] = useState<string[]>([]);

  // Load local library from localStorage
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

  // Update field and manage library
  const updateField = (field: keyof TicketConfig, value: any) => {
    onChange({ ...config, [field]: value });

    // If it's a URL field, try adding to library if valid
    if ((field === 'backgroundImage' || field === 'versoBackgroundImage') && value) {
      try {
        new URL(value); // Check validity
        if (!localLibrary.includes(value)) {
          const newLib = [value, ...localLibrary].slice(0, 10); // Keep last 10
          setLocalLibrary(newLib);
          localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(newLib));
        }
      } catch (e) {
        // Invalid URL, ignore
      }
    }
  };

  const removeFromLibrary = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLib = localLibrary.filter(item => item !== url);
    setLocalLibrary(newLib);
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(newLib));
  };

  const backgroundPresets = PlaceHolderImages.filter(img => img.id.startsWith('bg-'));

  return (
    <div className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-border">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent">
          <Ticket className="w-5 h-5" /> Type de Ticket
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Format du ticket</Label>
            <Select 
              value={config.ticketType} 
              onValueChange={(v: TicketType) => updateField('ticketType', v)}
            >
              <SelectTrigger className="w-full h-12 font-bold">
                <SelectValue placeholder="Choisir un format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event_vip">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>Événement Standard VIP (14x7cm - 4/page)</span>
                  </div>
                </SelectItem>
                <SelectItem value="event">Événement Petit (10x7cm - 8/page)</SelectItem>
                <SelectItem value="raffle">Tombola Classique (10x5cm - 10/page)</SelectItem>
              </SelectContent>
            </Select>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 mt-2">
              <p className="text-[12px] text-primary font-medium leading-tight">
                {config.ticketType === 'event_vip' && "Format VIP large (14x7cm), idéal pour festivals. 4 par page."}
                {config.ticketType === 'event' && "Format 10x7cm. Optimisé avec 8 tickets par page."}
                {config.ticketType === 'raffle' && "Format standard tombola 10x5cm. 10 par page."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent">
          <Palette className="w-5 h-5" /> Personnalisation visuelle
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Couleur du numéro</Label>
              <Button 
                variant={config.autoContrast ? "default" : "outline"}
                size="sm"
                className="h-7 text-[10px] gap-1 px-2 uppercase font-black tracking-tighter"
                onClick={() => updateField('autoContrast', !config.autoContrast)}
              >
                <Wand2 className="w-3 h-3" />
                {config.autoContrast ? "Contraste Auto : ON" : "Activer Contraste Auto"}
              </Button>
            </div>
            <div className="flex gap-2">
               <Input 
                type="color"
                className="w-12 p-1 cursor-pointer h-10"
                value={config.color} 
                onChange={(e) => {
                  updateField('color', e.target.value);
                  updateField('autoContrast', false);
                }}
              />
              <Input 
                value={config.color} 
                onChange={(e) => {
                  updateField('color', e.target.value);
                  updateField('autoContrast', false);
                }}
                placeholder="#000000"
                className="font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-accent">
            <ImageIcon className="w-5 h-5" /> Image de fond (Recto)
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>URL de votre design</Label>
              <Input 
                value={config.backgroundImage} 
                onChange={(e) => updateField('backgroundImage', e.target.value)}
                placeholder="https://votre-image.jpg"
                className="bg-muted/30"
              />
            </div>

            {localLibrary.length > 0 && (
              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <History className="w-3 h-3" /> Bibliothèque locale (Dernières images utilisées)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {localLibrary.map((url, i) => (
                    <div key={i} className="group relative">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-12 w-20 overflow-hidden p-0 relative border-accent/20"
                        onClick={() => updateField('backgroundImage', url)}
                      >
                        <img src={url} alt="Library item" className="w-full h-full object-cover" />
                      </Button>
                      <button 
                        onClick={(e) => removeFromLibrary(url, e)}
                        className="absolute -top-1 -right-1 bg-white border border-red-200 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button 
                variant={config.backgroundImage === "" ? "default" : "outline"} 
                className="text-xs h-16 flex flex-col gap-1"
                onClick={() => updateField('backgroundImage', "")}
              >
                Aucun
              </Button>
              {backgroundPresets.map((bg) => (
                <Button 
                  key={bg.id}
                  variant={config.backgroundImage === bg.imageUrl ? "default" : "outline"}
                  className="text-xs h-16 flex flex-col gap-1 overflow-hidden p-0 relative"
                  onClick={() => updateField('backgroundImage', bg.imageUrl)}
                >
                  <img src={bg.imageUrl} alt={bg.description} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  <span className="relative z-10 bg-white/80 px-1 rounded font-bold">{bg.description.split(' ')[1]}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/30 rounded-xl border border-dashed border-accent/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold flex items-center gap-2 text-accent">
                <Layers className="w-5 h-5" /> Verso (Dos du ticket)
              </h2>
              <p className="text-[10px] text-muted-foreground">Persisté automatiquement</p>
            </div>
            <Switch 
              checked={config.hasVerso} 
              onCheckedChange={(val) => updateField('hasVerso', val)}
            />
          </div>
          
          {config.hasVerso && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label>Image du Verso (URL)</Label>
                <Input 
                  value={config.versoBackgroundImage} 
                  onChange={(e) => updateField('versoBackgroundImage', e.target.value)}
                  placeholder="https://votre-image-dos.jpg"
                  className="bg-white"
                />
              </div>
              {localLibrary.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {localLibrary.slice(0, 5).map((url, i) => (
                    <Button 
                      key={`verso-lib-${i}`}
                      variant="outline" 
                      size="sm"
                      className="h-10 w-16 overflow-hidden p-0"
                      onClick={() => updateField('versoBackgroundImage', url)}
                    >
                      <img src={url} alt="Library item" className="w-full h-full object-cover opacity-60" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent">
          <Sparkles className="w-5 h-5" /> Numérotation & Quantité
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Nombre total de tickets</Label>
            <Input 
              type="number"
              value={config.quantity} 
              onChange={(e) => updateField('quantity', Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label>Numéro de départ</Label>
            <Input 
              type="number"
              value={config.startingNumber} 
              onChange={(e) => updateField('startingNumber', Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Type de génération</Label>
            <Select 
              value={config.generationMode} 
              onValueChange={(v) => updateField('generationMode', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sequential">Séquentiel (001, 002...)</SelectItem>
                <SelectItem value="random">Aléatoire (Codes uniques)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button onClick={onPrint} className="w-full bg-primary hover:bg-primary/90 text-white h-14 text-xl shadow-xl hover:scale-[1.02] transition-transform">
          <Printer className="w-6 h-6 mr-3" /> Générer le PDF Prêt à Imprimer
        </Button>
      </div>
    </div>
  );
};
