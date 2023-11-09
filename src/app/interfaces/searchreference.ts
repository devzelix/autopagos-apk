export interface SearchReference {
    Referencia: string;
    Fecha: string;
    Monto: string;
    BancoEmisor: string;
    BancoReceptor: {
        Banco: string;
        id_cuba: string;
        numero_cuenta: string;
        Franquicia: [ string ],
        referencia_cuenta: string 
    }
}