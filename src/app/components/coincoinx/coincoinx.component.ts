import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment'
import { CoinxService } from 'src/app/services/coinxServices'
import { HelperService } from 'src/app/services/helper.service';
import { SeguridadDatos } from 'src/app/services/bscript.service';
import { Router } from '@angular/router';
declare var cargar:any;


@Component({
  selector: 'app-coincoinx',
  templateUrl: './coincoinx.component.html',
  styleUrls: ['./coincoinx.component.scss']
})
export class CoincoinxComponent implements OnInit {

  public nameClient: any = '';
  public Monto: any='';
  private WidgetID = environment.WidgetID;
  private WidgetAdress = environment.DireccionWidget;
  public Error : boolean = false;


  constructor( private _CoinxServices: CoinxService, private _helper: HelperService, private _seguridadDatos: SeguridadDatos, public router: Router) { }

  ngOnInit(): void {
    this.Monto =localStorage.getItem("Monto") ? localStorage.getItem("Monto") : "";
    this.nameClient =localStorage.getItem("Name") ? localStorage.getItem("Name") : "";

    //Obtengo el token para poder realizar el pago
    this._CoinxServices.TokenWidget()
    .then((resp:any)=>{
      if(resp!=undefined && resp){
        console.log(resp);
        //Coloco los valores en los atributos del html
        document.getElementById("coincoinx-widget")?.setAttribute('data-apikey',resp.CoincoinXToken);
        document.getElementById("coincoinx-widget")?.setAttribute('data-idwidget',this.WidgetID);
        document.getElementById("coincoinx-widget")?.setAttribute('data-direccion',this.WidgetAdress);
        document.getElementById("coincoinx-widget")?.setAttribute('data-monto',this.Monto);
        //Cargo la pasarela de pago
        cargar(true);
      }else{
        this.Error=true;
      }
    })
    .catch((error:any)=>{
      this.Error=true;
      console.log(error);
    })
  }

  Clear() {
    this._helper.dniToReload = this._seguridadDatos.decrypt(localStorage.getItem("dni")!) ? this._seguridadDatos.decrypt(localStorage.getItem("dni")!) : null;
    setTimeout(() => {
      localStorage.clear();
      this.router.navigate(['']);
    }, 500);
  }

}
