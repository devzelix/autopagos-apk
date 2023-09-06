// import { Injectable } from '@angular/core';
// import webpack from 'webpack';
// import JavaScriptObfuscator from 'webpack-obfuscator';

// @Injectable({
//   providedIn: 'root'
// })

// export class OfuscaciónService {

//   constructor() { }

//   obfuscateProject() {
//     const webpackConfig = {
//       entry: './src/main.ts', // Adjust the entry point to match your project configuration
//       output: {
//         path: './dist/form-pay-fibex', // Adjust the output path to match your project configuration
//         filename: 'bundle.js' // Adjust the output filename to match your project configuration
//       },
//       resolve:{
//         fallback: { path:false }
//       },
//       plugins: [
//         new JavaScriptObfuscator({
//           compact: true,
//           controlFlowFlattening: true,
//           deadCodeInjection: true,
//           debugProtection: true,
//           debugProtectionInterval: 0,
//           disableConsoleOutput: true,
//           rotateStringArray: true,
//           selfDefending: true,
//           stringArray: true,
//           stringArrayEncoding: ['none'],
//           stringArrayThreshold: 1,
//           transformObjectKeys: true,
//           unicodeEscapeSequence: true,
//         })
//       ]
//     };

//     webpack(webpackConfig, (err, stats) => {
//       if (err || (stats && stats.hasErrors())) {
//         console.error(err || (stats && stats.compilation.errors));
//       } else {
//         console.log('Obfuscation completed successfully!');
//       }
//     });
//   }
// }