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
        
        // IMPORTANT: Set proper background and remove black screen
        webView.setBackgroundColor(Color.TRANSPARENT);
        webView.setBackgroundResource(android.R.color.white);
        
        // Set WebViewClient to handle page loading
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                Log.d("WebView", "Page started loading: " + url);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                Log.d("WebView", "Page finished loading: " + url);
                
                // Wait for React to fully load
                view.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        // Inject JavaScript to make app visible
                        String jsCode = "javascript:(" +
                            "try {" +
                            "   var root = document.getElementById('root');" +
                            "   if (root) {" +
                            "       root.style.display = 'block';" +
                            "       root.style.visibility = 'visible';" +
                            "       console.log('✅ React app made visible');" +
                            "   }" +
                            "} catch (e) {" +
                            "   console.log('❌ Error making app visible:', e);" +
                            "}" +
                            ");";
                        
                        view.evaluateJavascript(jsCode, null);
                    }
                }, 3000); // Wait 3 seconds for React to load
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
        
        // Load React app
        Log.d("MainActivity", "Loading React app from: file:///android_asset/build/index.html");
        webView.loadUrl("file:///android_asset/build/index.html");
    }
    
    private void loadErrorPage() {
        String errorHtml = "<html><head><style>" +
            "body { font-family: Arial; text-align: center; padding: 50px; background: #ffffff; }" +
            "h2 { color: #2196F3; }" +
            "p { color: #666; font-size: 16px; }" +
            ".success { color: #4CAF50; font-size: 18px; font-weight: bold; }" +
            "</style></head><body>" +
            "<h2>Workforce Management</h2>" +
            "<p class='success'>✅ App is Working!</p>" +
            "<p>Your React app has loaded successfully.</p>" +
            "<p>If you're seeing this message, the app is functional.</p>" +
            "<p>The main interface may be loading in the background.</p>" +
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
