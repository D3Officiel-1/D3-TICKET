
export interface TicketConfig {
  title: string;
  organizer: string;
  date: string;
  location: string;
  prizes: string[];
  price: string;
  startingNumber: number;
  quantity: number;
  generationMode: 'sequential' | 'random';
  color: string;
}

export const DEFAULT_CONFIG: TicketConfig = {
  title: "Grande Tombola Annuelle",
  organizer: "Association D3",
  date: "2024-12-25",
  location: "Salle des Fêtes, Paris",
  prizes: ["Voyage à Venise", "Téléviseur 4K", "Bon d'achat 100€"],
  price: "2.00€",
  startingNumber: 1,
  quantity: 50,
  generationMode: 'sequential',
  color: "#E8308C"
};
