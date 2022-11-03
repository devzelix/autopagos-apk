import * as crypto from 'crypto-js';
export class SeguridadDatos {

    //Encripta la los datos
    encrypt(key:string,str:any){
        return crypto.AES.encrypt(str, key.trim()).toString();
    }

    encrypt2(key:string,str:any){
      let _key = crypto.enc.Utf8.parse(key);
      let encrypted = crypto.AES.encrypt(JSON.stringify(str), _key, {
        keySize: 16,
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
      let decrypted = crypto.AES.decrypt(str, _key, {
        keySize: 16,
        mode: crypto.mode.ECB,
        padding: crypto.pad.Pkcs7,
      }).toString(crypto.enc.Utf8);

      return decrypted;
    }

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
