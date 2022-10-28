import * as crypto from 'crypto-js';
import { environment } from "src/environments/environment";

export class SeguridadDatos {
    private algorithmkeyBank = 'sha256';
    private algorithmData = 'aes-128-ecb';
   // encrypted: any = "";
    decrypted: string = "";

    //Encripta la los datos
    encrypt(key:string,str:any){
        return crypto.AES.encrypt(str, key.trim()).toString();
    }

    encrypt2(key:string,str:any){
      let _key = crypto.enc.Utf8.parse(key);
      //let _iv = CryptoJS.enc.Utf8.parse(this.tokenFromUI);
      let encrypted = crypto.AES.encrypt(JSON.stringify(str), _key, {
        keySize: 16,
        //    iv: _iv,
        mode: crypto.mode.ECB,
        padding: crypto.pad.Pkcs7,
      });
      return encrypted.toString();
    }
    //Desencriptar data
    Desencrypt(key:string,str:any){
        return crypto.AES.decrypt(str, key.trim()).toString();
    }

    Desencrypt2(key:string,str:any){
      let _key = crypto.enc.Utf8.parse(key);
      //   let _iv = CryptoJS.enc.Utf8.parse(this.tokenFromUI);

      this.decrypted = crypto.AES.decrypt(str, _key, {
        keySize: 16,
        //      iv: _iv,
        mode: crypto.mode.ECB,
        padding: crypto.pad.Pkcs7,
      }).toString(crypto.enc.Utf8);

      return this.decrypted;
    }

    //Generos el hash de la clave propocinada por el banco
/*HashSHA256(input_str:string){
        try {
            let hashPwd = crypto.createHash(this.algorithmkeyBank)
            .update(input_str)
            .digest();
            let keyBankBinary =hashPwd.slice(0,16)
            return keyBankBinary
        } catch (error) {
            console.log(error);
        }
    }*/

    EncrypDataHash(Key:string,Datos:any){
        return new Promise((resolve,reject)=>{
            try {
                Object.entries(Datos).forEach(([keyOriginal, valueKey],index:number) => {
                    var Tamano= Object.keys(Datos);
                    if(typeof valueKey !="number"){
                        const Encrypt = this.encrypt2(Key,valueKey); //Encripto
                        Datos[keyOriginal] = Encrypt;
                    }
                    if(index == Tamano.length-1){
                        resolve(Datos)
                    }
                })
            } catch (error) {
                reject(error);
            }
        })
    }

    DesEncrypDataHash(Key:string,Datos:any){
        return new Promise((resolve,reject)=>{
            try {
                Object.entries(Datos).forEach(([keyOriginal, valueKey],index:number) => {
                    var Tamano= Object.keys(Datos);
                    if(typeof valueKey !="number"){
                        const Encrypt = this.Desencrypt2(Key,valueKey); //Encripto
                        Datos[keyOriginal] = Encrypt;
                    }
                    if(index == Tamano.length-1){
                        resolve(Datos)
                    }
                })
            } catch (error) {
                reject(error);
            }
        })


    }
}
