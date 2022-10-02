import { Injectable, NgZone, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CoinxService implements  OnInit {

    constructor(){}
    ngOnInit(): void {
    }

    TokenWidget(){
        return new Promise((resolve,reject)=>{
            try {
                const url = `https://app.coincoinx.com/Gateway/GetToken?ID_WIDGET=${env.WidgetID}`;
    
                fetch(url, {
                    method: "GET",
                   headers:{
                       "API_KEY":env.ApiTokenWidget
                   }
                  })
                    .then((response) => {
                      return response.text();
                    })
                    .then((data) => {
                      resolve(JSON.parse(data));
                    })
                    .catch((error:any)=>{reject(error)})
            } catch (error) {
                console.log(error);
                console.log(new Date());
            }
            
        })
    }

}