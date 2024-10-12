export interface ResponseMethod{
    status: boolean
    codigo:number,
    message:string,
    data:any
}

export interface IAccount {
    cambio_act: string
    cedula: string
    cliente: string
    franquicia: string
    id_contrato: string
    monto_pend_conciliar: number
    nro_contrato: string
    saldo: string
    status_contrato: string
    suscripcion: string
    ultimo_fecha_pago: string
    ultimo_monto_pago: string
}