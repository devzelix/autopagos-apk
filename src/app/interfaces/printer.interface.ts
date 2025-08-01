export interface IPrintTicket {
  date: string;
  hours: string;
  refundNumber: string;
  numSeq: string;
  abononumber: string;
  status: string;
  describe: string;
  amount: string;
  methodPayment: string;
}

export interface IUploadFile {
  register: string;
  path: string;
}
