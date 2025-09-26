/**
 * Interface to request payment to Ubiipos
 */
export interface UbiiposDataSend {
    paymentId: string;
    amount?: number;
    uniqueSpId: string;
    customerId: string;
    stationId: string;
    userId: string;
    bOffice: string;
    license: string;
    operation: 'PAYMENT' | 'SETTLEMENT';
    settleType?: 'N' | 'Q';
}

export interface UbiiposRequest {
    posData: UbiiposDataSend;
}

/**
 * Interface to response payment to Ubiipos
 */
export interface UbiiposResponse {
    status: string;
    message: string;
    data: {
        // Information about the payment    
    }    
}