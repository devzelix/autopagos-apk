
function cargar(Inicio) {
    if(Inicio != undefined && Inicio != null && Inicio != ""){
    Number.prototype.formatMoney = function (c, d, t) {
        var n = this,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    function isNumeric(v) {
        return !isNaN(parseFloat(v)) && isFinite(v);
    }
   
    var sitio_base = "https://new.coincoinx.com";
    var sitio_base2 = "https://app.coincoinx.com";

    var sitio = sitio_base+"/widget/";
    var sitio2 = sitio_base2 + "/Gateway/";
    //console.log("Body")
    //console.log(document.body.children[0].querySelector("div").querySelector("app-form")); //.querySelector("form").getElementsByClassName("form-login__group")[0].querySelector("mat-stepper").childNodes[1].children[0]
    var lang = document.getElementById("coincoinx-widget").getAttribute("data-lang");
    var monto = document.getElementById("coincoinx-widget").getAttribute("data-monto");
    var moneda = document.getElementById("coincoinx-widget").getAttribute("data-moneda");
    var idwidget = document.getElementById("coincoinx-widget").getAttribute("data-idwidget");
    var apikey = document.getElementById("coincoinx-widget").getAttribute("data-apikey");
    var direccion = document.getElementById("coincoinx-widget").getAttribute("data-direccion");
    var descripcion = document.getElementById("coincoinx-widget").getAttribute("data-descripcion");
    var idorden = document.getElementById("coincoinx-widget").getAttribute("data-idorden");
    var listitem = document.getElementById("coincoinx-widget").getAttribute("data-listitem");
    var volumeSerial = document.getElementById("coincoinx-widget").getAttribute("data-volumeSerial");

    // console.log(monto);
    // console.log(lang);
    // console.log(moneda);
    // console.log(idwidget);
    // console.log(apikey);
    // console.log(direccion);
    // console.log(descripcion);
    // console.log(idorden);
    // console.log(listitem)
    // console.log(volumeSerial);

    var payType = 1;

    if (isNumeric(monto)) {
        monto = parseFloat(monto).toFixed(2);
    }
    
    idorden = idorden.padStart(4, 0);

    var div_contenedor = document.createElement("div");
    div_contenedor.id = "contenedor_widget_coincoinx";
    div_contenedor.style.display = "none";

    var style=document.createElement("link");
    style.rel="stylesheet";
    style.type="text/css";
    style.href = sitio + "style.css?a_=" + Math.floor((Math.random() * 100000000) + 1);;
    style.onload = function () {
        div_contenedor.style.display = "block";
    }
    document.head.appendChild(style);

   

    var div_encabezado = document.createElement("div");
    div_encabezado.id = "encabezado_widget_coincoinx";


    var div_encabezado_img = document.createElement("img");
    div_encabezado_img.id="encabezadoimg_widget_coincoinx";
    div_encabezado_img.src=sitio+"base.png";
    div_encabezado_img.className="coincoin_header_left";

    var div_encabezado_text = document.createElement("div");
    div_encabezado_text.id="encabezadotext_widget_coincoinx";
    div_encabezado_text.innerHTML = (lang == "EN") ? "Company" + "<div class='coincoinx-slogan'>Slogan</div>":"Empresa" + "<div class='coincoinx-slogan'>Slogan</div>";
    div_encabezado_text.className="coincoin_header_right";

    div_encabezado.appendChild(div_encabezado_img);
    div_encabezado.appendChild(div_encabezado_text);

    ///--------------

    var div_cuerpo = document.createElement("div");
    div_cuerpo.id="cuerpo_widget_coincoinx";

    var div_horizontal0 = document.createElement("div");
    var div_horizontal1 = document.createElement("div");
    var div_horizontal2 = document.createElement("div");
    var div_horizontal2s = document.createElement("div");
    var div_horizontal3 = document.createElement("div");
    var div_horizontal4 = document.createElement("div");
    var div_horizontal5 = document.createElement("div");
    var div_horizontal6 = document.createElement("div");
    var div_horizontal7 = document.createElement("div");
    var div_horizontal8 = document.createElement("div");

    div_horizontal0.className = "form-group-coincoinx";
    div_horizontal1.className = "form-group-coincoinx";
    div_horizontal2.className = "form-group-coincoinx";
    div_horizontal2s.className = "form-group-coincoinx";
    div_horizontal3.className = "form-group-coincoinx";
    div_horizontal4.className = "form-group-coincoinx";
    div_horizontal5.className = "form-group-coincoinx";
    div_horizontal6.className = "form-group-coincoinx";
    div_horizontal7.className = "form-group-coincoinx";
    div_horizontal8.className = "form-group-coincoinx";

    div_horizontal0.innerHTML = "<label class='control-label-coincoinx w100p-coincoinx center-ccx'><h1c>" + monto + " " + moneda + "</h1c></label>";

    div_cuerpo.appendChild(div_horizontal0);

    var label_1 = document.createElement("label");
    label_1.className = "control-label-coincoinx";
    label_1.innerHTML = (lang == "EN")?"Description ":"Descripción ";

    var input_1 = document.createElement("input");
    input_1.className="input-control-coincoinx";
    input_1.id="nota";
    input_1.type = "text";
    input_1.readOnly = 1;
    input_1.setAttribute("placeholder", (lang == "EN") ?"Descriptive Note ":"Nota Descriptiva ");

    div_horizontal1.appendChild(label_1);
    div_horizontal1.appendChild(input_1);

    div_cuerpo.appendChild(div_horizontal1);

    var label_2s = document.createElement("label");
    label_2s.className = "control-label-coincoinx";
    label_2s.innerHTML = (lang == "EN") ? "Currency " :"Monedas ";

    var input_2s = document.createElement("select");
    input_2s.className = "input-control-coincoinx";
    input_2s.id = "coincoinx-currency";
    input_2s.addEventListener("click", function () {

        input_6.style.display = "none";
        label_6.style.display = "none";
        imgcopy2.style.display = "none";

        

        first_currency = document.getElementById("coincoinx-currency").value;

        first_email = document.getElementById("coincoinx-currency").selectedOptions[0].getAttribute("accountemail");

        first_address = document.getElementById("coincoinx-currency").selectedOptions[0].getAttribute("address");

        first_rates = document.getElementById("coincoinx-currency").selectedOptions[0].getAttribute("rates");

        first_decimalplaces = document.getElementById("coincoinx-currency").selectedOptions[0].getAttribute("decimalplaces");

        first_tag_memo = document.getElementById("coincoinx-currency").selectedOptions[0].getAttribute("tag_memo");

        document.getElementById("coincoinx-widget").setAttribute("data-direccion", first_address);

        input_5.value = first_address;

        direccion = first_address;

        qr.src = "http://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=" + first_address;

        qr.setAttribute("src", "http://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=" + first_address);

        if (parseFloat(first_rates) == 0) first_rates = 1;

        Conv = parseFloat(monto) * parseFloat(first_rates);

        label_3.innerHTML = "<h3c><b>" + Conv.formatMoney(first_decimalplaces) + "" + idorden + " " + first_currency + "</b></h3c>";

        label_2.innerHTML = ((lang == "EN") ? "Amount to pay in " : "Monto a pagar en  ") + first_currency;

        if (first_tag_memo != "") {
            label_6.style.display = "block";
            input_6.style.display = "block";
            input_6.value = first_tag_memo
            imgcopy2.style.display = "block";
        }

        datccxapp = idorden + "|" + first_email + "|" + Conv.formatMoney(first_decimalplaces) + "" + idorden + "|" + first_currency;

        qr2.src = "http://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=" + sitio_base + "/Gateway/?s=" + btoa(datccxapp);

        document.getElementById("coincoinx-widget").setAttribute("data-amount-final", Conv.formatMoney(first_decimalplaces) + "" + idorden);

        document.getElementById("coincoinx-widget").setAttribute("data-currency-final", first_currency);

        document.getElementById("coincoinx-widget").setAttribute("data-urlccxapp", sitio_base + "/Gateway/?s=" + btoa(datccxapp));

        document.getElementById("tablinks-coincoinx-default").click();

    }, false);

    div_horizontal2s.appendChild(label_2s);
    div_horizontal2s.appendChild(input_2s);

    div_cuerpo.appendChild(div_horizontal2s);

    var label_2 = document.createElement("label");
    label_2.className = "control-label-coincoinx w100p-coincoinx center-ccx";
    label_2.innerHTML = ((lang == "EN") ? "Amount to pay in " : "Monto a pagar en  ") + moneda;

    div_horizontal2.appendChild(label_2);

    div_cuerpo.appendChild(div_horizontal2);

    var label_3 = document.createElement("label");
    label_3.className = "control-label-coincoinx w100p-coincoinx center-ccx";
    label_3.innerHTML = "<h3c><b>0.00</b></h3c>";

    div_horizontal3.appendChild(label_3);

    div_cuerpo.appendChild(div_horizontal3);

    
    var label_82 = document.createElement("label");
    label_82.className = "control-label-coincoinx center-ccx";
    label_82.innerHTML = (lang == "EN") ? "To guarantee the correct flow of this payment, guarantee that the amount that will reach this wallet is exact. " : "Para garantizar el correcto flujo de este pago, garantice que el monto que llegará a esta billetera es exacto ";
    label_82.style.color = "black";

    div_horizontal4.appendChild(label_82);
    div_cuerpo.appendChild(div_horizontal4);;

    var label_5 = document.createElement("label");
    label_5.className = "control-label-coincoinx";
    label_5.innerHTML = (lang == "EN") ? "Direction " : "Dirección ";

    var input_5 = document.createElement("input");
    input_5.className="input-control-coincoinx";
    input_5.id="dir";
    input_5.type = "text";
    input_5.style.fontSize = "13px";
    input_5.readOnly = 1;
    input_5.setAttribute("placeholder", (lang == "EN") ? "Payment Address " :"Dirección del Pago");

    var imgcopy = document.createElement("img");
    imgcopy.id = "img-copy-ccx";
    imgcopy.src = "data:image/png;base64,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";
    imgcopy.height = 32;
    imgcopy.addEventListener("click",function () {
        input_5.select();
        document.execCommand("copy");
        input_5.animate = "fadeEffect-ccx 1s";
    });

   
    div_horizontal5.appendChild(label_5);
    div_horizontal5.appendChild(input_5);
    div_horizontal5.appendChild(imgcopy);

    div_cuerpo.appendChild(div_horizontal5);

    var label_6 = document.createElement("label");
    label_6.className = "control-label-coincoinx";
    label_6.innerHTML = "Tag/Memo ";
    label_6.style.display = "none";

    var input_6 = document.createElement("input");
    input_6.className = "input-control-coincoinx";
    input_6.id = "tag_memo";
    input_6.type = "text";
    input_6.style.display = "none";
    input_6.setAttribute("placeholder",  "TAG MEMO");
    input_6.readOnly = 1;

    var imgcopy2 = document.createElement("img");
    imgcopy2.id = "img-copy-ccx-memo";
    imgcopy2.src = "data:image/png;base64,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";
    imgcopy2.height = "32px";
    imgcopy2.style.display = "none";
    imgcopy2.addEventListener("click",function () {
        input_6.select();
        document.execCommand("copy");
        input_6.animate = "fadeEffect-ccx 1s";

    });


    div_horizontal6.appendChild(label_6);
    div_horizontal6.appendChild(input_6);
    div_horizontal6.appendChild(imgcopy2);

    div_cuerpo.appendChild(div_horizontal6);

    var qr =  document.createElement("img");
    qr.src = sitio +"qr.png";
    qr.width = 300;
    qr.height =  300;
    qr.id = "qr-coincoinx";

    var qr2 = document.createElement("img");
    qr2.src = sitio + "qr.png";
    qr2.width = 300;
    qr2.height = 300;
    qr2.id = "qr-coincoinx-ccx";

    var qr3 = document.createElement("img");
    qr3.src = sitio + "qr.png";
    qr3.width = 300;
    qr3.height = 300;
    qr3.id = "qr-coincoinx-pay";

    var div_tabcGeneral = document.createElement("div");
    div_tabcGeneral.className = "form-group-coincoinx flex100-ccx";
    div_tabcGeneral.id = "tabcontent-coincoinx-general";
    var div_tabc = document.createElement("div");
    div_tabc.className = "tab-coincoinx";
    var div_tabc1 = document.createElement("div");
    div_tabc1.className = "tabcontent-coincoinx center-ccx";
    div_tabc1.id = "tabcontent-coincoinx1";
    var div_tabc2 = document.createElement("div");
    div_tabc2.className = "tabcontent-coincoinx center-ccx";
    div_tabc2.id = "tabcontent-coincoinx2";
    var div_tabc3 = document.createElement("div");
    div_tabc3.className = "tabcontent-coincoinx center-ccx";
    div_tabc3.id = "tabcontent-coincoinx3";
    var div_tabb1 = document.createElement("button");
    div_tabb1.className = "tablinks-coincoinx";
    div_tabb1.id = "tablinks-coincoinx-default";
    div_tabb1.addEventListener("click", function() {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent-coincoinx");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks-coincoinx");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById("tabcontent-coincoinx1").style.display = "block";
        document.getElementById("tablinks-coincoinx-default").className += " active";

        dirsd = document.getElementById("coincoinx-widget").getAttribute("data-direccion");
        input_5.value = dirsd;
        payType = 1;
    }, false);
    div_tabb1.innerHTML = (lang == "EN") ? "Wallet " : "Billetera ";
    var div_tabb2 = document.createElement("button");
    div_tabb2.className = "tablinks-coincoinx";
    div_tabb2.id = "tablinks-coincoinx-default2";
    div_tabb2.addEventListener("click", function () {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent-coincoinx");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks-coincoinx");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById("tabcontent-coincoinx2").style.display = "block";
        document.getElementById("tablinks-coincoinx-default2").className += " active";

        dirsd = document.getElementById("coincoinx-widget").getAttribute("data-urlccxapp");
        input_5.value = dirsd;
        payType = 2;
    }, false);
    div_tabb2.innerHTML = "App Coincoinx ";
    var div_tabb3 = document.createElement("button");
    div_tabb3.className = "tablinks-coincoinx";
    div_tabb3.id = "tablinks-coincoinx-default3";
    div_tabb3.style.display = "none";
    div_tabb3.addEventListener("click", function () {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent-coincoinx");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks-coincoinx");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById("tabcontent-coincoinx3").style.display = "block";
        document.getElementById("tablinks-coincoinx-default3").className += " active";

        dirsd = document.getElementById("coincoinx-widget").getAttribute("data-urlccxpay");
        input_5.value = dirsd;
        payType = 3;
    }, false);
    div_tabb3.innerHTML = "Binance Pay ";

    div_tabc1.appendChild(qr);
    div_tabc2.appendChild(qr2);
    div_tabc3.appendChild(qr3);


    div_tabc.appendChild(div_tabb1);
    div_tabc.appendChild(div_tabb2);
    div_tabc.appendChild(div_tabb3);

    div_tabcGeneral.appendChild(div_tabc);
    div_tabcGeneral.appendChild(div_tabc1);
    div_tabcGeneral.appendChild(div_tabc2);
    div_tabcGeneral.appendChild(div_tabc3);

    div_cuerpo.appendChild(div_tabcGeneral);

    var label_8 = document.createElement("label");
    label_8.className = "control-label-coincoinx center-ccx";
    label_8.innerHTML = (lang == "EN") ? "When sending cryptocurrencies, press the following button to verify in the blockchain if the funds were confirmed " : "Al realizar el envio de criptomonedas, presione el botón siguiente para verificar en la blockchain si los fondos fueron confirmados ";
    label_8.style.color = "black";


    div_horizontal8.appendChild(label_8);
    div_cuerpo.appendChild(div_horizontal8);

    var div_respuesta =  document.createElement("div");
    div_respuesta.id="respuesta_coincoinx"
    div_respuesta.style.display="none";

    div_cuerpo.appendChild(div_respuesta);

    var boton_monitoreo = document.createElement("button");
    boton_monitoreo.id="monitoreo_coincoinx";
    boton_monitoreo.innerHTML = (lang == "EN") ? "Verify Payment" : "Verificar Pago";
    boton_monitoreo.addEventListener("click",function () {
        div_respuesta.style.display="";

        var name_time = (lang == "EN") ? "Monitoring time" : "Tiempo de Monitoreo";

        div_respuesta.innerHTML= '<div id="timer_coincoinx">'+
            '<div class="container">'+
            '<div class="divider">' + name_time +'</div>'+
            '<div id="minute_coincoinx">00</div>'+
            '<div class="divider">:</div>'+
            '<div id="second_coincoinx">00</div>'+
            '</div>'+
            '</div>';

        var IPOdate = new Date();
        var str = IPOdate.toString() + Math.floor(Math.random() * 999999) + 1000;
        const encodedStr = btoa(str);

        tiempo_corriendo = setInterval(function(){
            // Segundos
            tiempo.segundo--;
            if(tiempo.segundo <= 0)
            {
                tiempo.segundo = 60;
                tiempo.minuto--;
            }

            // Minutos
            if(tiempo.minuto <= 0)
            {
                tiempo.segundo = 0;

                clearInterval(tiempo_corriendo);

            }

            document.getElementById("minute_coincoinx").innerHTML = tiempo.minuto < 10 ? '0' + tiempo.minuto : tiempo.minuto;
            document.getElementById("second_coincoinx").innerHTML = tiempo.segundo < 10 ? '0' + tiempo.segundo : tiempo.segundo;


            if(vericaAhora==0){
                vericaAhora = 1;

                var data = "{'IdWidget':'" + idwidget + "',  'IdOrden': '" + idorden + "', 'AmountOrder':'" + document.getElementById("coincoinx-widget").getAttribute("data-amount-final") + "', 'CurrencyOrder':'" + document.getElementById("coincoinx-widget").getAttribute("data-currency-final") + "'}";
                //console.log(data);
                xhr4 = new XMLHttpRequest();
               
                xhr4.open('POST', sitio2 +"Check", true);
                xhr4.onload = function(res) {

                   
                    var datos = JSON.parse(this.response);

                    //console.log(datos.amount);

                    var data4 = datos.amount;

                    if (!isNaN(parseFloat(data4))) {

                        if(parseFloat(data4)!=0){

                            Amount= monto;
                            Currency= moneda;
                            Address=document.getElementById("coincoinx-widget").getAttribute("data-direccion");
                            Description=descripcion;
                            AmountOrder=document.getElementById("coincoinx-widget").getAttribute("data-amount-final");
                            CurrencyOrder=document.getElementById("coincoinx-widget").getAttribute("data-currency-final");
                            AccountEmail=document.getElementById("coincoinx-widget").getAttribute("data-email");
                            UrlccxApp=document.getElementById("coincoinx-widget").getAttribute("data-urlccxapp");
                            BinanceCcxApp=document.getElementById("coincoinx-widget").getAttribute("data-Binanceurlccxapp");
                            BinanceCcxAppId=document.getElementById("coincoinx-widget").getAttribute("data-BinanceurlccxappId");
                            ListItem=listitem;
                            UniqueHash=encodedStr + "" + document.getElementById("coincoinx-widget").getAttribute("data-currency-final");
                            PayType=payType;
                            

                            var data2 = "{'IdWidget':'" + idwidget + "', 'IdOrden': '" + idorden + "', " +
                                "'CurrencyOrder':'" + CurrencyOrder + "', 'Amount':'" + Amount + "', 'Currency':'" + Currency + "', 'Address':'" + Address + "', 'Description':'" + Description + "'" +
                                ", 'AmountOrder':'" + AmountOrder + "',  'AccountEmail':'" + AccountEmail + "', 'UrlccxApp':'" + UrlccxApp + "'" +
                                ", 'BinanceCcxApp':'" + BinanceCcxApp + "', 'BinanceCcxAppId':'" + BinanceCcxAppId + "', 'ListItem':'" + ListItem + "', 'UniqueHash':'" + UniqueHash + "', 'PayType':'" + PayType + "', 'volumeSerial':'" + volumeSerial + "'} "; 

                            console.log(data2);

                            xhr5 = new XMLHttpRequest();
                            xhr5.open('POST', sitio2+"CreateOrden", true);
                            xhr5.onload = function(data5) {
                                if (this.status == 200) {

                                    var data5 = JSON.parse(this.response);

                                    if (data5.status == 0) {
                                        if (lang == "EN") {
                                            div_tabcGeneral.innerHTML = '<div id="modal-cobra-pay"  class=""  aria-hidden="true">' +
                                                ' <div style="width: 100% !important;">' +
                                                ' <div>' +
                                                '   <div class="coincoinx-header-noti">' +
                                                '   <i class="glyphicon glyphicon-check"></i>' +
                                                '   FIRST PAYMENT CONFIRMATION' +
                                                '</div>' +
                                                '<div class="modal-body"><div class="check_mark">' +
                                                '   <div id="success_coincoinx" class="sa-icon sa-success hide animate">' +
                                                '   <span class="sa-line sa-tip animateSuccessTip"></span>' +
                                                '   <span class="sa-line sa-long animateSuccessLong"></span>' +
                                                '   <div class="sa-placeholder"></div>' +
                                                '   <div class="sa-fix"></div>' +
                                                '   </div>' +
                                                '   </div></div>' +
                                                '    <div id = "title-pay-ccx" class="modal-title">' +
                                                '   The first payment confirmation was obtained' +
                                                '</div>' +
                                                '<div class="coincoinx-footer-noti">' +
                                                '    </div></div></div></div>';
                                        } else {
                                            div_tabcGeneral.innerHTML = '<div id="modal-cobra-pay"  class=""  aria-hidden="true">' +
                                                ' <div style="width: 100% !important;">' +
                                                ' <div>' +
                                                '   <div class="coincoinx-header-noti">' +
                                                '   <i class="glyphicon glyphicon-check"></i>' +
                                                '   PRIMERA CONFIRMACIÓN DEL PAGO' +
                                                '</div>' +
                                                '<div class="modal-body"><div class="check_mark">' +
                                                '   <div id="success_coincoinx" class="sa-icon sa-success hide animate">' +
                                                '   <span class="sa-line sa-tip animateSuccessTip"></span>' +
                                                '   <span class="sa-line sa-long animateSuccessLong"></span>' +
                                                '   <div class="sa-placeholder"></div>' +
                                                '   <div class="sa-fix"></div>' +
                                                '   </div>' +
                                                '   </div></div>' +
                                                '    <div id = "title-pay-ccx" class="modal-title">' +
                                                '   Se obtuvo la primera confirmación del pago' +
                                                '</div>' +
                                                '<div class="coincoinx-footer-noti">' +
                                                '    </div></div></div></div>';
                                        }
                                        

                                        clearInterval(tiempo_corriendo);

                                        setTimeout(function () {
                                            document.getElementById("success_coincoinx").setAttribute("class","sa-icon sa-success animate");

                                        }, 20);

                                        document.getElementById("title-pay-ccx").innerHTML = data5.message;

                                        pie_widget_coincoinx.style.borderTop = "3px solid #a0d468 !important;";
                                        encabezado_widget_coincoinx.style.borderBottom = "3px solid #a0d468 !important;";

                                      

                                    } else {
                                        document.getElementById("title-pay-ccx").innerHTML = data5.message;
                                    }


                                }
                            }
                            xhr5.setRequestHeader("Content-Type", "application/json");
                            xhr5.setRequestHeader("CoincoinXToken", apikey);
                            xhr5.send(data2);

                        }
                    }




                }
                xhr4.setRequestHeader("Content-Type", "application/json");
                xhr4.setRequestHeader("CoincoinXToken", apikey);
                xhr4.send(data);

              


                


            }

            vericaAhora++;

            if(vericaAhora>7) vericaAhora=0;


        }, 1000);

    },false);

    div_cuerpo.appendChild(boton_monitoreo);

    ////---------

    var div_cls = document.createElement("div");
    div_cls.className = "clear";

    var div_pie = document.createElement("div");
    div_pie.id="pie_widget_coincoinx";
    div_pie.innerHTML = "Integrado con CoincoinX";

    div_contenedor.appendChild(div_encabezado);
    div_contenedor.appendChild(div_cuerpo);
    div_contenedor.appendChild(div_cls);
    div_contenedor.appendChild(div_pie);

   var  div_loading = document.createElement("div");
    div_loading.id="centrado_coincoinx";
    div_loading.innerHTML = "<img src = '"+sitio+"loading.gif'/>";

    div_contenedor.appendChild(div_loading);

    document.getElementById("coincoinx-widget").appendChild(div_contenedor);


    var array_wallet = [];

    if (monto > 0 && idorden > 0 && idwidget != "") {
        var origen = "";
        if (volumeSerial != null && volumeSerial != "" && volumeSerial != undefined) {
            origen = "&origen="+volumeSerial;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', sitio2 + "GetAuth?ID_WIDGET=" + idwidget +"&currency=" +moneda + origen, true);
    xhr.onload = function (data) {
        
        if (this.status == 200) {
            var data = JSON.parse(this.response);

            var first_address = "";
            var first_rates = "";
            var first_currency = "";
            var first_tag_memo = "";
            var first_network = "";
            var first_email = "";
            var first_decimalplaces = 0;
            
            array_wallet = data.wallets;

            if (Array.isArray(array_wallet)) {

                array_wallet.forEach(function (v, k) {

                    if (v.Address.indexOf("/")) {
                        var partes_address = v.Address.split("/");
                        var partes_tag_memo = v.AddressTag_Memo.split("/");
                        var partes_network = v.Network.split("/");

                        ciclo = 0;
                        partes_address.forEach(function (v2, k2) {

                            var option = document.createElement("option");
                            option.innerHTML = v.FullName + " (" + v.Currency + ") Red:" + partes_network[ciclo];
                            option.value = v.Currency;
                            option.setAttribute("address", partes_address[ciclo]);
                            option.setAttribute("rates", v.Rates);
                            option.setAttribute("tag_memo", partes_tag_memo[ciclo]);
                            option.setAttribute("network", partes_network[ciclo]);
                            option.setAttribute("decimalplaces", v.DecimalPlaces);
                            option.setAttribute("accountEmail", data.AccountEmail);

                            

                            input_2s.append(option);

                            if (first_address == "") {
                                first_address = partes_address[ciclo];
                                first_rates = v.Rates;
                                first_currency = v.Currency;
                                first_tag_memo = partes_tag_memo[ciclo];
                                first_network = partes_network[ciclo];
                                first_decimalplaces = parseInt(v.DecimalPlaces);
                                first_email = data.AccountEmail;
                            }

                            ciclo++;
                        });

                    }
                    else {
                        var option = document.createElement("option");
                        option.innerHTML = v.FullName + " (" + v.Currency + ")";
                        option.value = v.Currency;
                        option.setAttribute("address", v.Address);
                        option.setAttribute("rates", v.Rates);
                        option.setAttribute("tag_memo", v.AddressTag_Memo);
                        option.setAttribute("network", v.Network);
                        option.setAttribute("decimalplaces", v.DecimalPlaces);
                        option.setAttribute("accountEmail", data.AccountEmail);

                        input_2s.append(option);

                        if (first_address == "") {
                            first_address = v.Address;
                            first_rates = v.Rates;
                            first_currency = v.Currency;
                            first_tag_memo = v.AddressTag_Memo;
                            first_network = v.Network;
                            first_decimalplaces = parseInt(v.DecimalPlaces);
                            first_email = data.AccountEmail;
                        }
                    }



                });

            } else {
                div_encabezado_text.innerHTML = data.resp;

                div_loading.style.display = "none";
                return false;
            }
            document.getElementById("coincoinx-widget").setAttribute("data-direccion", first_address);

            input_5.value = first_address;

            direccion = first_address;

            qr.src = "http://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=" + first_address;


            if (parseFloat(first_rates) == 0) first_rates = 1;

            Conv = parseFloat(monto) * parseFloat(first_rates);

            label_3.innerHTML = "<h3c><b>" + Conv.formatMoney(first_decimalplaces) + "" + idorden + " " + first_currency + "</b></h3c>";


            label_2.innerHTML = ((lang == "EN") ? "Amount to pay in " :"Monto a pagar en  ") + first_currency;

            if (data.wallets != "") {
                
                var parts = data.gatewayCustom.split('|');
                
                if (parts[0]!="")
                    div_encabezado_img.src = sitio_base + parts[0];

                if (parts.length >1)
                    div_encabezado_text.innerHTML = parts[1];

                if (parts.length > 2)
                    div_encabezado_text.innerHTML = parts[1] + "<div class='coincoinx-slogan'>" + parts[2] +"</div>";
            }

            input_1.value = descripcion;

            datccxapp = idorden + "|" + first_email + "|" + Conv.formatMoney(first_decimalplaces) + "" + idorden + "|" + first_currency;

            qr2.src = "http://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=" + sitio_base + "/Gateway/?s=" + btoa(datccxapp);

            document.getElementById("coincoinx-widget").setAttribute("data-email", first_email);

            document.getElementById("coincoinx-widget").setAttribute("data-amount-final", Conv.formatMoney(first_decimalplaces) + "" + idorden);

            document.getElementById("coincoinx-widget").setAttribute("data-urlccxapp", sitio_base + "/Gateway/?s=" + btoa(datccxapp));

            document.getElementById("coincoinx-widget").setAttribute("data-currency-final", first_currency);
            
        }else{
            console.info("Error"+ this.status)

        }

        div_loading.style.display = "none";

        };
    xhr.setRequestHeader("CoincoinXToken", apikey);
    xhr.send();

    }

    if (monto <= 0 || monto == "") {
        div_encabezado_text = (lang == "EN") ? "Incorrect amount, must be greater than 0 and expressed in USDT with 2 decimal digits" :"Monto Incorrecto, debe ser mayor a 0 y expresado en USDT con 2 Digitos decimales";
    } else {
        if (idorden <= 0 || idorden == "") {
            div_encabezado_text = (lang == "EN")? "Incorrect Order Number, must be greater than 0" :"Número de Orden Incorrecto, debe ser mayor a 0";
        } else {
            if (idwidget == "") {
                encabezadotext_widget_coincoinx = (lang == "EN")? "Widget Id is required" :"El Id del Widget es obligatorio";
            } else {
                if (apikey == "") {
                    encabezadotext_widget_coincoinx = (lang == "EN")? "The apikey is mandatory" :"El Apikey es obligatorio";
                } 
            }
        }
    }
    
   


    

    var vericaAhora = 0;

    var tiempo = {
        hora: 0,
        minuto: 20,
        segundo: 0
    };

    var tiempo_corriendo = null;


    
    document.getElementById("tablinks-coincoinx-default").click();
    }
    
}

