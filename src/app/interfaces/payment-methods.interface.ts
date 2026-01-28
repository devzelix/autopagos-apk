export type PaymentMethodType = 'c2p' | 'debito_inmediato' | 'punto_venta';

export interface IPaymentMethod {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: string;
  infoText: string;
}

export interface IStepConfig {
  stepNumber: number;
  title: string;
  fields: IFieldConfig[];
  infoMessage?: string;
}

export interface IFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'select' | 'number';
  placeholder?: string;
  required: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  options?: { value: string; label: string }[];
  infoText?: string;
  prefix?: string;
}

export interface IC2PFormData {
  nacionalidad: string;
  cedula: string;
  telefono: string;
  banco: string;
  monto: string;
  otp?: string;
}

export interface IC2PPayload {
  TelefonoDebito: string;
  Cedula: string;
  Banco: string;
  Monto: string;
  Otp: string;
  SaeData: {
    id_contrato: string;
    abonado: string;
    saldoActual: string;
  };
}

export interface IC2PResponse {
  status: number;
  data: {
    status: boolean;
    message: string;
    c2pResponse: {
      message: string;
      code: string;
      reference: string;
    };
    saeResponse: {
      success: boolean;
      data: {
        resultado: string;
        info: any;
      };
    };
  };
}

export interface IBankOption {
  code: string;
  name: string;
}
