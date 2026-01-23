package com.fibextelecom.autopago;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Registrar plugins personalizados manualmente
        registerPlugin(NetworkInfoPlugin.class);
        registerPlugin(PrinterPlugin.class);
    }
}
