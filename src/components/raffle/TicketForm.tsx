
"use client"

import React from 'react';
import { TicketConfig } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Settings2, Sparkles, Printer, Image as ImageIcon } from 'lucide-react';
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

  const handlePrizeChange = (index: number, value: string) => {
    const newPrizes = [...config.prizes];
    newPrizes[index] = value;
    updateField('prizes', newPrizes);
  };

  const addPrize = () => {
    updateField('prizes', [...config.prizes, "Nouveau lot"]);
  };

  const removePrize = (index: number) => {
    updateField('prizes', config.prizes.filter((_, i) => i !== index));
  };

  const backgroundPresets = PlaceHolderImages.filter(img => img.id.startsWith('bg-'));

  return (
    <div className="space-y-8 bg-white p-6 rounded-2xl shadow-sm border border-border">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent">
          <Settings2 className="w-5 h-5" /> Personnalisation
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Titre de l'événement</Label>
            <Input 
              value={config.title} 
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ex: Grande Tombola d'Hiver"
            />
          </div>
          <div className="space-y-2">
            <Label>Organisateur</Label>
            <Input 
              value={config.organizer} 
              onChange={(e) => updateField('organizer', e.target.value)}
              placeholder="Ex: Association des Commerçants"
            />
          </div>
          <div className="space-y-2">
            <Label>Date de l'événement</Label>
            <Input 
              type="date"
              value={config.date} 
              onChange={(e) => updateField('date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Lieu</Label>
            <Input 
              value={config.location} 
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Ex: Hôtel de Ville"
            />
          </div>
          <div className="space-y-2">
            <Label>Prix du billet</Label>
            <Input 
              value={config.price} 
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="Ex: 5€"
            />
          </div>
          <div className="space-y-2">
            <Label>Couleur du thème</Label>
            <div className="flex gap-2">
               <Input 
                type="color"
                className="w-12 p-1"
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
          <ImageIcon className="w-5 h-5" /> Image de fond
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
            <Label>URL personnalisée</Label>
            <Input 
              value={config.backgroundImage} 
              onChange={(e) => updateField('backgroundImage', e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-accent">
          <Trash2 className="w-5 h-5" /> Lots à gagner
        </h2>
        <div className="space-y-3">
          {config.prizes.map((prize, idx) => (
            <div key={idx} className="flex gap-2">
              <Input 
                value={prize} 
                onChange={(e) => handlePrizeChange(idx, e.target.value)}
                placeholder={`Lot n°${idx + 1}`}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removePrize(idx)}
                disabled={config.prizes.length <= 1}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addPrize} className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" /> Ajouter un lot
          </Button>
        </div>
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
          <div className="space-y-2">
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
