export let DataSlide = [
  {
    "Data": [
      {
        Title: "Cedula",
        id: 0,
        Option: "pg1-1",
        Data: "",
        Act: "1"
      },
      {
        Title: "Bancos",
        id: 1,
        Option: "pg1-2",
        Data: "",
        Act: "1"
      },
      {
        Title: "Email",
        id: 2,
        Option: "pg1-3",
        Data: "",
        Act: "1"
      },
      {
        Title: "Abonado",
        id: 3,
        Option: "pg1-4",
        Data: "",
        Act: "1"
      },
      {
        Title: "Monto_Pagado",
        id: 4,
        Option: "pg1-5",
        Data: "",
        Act: "1"
      },
      {
        Title: "Fecha_Pago",
        id: 5,
        Option: "pg1-6",
        Data: "",
        Act: "1"
      },
      {
        Title: "Nombre",
        id: 6,
        Option: "pg1-7",
        Data: "",
        Act: "1"
      },
      {
        Title: "Pendiente_por_conciliar",
        id: 7,
        Option: "pg1-8",
        Data: "",
        Act: "1"
      },
      {
        Title: "Saldo_Bs",
        id: 8,
        Option: "pg1-9",
        Data: "",
        Act: "1"
      },
      {
        Title: "Saldo_USD",
        id: 9,
        Option: "pg1-10",
        Data: "",
        Act: "1"
      }

    ]
  },
  {
    "Data": [
      {
        Title: "Nombre_titular_cuenta",
        id: 6,
        Option: "pg2-1",
        Data: "",
        Act: "2"
      },
      {
        Title: "Email_titular_cuenta",
        id: 7,
        Option: "pg2-2",
        Data: "",
        Act: "2"
      },
      {
        Title: "Numero_comprobante",
        id: 8,
        Option: "pg2-3",
        Data: "",
        Act: "2"
      }
    ]
  },
  {
    "Data": [
      {
        Title: "Comprobante",
        id: 9,
        Option: "pg3-1",
        Data: "",
        Act: "3"
      },
      {
        Title: "Notas",
        id: 10,
        Option: "pg3-2",
        Data: "",
        Act: "3"
      },
    ]
  },
  {
    "Data": [
      {
        Title: "Pago_Registrado",
        id: 11,
        Option: "pg4-1",
        Data: "",
        Act: "4"
      }
    ]
  }
]

export let DatosPagoMovil = ['584129637516, 308182516, 0105']

export let MetodoDePago2 = [
  {
    idpago: 6,
    tipopago: "Zelle",
    image: 'assets/images/Icono_Zelle.png',
    alt: 'Zelle',
    omitir: false,
  },
  {
    idpago: 4,
    tipopago: "Transferencia",
    omitir: false,
    image: 'assets/images/Icono_Transferencia-Pagos_Fibex.png',
    alt: 'Otros'
  }
]

export let MetodoDePago3 = [
  {
    idpago: 5,
    tipopago: "Criptomoneda",
    omitir: true,
    image: 'assets/images/Coincoinx.png'
  },
  {
    idpago: 10,
    tipopago: "Zelle",
    image: 'assets/images/Icono_Zelle.png',
    alt: 'Zelle',
    omitir: false,
  },
  {
    idpago: 9,
    tipopago: "Paypal",
    omitir: false,
    image: 'assets/images/Paypal_2014_logo.png'
  },
  {
    idpago: 28,
    tipopago: "T.C. Internacional",
    omitir: false,
    image: 'assets/images/Tarjetas de Credito_Mesa de trabajo 1.jpg',
  },
  {
    idpago: 0,
    tipopago: "Débito",
    image: 'assets/images/Icono TDD_Mercantil-Pagos Fibex.jpeg',
    alt: 'Débito Mercantil',
    omitir: false,
  },
  {
    idpago: 31,
    tipopago: "Débito Inmediato",
    image: 'assets/images/BOTON-2_1-PNG.png',
    alt: 'Débito Inmediato',
    omitir: false,
  },
  {
    idpago: 1,
    tipopago: "T.C. Nacional",
    image: 'assets/images/Tarjeta de Credito Nacional.jpg',
    alt: 'Crédito',
    omitir: false,
  },
  {
    idpago: 2,
    tipopago: "Pago Móvil",
    image: 'assets/images/Icono_Pago_Movil-Pagos_Fibex.png',
    omitir: false,
    alt: 'Pago Móvil'
  }
]

export let FormasDePago = [
  {
    idpago: 29,
    tipopago: "FormasDePago",
    tittle: "Reportar",
    omitir: false,
  },
  {
    idpago: 30,
    tipopago: "FormasDePago",
    tittle: "Pagar",
    omitir: false,
  }
]

export const ListBankPago = [
  {
    tittle: "Mercantil",
    image: 'assets/images/Logo_Mercantil.png',
    omitir: false,
    opcion: 'mercantil'
  },
  {
    tittle: "BNC",
    image: 'assets/images/Logo_BNC.png',
    omitir: false,
    opcion: 'BNC'
  },
  {
    tittle: "100% Banco",
    image: 'assets/images/BOTON-2_1-PNG.png',
    omitir: false,
    opcion:'100% Banco'
  },
  {
    tittle: "Otros bancos",
    image: 'assets/images/Logo_OtrosBancos.png',
    omitir: false,
    opcion:'otros'
  }

]

export const DebitoInmediato = [
  {
    tittle: "100% Banco",
    image: 'assets/images/BOTON-2_1-PNG.png',
    omitir: false,
    opcion:'100% Banco'
  }
]

export let TypeAccount = [{ id: 0, cuenta: "Ahorro", type: "CA" }, { id: 1, cuenta: "Corriente", type: "CC" }]

export let Month = [{ month: "01" }, { month: "02" }, { month: "03" }, { month: "04" }, { month: "05" }, { month: "06" }, { month: "07" }, { month: "08" }, { month: "09" }, { month: "10" }, { month: "11" }, { month: "12" }]

export let Ano = [{ ano: "2018" }, { ano: "2019" }, { ano: "2020" }, { ano: "2021" }, { ano: "2022" }, { ano: "2023" }, { ano: "2024" }, { ano: "2025" }, { ano: "2026" }, { ano: "2027" }, { ano: "2028" }, { ano: "2029" }, { ano: "2030" }, { ano: "2031" }, { ano: "2032" }]

export const PlantillaConfirmPago = [
  {
    idplantilla: 1,
    tipo: "tdd",
    campos: ['this.pref_ciDC?.value+this.c_iDC?.value', 'this.typeCuenta?.value', 'this.Ncard?.value', 'this.cantidadDC?.value'],
    replace: ['#CEDULA', '#CUENTA', '#TARJETA', '#BOLIVARES'],
    html: `<div align="left"><strong>Cedula:</strong> #CEDULA <br> <strong>Cuenta:</strong> #CUENTA <br> <strong>Nro. tarjeta:</strong> #TARJETA <br> <strong>Cantidad a pagar en Bolivares:</strong> #BOLIVARES <br></div>`
  },
  {
    idplantilla: 2,
    tipo: "tdc",
    campos: ['this.pref_ciDC?.value+this.c_iDC?.value', 'this.Ncard?.value', 'this.cantidadDC?.value'],
    replace: ['#CEDULA', '#TARJETA', '#BOLIVARES'],
    html: `<div align="left"><strong>Cedula:</strong> #CEDULA <br> <strong>Nro. tarjeta:</strong> #TARJETA<br> <strong>Cantidad a pagar en Bolivares:</strong> #BOLIVARES<br></div>`
  },
  {
    id: 3,
    tipo: "c2pmercantil",
    campos: ['this.BancoDefault', 'this.pref_ci?.value+this.c_iRegPgoMvil?.value', 'this.tlfdestin?.value', 'this.amountPm?.value'],
    replace: ['#BANCO', '#CEDULA', '#TLF', '#BOLIVARES'],
    html: `<div align="left"> <strong>Banco:</strong> #BANCO <br> <strong>Cedula:</strong> #CEDULA <br>  <strong>Teléfono:</strong> #TLF <br> <strong>Cantidad a pagar en Bolivares:</strong> #BOLIVARES<br></div>`
  },
  {
    id: 4,
    tipo: "c2pnacional",
    campos: ['this.prec_i?.value+this.c_iPagMovil?.value', 'this.referenciapm?.value', 'this.cantidad?.value'],
    replace: ['#CEDULA', '#REFERENCIA', '#BOLIVARES'],
    html: `<div align="left"><strong>Cedula:</strong> #CEDULA <br>  <strong>Comprobante:</strong> #REFERENCIA <br> <strong>Cantidad a pagar en Bolivares:</strong> #BOLIVARES<br></div>`
  },
  {
    id: 5,
    tipo: "c2p100x100Banco",
    campos: ['this.NameBank', 'this.pref_ci?.value+this.c_iRegPgoMvil?.value', 'this.tlfdestin?.value', 'this.amountPm?.value'],
    replace: ['#BANCO', '#CEDULA', '#TLF', '#BOLIVARES'],
    html: `<div align="left"> <strong>Banco:</strong> #BANCO <br> <strong>Cédula:</strong> #CEDULA <br>  <strong>Teléfono:</strong> #TLF <br> <strong>Cantidad a pagar en Bolivares:</strong> #BOLIVARES<br></div>`
  },
  {
    id: 6,
    tipo: "debito100porciento",
    campos: ['this.NameBank','this.pref?.value+this.dni?.value','this.CountNumber?.value','this.Amount?.value'],
    replace: ['#BANCO','#CEDULA', '#TLFoNroC', '#BOLIVARES'],
    html: `<div align="left"> <strong>Banco:</strong> #BANCO <br> <strong>Cédula:</strong> #CEDULA <br>  <strong>Teléfono:</strong> #TLFoNroC <br> <strong>Cantidad a pagar en Bolivares:</strong> #BOLIVARES<br></div>`
  }

]
