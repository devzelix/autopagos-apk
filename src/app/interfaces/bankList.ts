export interface BankList {
    Banco: string;
    id_cuba: string;
    numero_cuenta: string;
    Franquicia: string[];
    referencia_cuenta: string;
}

export interface BankListC2P {
    Name: string;
    Code: string;
    Services: string;
}



type BankEmisor =[{
    Banco: string
    Max: number
    Cero: any
}]

export interface BankE {
    Banco: string
    Max: number
    Cero: any
}


export const BankEmisorS  = [
    {
        Banco: "Mercantil",
        Max: 11,
        Cero: false,
        regex:"/^([0-9])*$/"
    },
    {
        Banco: "Venezuela",
        Max: 8,
        Cero: false,
        regex:"/^([0-9])*$/"
    },
    {
        Banco: "Nacional de Crédito",
        Max: 11,
        Cero: true,
        regex:"/^([0-9])*$/"
    },
    {
        Banco: "Provincial",
        Max: 11,
        Cero: false,
        regex:"/^([0-9])*$/"
    },
    {
        Banco: "Banca Amiga",
        Max: 11,
        Cero: false,
        regex:"/^([0-9])*$/"
    },
    {
        Banco: "Banesco",
        Max: 11,
        Cero: false,
        regex:"/^([0-9])*$/"
    },
    {
        Banco: "Otro",
        Max: 20,
        Cero: false,
        regex:"/^([0-9])*$/"
    }

  ]

export interface IPayInfoData {
  fecha_reg: Date;
  numero_ref:number
  status_pd:string;
}
