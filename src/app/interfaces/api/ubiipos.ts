/**
 * Interface to request payment to Ubiipos
 */
export interface IUbiiposDataSend {
  paymentId?: string; // Unique payment identifier
  amount?: number | string; // Amount to be paid (en centavos, puede ser string o number)
  uniqueSpId?: string;
  customerId?: string; // Customer identifier (cedula or rif)
  stationId?: string;
  userId?: string;
  bOffice?: string;
  license?: string;
  operation?: 'PAYMENT' | 'SETTLEMENT' | 'PRINT' | 'VOID'; // Type of operation (PAYMENT=Pagos, SETTLEMENT=Cierre de lote, VOID=Anulación)
  settleType?: 'N' | 'Q'; // Settlement type (N: Cierre Normal, Q: Cierre inmediato)
  reference?: string; // Reference number for VOID operation (número de referencia de la transacción a anular)
}

// CIERRE DE LOTE ESTE SERIA EL BODY REQUEST
/**
  {
    paymentId = "fibexUbii",
    operation = "SETTLEMENT",
    settleType = "N"
  }
*/

// PARA IMPRIMIR EL ULTIMO RECIBO
/*
  {
    paymentId = "fibexUbii",
    operation = "PRINT"
  }
*/

// ANULACIÓN DE TRANSACCIÓN (VOID)
/**
  {
    postData: {
      paymentId: "Taubii",
      reference: "251216000079",
      operation: "VOID"
    }
  }
*/
