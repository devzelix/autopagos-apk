export interface IPaymentRegister {
  id_contrato: string;
  mount: number;
  date: string;
  reference: string;
  comment: string;
  dni: string;
  abonado: string;
  balance: number;
}

export interface IPaymentCreate {
  dateTransaction: Date;
  numSeq: string;
  numRef: string;
  numSubscriber: string;
  lastCardNum: string;
  amount: number;
  terminalVirtual: string;
}
