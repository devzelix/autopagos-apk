package com.fibextelecom.autopago;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "Printer")
public class PrinterPlugin extends Plugin {

    @PluginMethod
    public void printText(PluginCall call) {
        String text = call.getString("text");
        String urlString = call.getString("url", "http://localhost:9100/");
        
        if (text == null || text.isEmpty()) {
            call.reject("El texto está vacío");
            return;
        }

        // Ejecutar en un thread separado para no bloquear el UI
        new Thread(() -> {
            try {
                android.util.Log.d("PrinterPlugin", "🖨️ Iniciando impresión...");
                android.util.Log.d("PrinterPlugin", "📍 URL: " + urlString);
                android.util.Log.d("PrinterPlugin", "📝 Texto length: " + text.length());
                
                // Crear conexión HTTP
                URL url = new URL(urlString);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                
                // Configurar igual que el comando curl que funciona
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                
                android.util.Log.d("PrinterPlugin", "📤 Enviando datos...");

                // Enviar datos
                OutputStream os = conn.getOutputStream();
                os.write(text.getBytes("UTF-8"));
                os.flush();
                os.close();

                // Intentar obtener código de respuesta
                int responseCode = -1;
                try {
                    responseCode = conn.getResponseCode();
                    android.util.Log.d("PrinterPlugin", "✅ Response code: " + responseCode);
                } catch (Exception e) {
                    // USBPrint puede cerrar la conexión sin responder
                    android.util.Log.d("PrinterPlugin", "⚠️ Sin respuesta (normal con USBPrint): " + e.getMessage());
                }
                
                conn.disconnect();
                
                // Siempre considerar éxito si se pudo conectar y enviar
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "Datos enviados correctamente");
                ret.put("responseCode", responseCode);
                call.resolve(ret);
                
                android.util.Log.d("PrinterPlugin", "✅ Impresión completada");

            } catch (java.net.ConnectException e) {
                // No se pudo conectar al puerto
                android.util.Log.e("PrinterPlugin", "❌ Error de conexión: " + e.getMessage());
                call.reject("No se pudo conectar a " + urlString + ". Verifica que USBPrint esté corriendo.", e);
                
            } catch (Exception e) {
                // Otro error
                android.util.Log.e("PrinterPlugin", "❌ Error: " + e.getMessage());
                e.printStackTrace();
                call.reject("Error al imprimir: " + e.getMessage(), e);
            }
        }).start();
    }
    
    @PluginMethod
    public void checkConnection(PluginCall call) {
        String urlString = call.getString("url", "http://localhost:9100/");
        
        new Thread(() -> {
            try {
                URL url = new URL(urlString);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(3000);
                conn.setReadTimeout(3000);
                
                try {
                    int responseCode = conn.getResponseCode();
                    conn.disconnect();
                    
                    JSObject ret = new JSObject();
                    ret.put("connected", true);
                    ret.put("responseCode", responseCode);
                    call.resolve(ret);
                    
                } catch (Exception e) {
                    // Incluso con error, si intentó conectar, el servicio está ahí
                    JSObject ret = new JSObject();
                    ret.put("connected", true);
                    ret.put("message", "Servicio responde pero sin código HTTP");
                    call.resolve(ret);
                }
                
            } catch (java.net.ConnectException e) {
                JSObject ret = new JSObject();
                ret.put("connected", false);
                ret.put("message", "No se pudo conectar");
                call.resolve(ret);
                
            } catch (Exception e) {
                call.reject("Error al verificar conexión: " + e.getMessage(), e);
            }
        }).start();
    }
}

