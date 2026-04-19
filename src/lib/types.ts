
export type TicketType = 'event_vip' | 'event' | 'raffle' | 'custom';

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
  numberRotation: number;
  ticketType: TicketType;
  autoContrast?: boolean;
  numberPrefix?: string;
  numberSuffix?: string;
  ticketWidth: number; // en mm
  ticketHeight: number; // en mm
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
  numberRotation: 0,
  ticketType: 'event_vip',
  autoContrast: false,
  numberPrefix: "",
  numberSuffix: "",
  ticketWidth: 140,
  ticketHeight: 70,
};
