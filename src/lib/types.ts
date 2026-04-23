
export type TicketType = 'event_vip' | 'event' | 'raffle' | 'custom';

export interface NumberingInstance {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color?: string;
  autoContrast?: boolean;
}

export interface QRCodeInstance {
  id: string;
  content: string;
  size: number;
  x: number;
  y: number;
}

export interface TicketConfig {
  startingNumber: number;
  quantity: number;
  generationMode: 'sequential' | 'random' | 'api';
  color: string;
  backgroundImage?: string;
  hasVerso: boolean;
  versoBackgroundImage?: string;
  numberings: NumberingInstance[];
  activeNumberingId: string;
  ticketType: TicketType;
  autoContrast?: boolean;
  numberPrefix?: string;
  numberSuffix?: string;
  ticketWidth: number; // en mm
  ticketHeight: number; // en mm
  showNumbering: boolean;
  // QR Code Config
  showQRCode: boolean;
  qrCodes: QRCodeInstance[];
  activeQRCodeId: string;
  // API Codes
  fetchedCodes: string[];
}

export const DEFAULT_CONFIG: TicketConfig = {
  startingNumber: 1,
  quantity: 50,
  generationMode: 'api',
  color: "#E8308C",
  backgroundImage: "",
  hasVerso: false,
  versoBackgroundImage: "",
  numberings: [
    { id: 'num-1', x: 85, y: 15, size: 24, rotation: 0 }
  ],
  activeNumberingId: 'num-1',
  ticketType: 'event_vip',
  autoContrast: false,
  numberPrefix: "",
  numberSuffix: "",
  ticketWidth: 140,
  ticketHeight: 70,
  showNumbering: true,
  // Default QR Code Values
  showQRCode: false,
  qrCodes: [
    { id: 'qr-1', content: "[NUM]", size: 40, x: 15, y: 50 }
  ],
  activeQRCodeId: 'qr-1',
  fetchedCodes: [],
};
