package com.akrelectronics.app;

import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // androidx.activity 1.10+ defaults every Activity to edge-to-edge on
        // all Android versions, and Android 15/16 make it unconditional at the
        // OS level on top of that — the app can no longer opt out. Make it
        // explicit rather than relying on that default, then manually consume
        // the real system bar insets as padding on the root content view
        // (above Capacitor's CoordinatorLayout/WebView, not the WebView
        // itself, in case that layout alters what reaches it). This holds
        // during scroll, unlike CSS env(safe-area-inset-*) inside the WebView.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        View content = findViewById(android.R.id.content);
        ViewCompat.setOnApplyWindowInsetsListener(content, (view, windowInsets) -> {
            Insets systemBars = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            view.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
    }
}
