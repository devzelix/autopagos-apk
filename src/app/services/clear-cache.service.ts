import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClearCacheService {

  constructor() { }

  clear() {
    if( window.caches ) { // ! verificamos si existe cache
      caches.keys().then( keys => { // ! Accedemos a los elementos de cache y si existe alguno lo recorremos para luego borrarlos
        if(keys.length > 0) keys.forEach( key => caches.delete(key));
      });
    }
  }

}
