import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  console.log = function() {}
  console.error =  function() {}
  console.warn = function() {} 
}

// CANCELA TODOS LOS MENSAJES DE LA CONSOLA
// console.log = function() {}
// console.error =  function() {}
// console.warn = function() {}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
