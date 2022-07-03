import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { BankList } from '../interfaces/bankList';
import { RegisterPayService } from './register-pay.service';

@Injectable({
  providedIn: 'root'
})
export class DataBankService {
  ListBanco: any = []
  BankExclu: any = ["01720110711106019647", "01720110721105997686", "01720110701106017088", "01050652211652024484", "01750365160080076155", "01150047130470052498", "0134049768497102010", "01560027640000479832", "01020453410000103758", "01050039721039372414", "1190244381", "0771587208", "00000001942492809086", "0012345678", "01560012890201743177", "1520036821", "01050039781039372392", "0000069363", "2180176064", "6011305590098", "01010101010101010101", "898120456788", "1678910978", "01280050925009019129"]
  BankAragua: any = ["1190244381", "2180176064", "01050652281652022163", "01090080482380006802", "898120456788", "0000069363", "01010101010101010101"]
  public bankList = new Subject<BankList[]>();

  BankDollar: any = []

  constructor(
    private registerPayService: RegisterPayService,
  ) {
    this.GetList()
  }

  GetList() {
    try {
      this.registerPayService.getNewBankList().subscribe((ResSae: any) => {
        for (let indexSae = 0; indexSae < ResSae.length; indexSae++) {
          if (!this.BankExclu.includes(ResSae[indexSae].numero_cuenta)) {

            this.ListBanco.push({
              Banco: this.DictionaryBank(ResSae[indexSae].banco, "ALL", ResSae[indexSae].numero_cuenta),
              id_cuba: ResSae[indexSae].id_cuba,
              numero_cuenta: ResSae[indexSae].numero_cuenta,
              Franquicia: ["FIBEX-all"],
              referencia_cuenta: ResSae[indexSae].numero_cuenta.substr(-4)
            })

          }
          if (this.BankAragua.includes(ResSae[indexSae].numero_cuenta)) {
            this.ListBanco.push({
              Banco: this.DictionaryBank(ResSae[indexSae].banco, "ARAGUA", ResSae[indexSae].numero_cuenta),
              id_cuba: ResSae[indexSae].id_cuba,
              numero_cuenta: ResSae[indexSae].numero_cuenta,
              Franquicia: ["FIBEX ARAGUA"],
              referencia_cuenta: ResSae[indexSae].numero_cuenta.substr(-4)
            })

          }
        }

        this, this.bankList.next(this.ListBanco);
      })
    } catch (error) {
      console.error(error)
    }
  }


  getBankList(): Observable<BankList[]> {
    return of(this.ListBanco)
    /* return [
      { Banco: "MERCANTIL (Bs.)", id_cuba: "", numero_cuenta: "01050190311190244381", Franquicia: ["FIBEX ARAGUA"], referencia_cuenta: '4381' },
      { Banco: "MERCANTIL (Bs.)", id_cuba: "", numero_cuenta: "01050190311190244381", Franquicia: ["FIBEX-all"], referencia_cuenta: '4381' },
      { Banco: "BANK OF AMERICA", id_cuba: "", numero_cuenta: "", Franquicia: ["FIBEX-all"], referencia_cuenta: '' },
      { Banco: "BNC (Bs.)", id_cuba: "", numero_cuenta: "01910080402180176064", Franquicia: ["FIBEX ARAGUA", "FIBEX-all"], referencia_cuenta: '6064' },
      { Banco: "BNC (Dolar)", id_cuba: "", numero_cuenta: "01910080482380006802", Franquicia: ["FIBEX ARAGUA", "FIBEX-all"], referencia_cuenta: '6802' },
      { Banco: "ZELLE", id_cuba: "", numero_cuenta: "pagos@fibextelecom.com", Franquicia: ["FIBEX ARAGUA"], referencia_cuenta: 'pagos@fibextelecom.com' },
      { Banco: "ZELLE", id_cuba: "", numero_cuenta: "pagos3@fibextelecom.net", Franquicia: ["FIBEX-all"], referencia_cuenta: 'pagos3@fibextelecom.net' },
      { Banco: "BANESCO (Bs.)", id_cuba: "", numero_cuenta: "110000069363", Franquicia: ["FIBEX ARAGUA"], referencia_cuenta: '9363' }
    ]; */
  }

  DictionaryBank(Banco: any, Franquisia: string, numero_cuenta: string) {
    try {
      let ListDictionaryBank: any = Franquisia == "ARAGUA" ? [
        { Banco: "WELL FARGO", Replace: "ZELLE WELL FARGO" },
        {
          Banco: "BANK OF AMERICA", Replace: "USD CUENTA BANK OF AMERICA pagos@fibextelecom.com"
        }] : [
        { Banco: "WELL FARGO", Replace: "ZELLE WELL FARGO pagos3@fibextelecom.net" },
        {
          Banco: "BANK OF AMERICA", Replace: "USD BANK OF AMERICA TRANSFERENCIA"
        }]
      const NewReplace = ListDictionaryBank.find((x: any) => x.Banco == Banco)


      if (numero_cuenta == "01910107022300007074") {
        return "USD BANCO NACIONAL CREDITO"
      }
      if (NewReplace) {
        return NewReplace.Replace
      } else {
        return Banco
      }

    } catch (error) {

    }
  }

  // 11229897

}
