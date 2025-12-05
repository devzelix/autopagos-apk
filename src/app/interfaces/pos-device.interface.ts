export interface IPosDevice {
    id_pos_device: number;
    device_model: string;
    serial_number: string;
    terminalVirtual: string;
    ip_address: string;
    port: number;
    acquisition_date: string;
    note: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    id_checkout: number | null;
    created_at: string;
    updated_at: string;
    checkout_box: any | null;
}

export interface IPosDeviceResponse {
    success: boolean;
    message: string;
    data: IPosDevice[];
}
