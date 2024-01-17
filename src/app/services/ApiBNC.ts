import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";
import * as CryptoJS from 'crypto-js';

@Injectable({
    providedIn: 'root'
})
export class ApiBNCService {

    GlobalHeader: any = {
        //origin: 'https://pagos.thomas-talk.me/',
        accion: '',
        wt: '',
    }

    constructor(private http: HttpClient) {}

    EncryptDatos(Data: any) {
        return CryptoJS.AES.encrypt(Data, environment.securityEncrt, {
            keySize: 16,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        }).toString();
    }

    MasterPost(Data: any, Headers: any) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                let MsgError: string
                Data.ChildClientID = ''
                console.log(Data)
                console.log(Headers)
                this.http.post('http://localhost:9005/'  /* 'https://apitest3.thomas-talk.me/' */, Data, { headers: Headers }).subscribe((Res: any) => {
                    console.log("Res BNC")
                    if (Res && Res.status === true) {
                        console.log("Tengo la respuesta true de BNC")
                        resolve(Res)
                    } else if (Res && Res.Error) {
                        console.log("entre en el else de error")
                        const TipoError: any = Res.Error
                        if (typeof TipoError === 'object') {
                            for (var key in TipoError) { MsgError = TipoError[key][0] }
                        } else { console.log(TipoError) }
                        resolve({ status: false, MsgError, message: Res.message })
                    }
                }, (err: any) => {
                    console.error("err BNC")
                    console.error(err)
                    reject(err)
                })
            } catch (error) {
                console.error(error)
            }
        })
    }

    MasterGet(Headers: any) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                let MsgError: string
                this.http.get('http://localhost:9005/'  /* 'https://apitest3.thomas-talk.me/' */, { headers: Headers }).subscribe((Res: any) => {
                    console.log("Res BNC")
                    if (Res && Res.status === true) {
                        console.log(Res)
                        resolve(Res)
                    } else if (Res && Res.Error) {
                        console.log("entre en el else de error")
                        const TipoError: any = Res.Error
                        if (typeof TipoError === 'object') {
                            for (var key in TipoError) { MsgError = TipoError[key][0] }
                        } else { console.log(TipoError) }
                        resolve({ status: false, MsgError, message: Res.message })
                    }
                }, (err: any) => {
                    console.error("err BNC")
                    console.error(err)
                    reject(err)
                })
            } catch (error) {
                console.error(error)
            }
        })
    }

    PayC2P(DatosPay: any) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                this.GlobalHeader.accion = this.EncryptDatos('MobilePayment')
                this.GlobalHeader.wt = this.EncryptDatos(environment.TokenBNC)
                this.MasterPost(DatosPay, this.GlobalHeader).then((Res: any) => { resolve(Res) }).catch((err: any) => { reject(err) })
            } catch (error) {
                console.error(error)
            }
        })
    }

    Pay_POs_Virtual(DatosPay: any) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                this.GlobalHeader.accion = this.EncryptDatos('VirtualPos')
                this.GlobalHeader.wt = this.EncryptDatos(environment.TokenBNC)

                const Data: any = {
                    "Abonado": DatosPay.Abonado,
                    "IdContrato": DatosPay.Contrato,
                    "Amount": DatosPay.Amount,
                    "Name": DatosPay.CardName,
                    "ChildClientID": DatosPay.pref_ci + DatosPay.CI,
                    "AccountType": DatosPay.AccountType,
                    "CardHolderID": DatosPay.CardHolderId,
                    "CardNumber": DatosPay.CardNumber,
                    "CardPIN": DatosPay.CardPIN,
                    "CVV": DatosPay.CVV,
                    "dtExpiration": DatosPay.fvncmtoMes + DatosPay.fvncmtoAno,
                    "idCardType": DatosPay.TipoPago,
                    "TransactionIdentifier": "Prueba",
                }

                this.MasterPost(Data, this.GlobalHeader).then((Res: any) => { resolve(Res) }).catch((err: any) => { reject(err) })

            } catch (error) {
                console.error(error)
            }
        })
    }

    Pay_Credit(DatosPay: any) {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                this.GlobalHeader.accion = this.EncryptDatos('Credit')
                this.GlobalHeader.wt = this.EncryptDatos(environment.TokenBNC)

                const Data: any = {
                    "Abonado": DatosPay.Abonado,
                    "IdContrato": DatosPay.Contrato,
                    "Amount": DatosPay.Amount,
                    "Name": DatosPay.CardName,
                    "ChildClientID": DatosPay.pref_ci + DatosPay.CI,
                    "Description": DatosPay.Description,
                    "CardNumber": DatosPay.CardNumber
                }

                this.MasterPost(Data, this.GlobalHeader).then((Res: any) => { resolve(Res) }).catch((err: any) => { reject(err) })

            } catch (error) {
                console.error(error)
            }
        })
    }

    listBanks() {
        return new Promise(async (resolve: any, reject: any) => {
            try {
                this.GlobalHeader.accion = this.EncryptDatos('Bank_List')
                this.GlobalHeader.wt = this.EncryptDatos(environment.TokenBNC)

                this.MasterGet(this.GlobalHeader).then((Res: any) => { resolve(Res) }).catch((err: any) => { reject(err) })

            } catch (error) {
                console.error(error)
            }
        })
    }

}