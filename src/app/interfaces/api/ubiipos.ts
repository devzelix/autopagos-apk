/**
 * Interface to request payment to Ubiipos
 */
export interface UbiiposDataSend {
  paymentId?: string; // Unique payment identifier
  amount?: number; // Amount to be paid
  uniqueSpId?: string;
  customerId: string; // Customer identifier (cedula or rif)
  stationId?: string;
  userId?: string;
  bOffice?: string;
  license?: string;
  operation: 'PAYMENT' | 'SETTLEMENT'; // Type of operation (PAYMENT=Pagos or SETTLEMENT=Cierre de lote)
  settleType?: 'N' | 'Q'; // Settlement type (N: Cierre Normal, Q: Cierre inmediato)
}

/**
 * Interface to response payment to Ubiipos
 */
export interface UbiiposResponse {
    status: number;
    message: string;
    data: any | null;
}
