package com.fibextelecom.autopago;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.LinkProperties;
import android.net.LinkAddress;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NetworkInfo")
public class NetworkInfoPlugin extends Plugin {

    @PluginMethod
    public void getLocalIpAddress(PluginCall call) {
        try {
            String ip = getLocalIpAddress();
            JSObject ret = new JSObject();
            ret.put("ip", ip);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error al obtener IP local", e);
        }
    }

    private String getLocalIpAddress() {
        try {
            Context context = getContext();
            
            // Método 1: Intentar obtener desde WiFi
            WifiManager wifiManager = (WifiManager) context.getApplicationContext()
                .getSystemService(Context.WIFI_SERVICE);
            
            if (wifiManager != null) {
                WifiInfo wifiInfo = wifiManager.getConnectionInfo();
                int ipAddress = wifiInfo.getIpAddress();
                
                if (ipAddress != 0) {
                    return String.format("%d.%d.%d.%d",
                        (ipAddress & 0xff),
                        (ipAddress >> 8 & 0xff),
                        (ipAddress >> 16 & 0xff),
                        (ipAddress >> 24 & 0xff));
                }
            }

            // Método 2: Obtener desde interfaces de red
            List<NetworkInterface> interfaces = Collections.list(
                NetworkInterface.getNetworkInterfaces());
            
            for (NetworkInterface intf : interfaces) {
                List<InetAddress> addrs = Collections.list(intf.getInetAddresses());
                
                for (InetAddress addr : addrs) {
                    if (!addr.isLoopbackAddress() && 
                        addr instanceof java.net.Inet4Address) {
                        String ip = addr.getHostAddress();
                        if (isLocalIp(ip)) {
                            return ip;
                        }
                    }
                }
            }

            // Método 3: Usar ConnectivityManager (Android 6.0+)
            ConnectivityManager cm = (ConnectivityManager) context
                .getSystemService(Context.CONNECTIVITY_SERVICE);
            
            if (cm != null) {
                Network[] networks = cm.getAllNetworks();
                for (Network network : networks) {
                    NetworkCapabilities capabilities = cm.getNetworkCapabilities(network);
                    if (capabilities != null && 
                        (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
                         capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET))) {
                        
                        LinkProperties linkProperties = cm.getLinkProperties(network);
                        if (linkProperties != null) {
                            List<LinkAddress> linkAddresses = linkProperties.getLinkAddresses();
                            for (LinkAddress linkAddress : linkAddresses) {
                                InetAddress address = linkAddress.getAddress();
                                if (address instanceof java.net.Inet4Address && 
                                    !address.isLoopbackAddress()) {
                                    String ip = address.getHostAddress();
                                    if (isLocalIp(ip)) {
                                        return ip;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return "0.0.0.0";
        } catch (Exception e) {
            e.printStackTrace();
            return "0.0.0.0";
        }
    }
    
    private boolean isLocalIp(String ip) {
        if (ip == null || ip.isEmpty()) {
            return false;
        }
        
        try {
            if (ip.startsWith("192.168.")) {
                return true;
            }
            if (ip.startsWith("10.")) {
                return true;
            }
            if (ip.startsWith("172.")) {
                String[] parts = ip.split("\\.");
                if (parts.length >= 2) {
                    int secondOctet = Integer.parseInt(parts[1]);
                    if (secondOctet >= 16 && secondOctet <= 31) {
                        return true;
                    }
                }
            }
            if (ip.equals("127.0.0.1")) {
                return true;
            }
        } catch (Exception e) {
            return false;
        }
        
        return false;
    }
}





