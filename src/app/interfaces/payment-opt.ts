import { PAYMENT_OPTION } from '../providers/payment-data-opt';

export type DataOptionsType = {
  option: PAYMENT_OPTION;
};

export type IPaymentTypes = 'Débito' | 'Internacional' | 'Nacional';

export type ITypeDNI = 'V' | 'J' | 'E';

export type ITransactionInputs = 'dni' | 'mount' | 'accountType' | 'reference' | 'abonado';
