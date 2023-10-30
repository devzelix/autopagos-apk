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