package com.akrelectronics.app;

import android.os.Bundle;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Android 15/16 enforce edge-to-edge unconditionally — the OS ignores
        // any app-level opt-out (setDecorFitsSystemWindows has no effect there),
        // so the WebView always draws full-bleed under the status/nav bars.
        // Instead of fighting that, pad the WebView view itself by the real
        // system bar insets so its content area physically excludes those
        // zones. This holds during scroll, unlike the CSS
        // env(safe-area-inset-*) approach, which only reflects the insets at
        // initial layout in this WebView.
        ViewCompat.setOnApplyWindowInsetsListener(getBridge().getWebView(), (view, windowInsets) -> {
            Insets systemBars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            view.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return windowInsets;
        });
    }
}
