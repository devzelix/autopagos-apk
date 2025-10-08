export interface IPaymentRegister {
  id_contrato: string;
  mount: string;
  date: string;
  reference: string;
  comment: string;
  dni: string;
  abonado: string;
  balance: string;
}

export interface IPaymentCreate {
  dateTransaction: Date;
  numSeq: string;
  numRef: string;
  numSubscriber: string;
  lastCardNum: string;
  amount: string;
  terminalVirtual: string;
  status: 'APPROVED' | 'PENDING' | 'DECLINED' | 'CANCELLED'
}
