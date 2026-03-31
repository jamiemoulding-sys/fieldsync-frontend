package com.workforce.management;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;
import android.view.View;
import android.widget.ProgressBar;
import android.util.Log;
import com.workforce.management.R;

public class MainActivity extends Activity {
    
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        
        // Enable JavaScript and debugging
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAppCacheEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setUniversalAccessFiles(true);
        
        // Enable debugging for WebView
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        
        Log.d("MainActivity", "WebView initialized with debug settings");
        
        // Set WebViewClient to handle page loading
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                Log.d("WebView", "Page started loading: " + url);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                Log.d("WebView", "Page finished loading: " + url);
                
                // Inject JavaScript to test React loading
                String jsCode = "javascript:(" +
                    "if (document.getElementById('root') && document.getElementById('root').innerHTML.length > 0) {" +
                    "   console.log('React app loaded successfully');" +
                    "} else {" +
                    "   console.log('React app not loaded - root element empty');" +
                    "}" +
                    ");";
                
                view.evaluateJavascript(jsCode, null);
            }
            
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e("WebView", "Page loading error: " + errorCode + " - " + description + " URL: " + failingUrl);
                
                // Load local error page if main file fails
                if (failingUrl.contains("file:///android_asset/build/index.html")) {
                    loadErrorPage();
                }
            }
        });
        
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("WebView Console", consoleMessage.message() + " -- Line: " + consoleMessage.lineNumber());
                return true;
            }
        });
        
        // Load local React build with proper base URL
        Log.d("MainActivity", "Loading React app from: file:///android_asset/build/index.html");
        webView.loadUrl("file:///android_asset/build/index.html");
    }
    
    private void loadErrorPage() {
        String errorHtml = "<html><head><style>" +
            "body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }" +
            "h2 { color: #d32f2f; }" +
            "p { color: #666; font-size: 16px; }" +
            "</style></head><body>" +
            "<h2>Workforce Management</h2>" +
            "<p>App Loading Error</p>" +
            "<p>There was an error loading the app.</p>" +
            "<p>Please check the following:</p>" +
            "<ul>" +
            "<li>Internet connection</li>" +
            "<li>Available storage space</li>" +
            "<li>App permissions</li>" +
            "</ul>" +
            "<p>Technical details have been logged for debugging.</p>" +
            "</body></html>";
        webView.loadDataWithBaseURL(errorHtml, "text/html", "UTF-8", null);
        Log.e("MainActivity", "Loaded error page due to WebView loading failure");
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
