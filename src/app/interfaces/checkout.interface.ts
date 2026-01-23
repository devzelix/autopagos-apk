export interface ICheckout {
    id_checkout: number;
    checkoutModel: string;
    checkoutSerial: string;
    checkout_identify: string;
    id_sede: number;
    created_at: string;
    updated_at: string;
    is_available: boolean;
    ip_address: string | null;
}

export interface ICheckoutResponse {
    success: boolean;
    message: string;
    data: ICheckout[]; // Array de cajas
}
