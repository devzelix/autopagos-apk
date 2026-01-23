export interface ICheckoutSession {
  id_sede: number;
  id_checkout: number;
  checkoutIdentify: string;
  ubiiposHost: string;
  terminalVirtual: string;
  id_pos_device: number;
  sessionTimestamp: number; // Timestamp de cuando se creó la sesión
  expiresAt: number | null; // Timestamp de expiración (null = sin expiración)
  checkout_ip_address?: string | null; // IP del checkout desde BD
}

