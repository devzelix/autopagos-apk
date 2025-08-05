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
  mac_address: string;
  is_anulation: boolean;
}

export interface IUploadFile {
  register: string;
  path: string;
}
