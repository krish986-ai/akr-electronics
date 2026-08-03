package com.akrelectronics.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // AndroidX Activity 1.10+ enables edge-to-edge by default regardless of
        // targetSdk, which made the WebView's env(safe-area-inset-top) CSS value
        // unreliable during scroll/repaint (content would slide under the status
        // bar). Opt back out so the OS reserves system bar space natively —
        // the WebView never draws there in the first place.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
