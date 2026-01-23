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
  checkoutIdentify: string;
  id_sede?: number | string;
  is_anulation: boolean;
  ipaddress?: string; // IP local del equipo
  is_closing?: boolean; // Indica si es un cierre de caja
  skip_print?: boolean; // Indica si se debe omitir la impresión en API Driver (ya se imprimió localmente)
}

export interface IUploadFile {
  pathRoute: string,
  register: string,
  typeFile: boolean /** @true (anulation files)(closing files) <-----> @false (ticket files)(pre-closing files) */
  adminFile: boolean /** @true (admin files) <-----> @false (Invoice files)*/
}

export interface IClosingBatch {
  responseType: string;
  transCodeResult: string;
  transMessageResult: string;
  transConfirmNum: string;
  fecha: string;
  terminal: string;
  afiliado: string;
  lote?: string;
  trace?: string;
  referencia?: string;
  metodoEntrada?: string;
  tipoTarjeta?: string;
  pan?: string;
  checkoutIdentify: string;
  id_sede?: number | string;
  closingDate: string;
  totalAmount?: number | string; // Monto total del cierre
}
