package com.workforce.management;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;
import android.view.View;
import android.widget.ProgressBar;
import com.workforce.management.R;

public class MainActivity extends Activity {
    
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        
        // Enable JavaScript
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAppCacheEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        // Enable local file access and set base URL
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setUniversalAccessFiles(true);
        
        // Set WebViewClient to handle page loading
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // Load local error page if main file fails
                if (failingUrl.contains("file:///android_asset/build/index.html")) {
                    loadErrorPage();
                }
            }
        });
        
        webView.setWebChromeClient(new WebChromeClient());
        
        // Load local React build with proper base URL
        webView.loadUrl("file:///android_asset/build/index.html");
    }
    
    private void loadErrorPage() {
        String errorHtml = "<html><body style='font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5;'>" +
            "<h2 style='color: #d32f2f;'>Workforce Management</h2>" +
            "<p style='color: #666; font-size: 16px;'>Loading app...</p>" +
            "<p style='color: #999; font-size: 14px;'>Please check your connection and restart the app.</p>" +
            "</body></html>";
        webView.loadDataWithBaseURL(errorHtml, "text/html", "UTF-8", null);
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
