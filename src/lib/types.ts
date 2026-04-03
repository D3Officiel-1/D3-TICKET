
export type TicketType = 'event_vip' | 'event' | 'raffle';

export interface TicketConfig {
  startingNumber: number;
  quantity: number;
  generationMode: 'sequential' | 'random';
  color: string;
  backgroundImage?: string;
  hasVerso: boolean;
  versoBackgroundImage?: string;
  numberX: number;
  numberY: number;
  numberSize: number;
  ticketType: TicketType;
}

export const DEFAULT_CONFIG: TicketConfig = {
  startingNumber: 1,
  quantity: 50,
  generationMode: 'sequential',
  color: "#E8308C",
  backgroundImage: "",
  hasVerso: false,
  versoBackgroundImage: "",
  numberX: 85,
  numberY: 15,
  numberSize: 24,
  ticketType: 'event_vip',
};
