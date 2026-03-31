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
        
        // Enable JavaScript and required settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAppCacheEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setUniversalAccessFiles(true);
        
        // Set WebViewClient to handle page loading
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                // Make React app visible after loading
                view.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        String jsCode = "javascript:(" +
                            "var root = document.getElementById('root');" +
                            "if (root) {" +
                            "   root.style.display = 'block';" +
                            "   root.style.visibility = 'visible';" +
                            "   root.style.opacity = '1';" +
                            "}" +
                            ");";
                        view.evaluateJavascript(jsCode, null);
                    }
                }, 2000); // Wait 2 seconds for React to load
            }
            
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // Load local error page if main file fails
                if (failingUrl.contains("file:///android_asset/build/index.html")) {
                    loadErrorPage();
                }
            }
        });
        
        webView.setWebChromeClient(new WebChromeClient());
        
        // Load React app
        webView.loadUrl("file:///android_asset/build/index.html");
    }
    
    private void loadErrorPage() {
        String errorHtml = "<html><head><style>" +
            "body { font-family: Arial; text-align: center; padding: 50px; background: #ffffff; }" +
            "h2 { color: #2196F3; }" +
            "p { color: #666; font-size: 16px; }" +
            "</style></head><body>" +
            "<h2>Workforce Management</h2>" +
            "<p>App Loading Error</p>" +
            "<p>There was an error loading the application.</p>" +
            "<p>Please check your internet connection and try again.</p>" +
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
