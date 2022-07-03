import * as crypto from 'crypto-js';
import { environment } from "src/environments/environment";

export class SeguridadDatos {
    private algorithmkeyBank = 'sha256';
    private algorithmData = 'aes-128-ecb';

    //Encripta la los datos
    encrypt(key:string,str:any){
        return crypto.AES.encrypt(str, key.trim()).toString();
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
                        const Encrypt = this.encrypt(Key,valueKey); //Encripto
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