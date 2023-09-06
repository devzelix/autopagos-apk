'use strict';
 
const JavaScriptObfuscator = require('webpack-obfuscator');

const path = require('path');

const outputPath = path.resolve(__dirname, 'dist/form-pay-fibex/form-pay-fibex.js');

module.exports = {
    mode:'production',
    //   entry: {
    //       'abc': 'C:/Proyectos/pro/PagosMercantil/dist/form-pay-fibex/main.e5a662245f8e641e.js',
    //   },
    output: {
        path: 'C:/Proyectos/pro/PagosMercantil/dist/form-pay-fibex/form-pay-fibex.js',
        filename: '[name].[contenthash].js', // output: abc.js, cde.js
        chunkFilename: '[name].[contenthash].js',
    },
    plugins: [
        new JavaScriptObfuscator({
            compact: true,
            controlFlowFlattening: true,
            deadCodeInjection: true,
            debugProtection: true,
            debugProtectionInterval: 0,
            disableConsoleOutput: true,
            rotateStringArray: true,
            selfDefending: true,
            stringArray: true,
            stringArrayEncoding: ['none'],
            stringArrayThreshold: 1,
            transformObjectKeys: true,
            unicodeEscapeSequence: true,
        }, ['main.js'])
    ]
};



