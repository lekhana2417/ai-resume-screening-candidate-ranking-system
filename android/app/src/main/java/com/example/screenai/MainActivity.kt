package com.example.screenai

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    // Localhost in Android Studio Emulator: 10.0.2.2 points to host PC localhost:3000
    private var currentUrl = "http://10.0.2.2:3000"
    private val cloudBackupUrl = "https://ais-dev-tk5rkvnyks2q6fkhsgym6f-646263224987.asia-southeast1.run.app"

    // File picker launcher for resume uploads (.pdf, .docx, .txt)
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val clipData = result.data?.clipData
            val dataUri = result.data?.data
            val results = when {
                clipData != null -> Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                dataUri != null -> arrayOf(dataUri)
                else -> null
            }
            filePathCallback?.onReceiveValue(results)
        } else {
            filePathCallback?.onReceiveValue(null)
        }
        filePathCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)

        // Modern WebView configuration
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            useWideViewPort = true
            loadWithOverviewMode = true
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
            userAgentString = webView.settings.userAgentString + " ScreenAI-AndroidApp/1.0"
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    view?.loadUrl(url)
                    return true
                }
                return false
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                // Only show custom error screen if the main page failed to load
                if (request?.isForMainFrame == true) {
                    showLocalhostHelpScreen()
                }
            }
        }

        // WebChromeClient supports file attachments for resumes
        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                    putExtra(Intent.EXTRA_MIME_TYPES, arrayOf(
                        "application/pdf",
                        "text/plain",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ))
                }
                filePickerLauncher.launch(Intent.createChooser(intent, "Select Resumes"))
                return true
            }
        }

        // Back button navigation inside WebView
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Load the ScreenAI Web Application on Localhost
        loadTargetUrl(currentUrl)
    }

    private fun loadTargetUrl(url: String) {
        currentUrl = url
        webView.loadUrl(url)
    }

    private fun showLocalhostHelpScreen() {
        val errorHtml = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        background: #0f172a;
                        color: #f8fafc;
                        padding: 24px 18px;
                        margin: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 80vh;
                        text-align: center;
                    }
                    .card {
                        background: #1e293b;
                        border: 1px solid #334155;
                        border-radius: 16px;
                        padding: 24px;
                        max-width: 400px;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
                    }
                    .badge {
                        display: inline-block;
                        background: rgba(16, 185, 129, 0.2);
                        color: #34d399;
                        padding: 4px 12px;
                        border-radius: 999px;
                        font-size: 12px;
                        font-weight: bold;
                        margin-bottom: 12px;
                    }
                    h2 { margin: 0 0 10px 0; font-size: 20px; color: #ffffff; }
                    p { color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 8px 0; }
                    .code-box {
                        background: #090d16;
                        color: #38bdf8;
                        font-family: monospace;
                        font-size: 13px;
                        padding: 12px;
                        border-radius: 10px;
                        margin: 16px 0;
                        text-align: left;
                        border: 1px solid #1e293b;
                    }
                    .btn-group { display: flex; flex-direction: column; gap: 10px; margin-top: 18px; }
                    .btn {
                        border: none;
                        padding: 12px 18px;
                        border-radius: 10px;
                        font-weight: bold;
                        font-size: 14px;
                        cursor: pointer;
                        text-decoration: none;
                    }
                    .btn-primary { background: #4f46e5; color: white; }
                    .btn-secondary { background: #334155; color: #e2e8f0; }
                </style>
            </head>
            <body>
                <div class="card">
                    <span class="badge">ScreenAI Localhost Bridge</span>
                    <h2>Connecting to Localhost:3000</h2>
                    <p>The Android Studio emulator is trying to connect to your computer at <b>http://10.0.2.2:3000</b>.</p>
                    
                    <p>Make sure your server is running in your terminal:</p>
                    <div class="code-box">
                        $ npm run dev
                    </div>

                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="window.location.href='http://10.0.2.2:3000'">
                            🔄 Retry Connection (10.0.2.2:3000)
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.href='$cloudBackupUrl'">
                            ☁️ Switch to Cloud Live Server
                        </button>
                    </div>
                </div>
            </body>
            </html>
        """.trimIndent()
        webView.loadDataWithBaseURL(null, errorHtml, "text/html", "utf-8", null)
    }
}
