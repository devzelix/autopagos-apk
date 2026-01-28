import { IPaymentMethod, IBankOption, IStepConfig } from '../interfaces/payment-methods.interface';

export const PAYMENT_METHODS: IPaymentMethod[] = [
  {
    id: 'c2p',
    name: 'C2P',
    description: 'Pago Cliente a Persona',
    icon: 'phone_iphone',
    infoText: 'Realiza pagos directamente desde tu cuenta bancaria usando tu teléfono móvil. Es rápido, seguro y no requiere tarjeta física.'
  },
  {
    id: 'debito_inmediato',
    name: 'Débito Inmediato',
    description: 'Pago con Débito',
    icon: 'credit_card',
    infoText: 'Paga directamente desde tu cuenta de débito. El monto se descuenta inmediatamente de tu cuenta bancaria.'
  },
  {
    id: 'punto_venta',
    name: 'Punto de Venta',
    description: 'Pago con Tarjeta',
    icon: 'point_of_sale',
    infoText: 'Paga con tu tarjeta de débito o crédito usando el punto de venta. Acepta todas las tarjetas bancarias.'
  }
];

export const BANKS_C2P: IBankOption[] = [
  { code: '0102', name: 'Banco de Venezuela' },
  { code: '0104', name: 'Banco Venezolano de Crédito' },
  { code: '0105', name: 'Banco Mercantil' },
  { code: '0108', name: 'Banco Provincial' },
  { code: '0114', name: 'Bancaribe' },
  { code: '0115', name: 'Banco Exterior' },
  { code: '0128', name: 'Banco Caroní' },
  { code: '0134', name: 'Banesco' },
  { code: '0137', name: 'Banco Sofitasa' },
  { code: '0138', name: 'Banco Plaza' },
  { code: '0146', name: 'Banco de la Gente Emprendedora (Bangente)' },
  { code: '0151', name: 'Banco Fondo Común (BFC)' },
  { code: '0156', name: '100% Banco' },
  { code: '0157', name: 'Banco Del Sur' },
  { code: '0163', name: 'Banco del Tesoro' },
  { code: '0166', name: 'Banco Agrícola de Venezuela' },
  { code: '0168', name: 'Bancrecer' },
  { code: '0169', name: 'Mi Banco' },
  { code: '0171', name: 'Banco Activo' },
  { code: '0172', name: 'Bancamiga' },
  { code: '0173', name: 'Banco Internacional de Desarrollo' },
  { code: '0174', name: 'Banplus' },
  { code: '0175', name: 'Banco Bicentenario del Pueblo' },
  { code: '0177', name: 'Banco de la Fuerza Armada Nacional Bolivariana (BANFANB)' },
  { code: '0191', name: 'Banco Nacional de Crédito (BNC)' }
];

export const C2P_STEP_CONFIG: IStepConfig[] = [
  {
    stepNumber: 1,
    title: 'Datos del Pagador',
    fields: [
      {
        name: 'nacionalidad',
        label: 'Nacionalidad',
        type: 'select',
        required: true,
        options: [
          { value: 'V', label: 'V - Venezolano' },
          { value: 'E', label: 'E - Extranjero' },
          { value: 'J', label: 'J - Jurídico' },
          { value: 'G', label: 'G - Gubernamental' }
        ],
        infoText: 'Selecciona el tipo de documento de identidad'
      },
      {
        name: 'cedula',
        label: 'Cédula del Pagador',
        type: 'tel',
        placeholder: 'Ej: 12345678',
        required: true,
        minLength: 6,
        maxLength: 10,
        pattern: '^[0-9]*$',
        infoText: 'Ingresa tu número de cédula sin puntos ni guiones'
      },
      {
        name: 'telefono',
        label: 'Teléfono del Pagador',
        type: 'tel',
        placeholder: 'Ej: 04121234567',
        required: true,
        minLength: 11,
        maxLength: 11,
        pattern: '^(0412|0414|0424|0416|0426)[0-9]{7}$',
        infoText: 'Ingresa tu número de teléfono móvil (11 dígitos sin el 0 inicial)'
      },
      {
        name: 'banco',
        label: 'Banco',
        type: 'select',
        required: true,
        options: BANKS_C2P.map(bank => ({ value: bank.code, label: bank.name })),
        infoText: 'Selecciona tu banco emisor'
      },
      {
        name: 'monto',
        label: 'Monto a Pagar (Bs.)',
        type: 'tel',
        placeholder: '0.00',
        required: true,
        maxLength: 12,
        pattern: '^[0-9]+(\\.[0-9]{1,2})?$',
        infoText: 'Ingresa el monto que deseas pagar en bolívares'
      }
    ]
  },
  {
    stepNumber: 2,
    title: 'Token de Confirmación',
    infoMessage: 'Para completar tu pago, ingresa el código OTP (Token) que te envió tu banco. Este código es temporal y lo recibes por SMS o en tu app bancaria.',
    fields: [
      {
        name: 'otp',
        label: 'Token/OTP del Banco',
        type: 'tel',
        placeholder: 'Ej: 123456',
        required: true,
        minLength: 4,
        maxLength: 8,
        pattern: '^[0-9]*$',
        infoText: 'Código de seguridad enviado por tu banco para confirmar la transacción'
      }
    ]
  }
];
