export interface IPrintTicket {
  date: string;
  hours: string;
  refNumber: string;
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
  pathRoute: string,
  register: string,
  typeFile: boolean /** @true (anulation files)(closing files) <-----> @false (ticket files)(pre-closing files) */
  adminFile: boolean /** @true (admin files) <-----> @false (Invoice files)*/
}
