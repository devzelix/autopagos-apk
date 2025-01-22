export interface Contratos { 
    id_contrato: string, 
    contrato: string, 
    saldo: string, 
    cliente: string, 
    monto_pend_conciliar: number, 
    subscription: string, 
    franquicia: string,
    status_contrato: string,
    sector?:string
}

export interface IUserSaldo {
    cambio_act: string;
    cedula: string;
    cliente: string;
    franquicia: string;
    id_contrato: string;
    monto_pend_conciliar: number;
    nro_contrato: string;
    saldo: string;
    status_contrato: string;
    suscripcion: string;
    ultimo_fecha_pago: string;
    ultimo_monto_pago: string;
}

export interface IUserListItem extends Omit<IUserSaldo, 'saldo'> {
    is_user_valid?: boolean;
    saldo: number;
    isDebtor: boolean
}