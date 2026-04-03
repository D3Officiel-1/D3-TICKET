
export interface TicketConfig {
  startingNumber: number;
  quantity: number;
  generationMode: 'sequential' | 'random';
  color: string;
  backgroundImage?: string;
}

export const DEFAULT_CONFIG: TicketConfig = {
  startingNumber: 1,
  quantity: 50,
  generationMode: 'sequential',
  color: "#E8308C",
  backgroundImage: ""
};
