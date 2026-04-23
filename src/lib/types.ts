
export type TicketType = 'event_vip' | 'event' | 'raffle' | 'custom';
export type TicketStatus = 'standard' | 'vip';

export interface NumberingInstance {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color?: string;
  autoContrast?: boolean;
}

export type QRCodeDotsType = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
export type QRCodeCornersSquareType = 'square' | 'dot' | 'extra-rounded';
export type QRCodeCornersDotType = 'square' | 'dot';
export type QRCodeGradientType = 'none' | 'linear' | 'radial';

export interface QRCodeInstance {
  id: string;
  content: string;
  size: number;
  x: number;
  y: number;
  fgColor?: string;
  bgColor?: string;
  margin?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  rotation?: number;
  // Body Styling
  dotsType?: QRCodeDotsType;
  gradientType?: QRCodeGradientType;
  gradientColor2?: string;
  // Corner Square Styling (External)
  cornersSquareType?: QRCodeCornersSquareType;
  cornersSquareColor?: string;
  cornersSquareGradientType?: QRCodeGradientType;
  cornersSquareGradientColor2?: string;
  // Corner Dot Styling (Internal)
  cornersDotType?: QRCodeCornersDotType;
  cornersDotColor?: string;
  cornersDotGradientType?: QRCodeGradientType;
  cornersDotGradientColor2?: string;
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
  ticketStatus: TicketStatus;
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
  ticketStatus: 'standard',
  autoContrast: false,
  numberPrefix: "",
  numberSuffix: "",
  ticketWidth: 140,
  ticketHeight: 70,
  showNumbering: true,
  // Default QR Code Values
  showQRCode: false,
  qrCodes: [
    { 
      id: 'qr-1', 
      content: "[NUM]", 
      size: 40, 
      x: 15, 
      y: 50,
      fgColor: "#000000",
      bgColor: "#FFFFFF",
      margin: 2,
      level: 'H',
      rotation: 0,
      dotsType: 'square',
      gradientType: 'none',
      gradientColor2: "#E8308C",
      cornersSquareType: 'square',
      cornersSquareColor: '#000000',
      cornersSquareGradientType: 'none',
      cornersDotType: 'square',
      cornersDotColor: '#000000',
      cornersDotGradientType: 'none'
    }
  ],
  activeQRCodeId: 'qr-1',
  fetchedCodes: [],
};
