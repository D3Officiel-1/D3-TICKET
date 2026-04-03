
"use client"

import React from 'react';
import { TicketConfig } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings2, Sparkles, Printer, Image as ImageIcon, Palette, Layers } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface TicketFormProps {
  config: TicketConfig;
  onChange: (config: TicketConfig) => void;
  onPrint: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ config, onChange, onPrint }) => {
  const updateField = (field: keyof TicketConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const backgroundPresets = PlaceHolderImages.filter(img => img.id.startsWith('bg-'));

  return (
    <div className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-border">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent">
          <Palette className="w-5 h-5" /> Style & Couleurs
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Couleur du numéro</Label>
            <div className="flex gap-2">
               <Input 
                type="color"
                className="w-12 p-1 cursor-pointer"
                value={config.color} 
                onChange={(e) => updateField('color', e.target.value)}
              />
              <Input 
                value={config.color} 
                onChange={(e) => updateField('color', e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent">
          <ImageIcon className="w-5 h-5" /> Image de fond (Recto)
        </h2>
        <div className="space-y-4">
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
                <span className="relative z-10 bg-white/80 px-1 rounded">{bg.description.split(' ')[1]}</span>
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>URL personnalisée Recto</Label>
            <Input 
              value={config.backgroundImage} 
              onChange={(e) => updateField('backgroundImage', e.target.value)}
              placeholder="https://votre-image.jpg"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/30 rounded-xl border border-dashed">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-accent">
            <Layers className="w-5 h-5" /> Verso (Optionnel)
          </h2>
          <Switch 
            checked={config.hasVerso} 
            onCheckedChange={(val) => updateField('hasVerso', val)}
          />
        </div>
        
        {config.hasVerso && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <Label>Image du Verso (URL)</Label>
              <Input 
                value={config.versoBackgroundImage} 
                onChange={(e) => updateField('versoBackgroundImage', e.target.value)}
                placeholder="https://votre-image-dos.jpg"
              />
              <p className="text-[10px] text-muted-foreground italic">Le verso sera imprimé après chaque recto.</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent">
          <Sparkles className="w-5 h-5" /> Paramètres de génération
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Nombre de tickets</Label>
            <Input 
              type="number"
              value={config.quantity} 
              onChange={(e) => updateField('quantity', parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>Numéro de départ</Label>
            <Input 
              type="number"
              value={config.startingNumber} 
              onChange={(e) => updateField('startingNumber', parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Mode de numérotation</Label>
            <Select 
              value={config.generationMode} 
              onValueChange={(v) => updateField('generationMode', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sequential">Séquentiel (1, 2, 3...)</SelectItem>
                <SelectItem value="random">Aléatoire (Uniques)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button onClick={onPrint} className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg shadow-md">
          <Printer className="w-5 h-5 mr-2" /> Générer & Imprimer en PDF
        </Button>
      </div>
    </div>
  );
};
