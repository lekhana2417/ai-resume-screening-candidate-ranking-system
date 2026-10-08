import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  Download,
  Terminal,
  FolderTree,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Code2,
  Settings,
  HelpCircle,
  FileCode,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AndroidStudioGuideModalProps {
  onClose: () => void;
}

export const getAndroidMainActivity = (targetUrl: string) => `package com.example.screenai

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null

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

        // Configure modern WebView settings
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
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                view?.loadUrl(url ?: return false)
                return true
            }

            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                // If localhost server isn't running yet, show friendly guidance
                val errorHtml = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { font-family: -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; text-align: center; }
                            .card { background: #1e293b; border-radius: 16px; padding: 24px; max-width: 380px; margin: 40px auto; border: 1px solid #334155; }
                            .badge { background: #065f46; color: #34d399; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; }
                            h2 { margin: 16px 0 8px; font-size: 18px; color: #fff; }
                            p { font-size: 13px; color: #94a3b8; line-height: 1.5; }
                            .code { background: #090d16; color: #38bdf8; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 16px 0; text-align: left; }
                            .btn { display: block; width: 100%; box-sizing: border-box; background: #4f46e5; color: white; padding: 12px; border-radius: 10px; font-weight: bold; border: none; font-size: 14px; cursor: pointer; text-decoration: none; margin-top: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <span class="badge">ScreenAI Localhost</span>
                            <h2>Connecting to 10.0.2.2:3000</h2>
                            <p>Make sure your local dev server is running on your computer:</p>
                            <div class="code">$ npm run dev</div>
                            <button class="btn" onclick="window.location.reload()">🔄 Retry Connection</button>
                        </div>
                    </body>
                    </html>
                """.trimIndent()
                view?.loadDataWithBaseURL(null, errorHtml, "text/html", "utf-8", null)
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

        // Load the ScreenAI Web Application
        // In Android Emulator: Use "http://10.0.2.2:3000" to reach local Node/Vite server
        // In Production: Use your Cloud Run app URL
        val appUrl = "${targetUrl}"
        webView.loadUrl(appUrl)
    }
}
`;

export const ANDROID_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.screenai">

    <!-- Permissions required for network API calls and file access -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="ScreenAI"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`;

export const ANDROID_ACTIVITY_XML = `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webView"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
`;

export const ANDROID_BUILD_GRADLE = `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.screenai"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.screenai"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.activity:activity-ktx:1.9.1")
    implementation("androidx.webkit:webkit:1.11.0")
}
`;

export const ANDROID_README = `# ScreenAI - Android Studio Setup Guide

## Quick Setup Steps
1. Open Android Studio (Ladybug, Koala, Jellyfish, or newer).
2. Click "New Project" -> Select "Empty Views Activity" (Language: Kotlin).
3. Set Name to "ScreenAI" and Package Name to "com.example.screenai".
4. Replace the following files in your project with the provided code:
   - app/src/main/java/com/example/screenai/MainActivity.kt
   - app/src/main/AndroidManifest.xml
   - app/src/main/res/layout/activity_main.xml
   - app/build.gradle.kts
5. Click "Sync Project with Gradle Files" (elephant icon).
6. Select an Android Emulator (e.g. Pixel 8, API 34) or connect an Android phone with USB Debugging enabled.
7. Click Run (green play button ▶).

## URLs & Network
- Cloud URL (Default): https://ais-dev-tk5rkvnyks2q6fkhsgym6f-646263224987.asia-southeast1.run.app
- Localhost in Emulator: http://10.0.2.2:3000 (10.0.2.2 is the special alias to your host PC localhost).

## Features Supported in Android Studio:
- Full responsive UI adapted for mobile phones & tablets
- File picker for uploading resumes (.pdf, .docx, .txt) directly from Android storage / Google Drive
- Hardware acceleration & native back button support
- PDF & CSV report export
- Gemini AI Recruiter Copilot
`;

export const AndroidStudioGuideModal: React.FC<AndroidStudioGuideModalProps> = ({
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'kotlin' | 'manifest' | 'layout' | 'gradle' | 'troubleshooting'>('quickstart');
  const [targetUrlType, setTargetUrlType] = useState<'cloud' | 'local'>('local');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cloudUrl = 'https://ais-dev-tk5rkvnyks2q6fkhsgym6f-646263224987.asia-southeast1.run.app';
  const localUrl = 'http://10.0.2.2:3000';
  const activeTargetUrl = targetUrlType === 'cloud' ? cloudUrl : localUrl;

  const currentMainActivity = getAndroidMainActivity(activeTargetUrl);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllAndroidFiles = () => {
    downloadFile('MainActivity.kt', currentMainActivity);
    setTimeout(() => downloadFile('AndroidManifest.xml', ANDROID_MANIFEST), 200);
    setTimeout(() => downloadFile('activity_main.xml', ANDROID_ACTIVITY_XML), 400);
    setTimeout(() => downloadFile('build.gradle.kts', ANDROID_BUILD_GRADLE), 600);
    setTimeout(() => downloadFile('README_ANDROID.md', ANDROID_README), 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Android Studio Integration & Execution</span>
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Zero Errors
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Run this AI Resume Screening app inside Android Studio emulator or export to an Android APK
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target URL Selector */}
        <div className="px-6 py-2.5 bg-slate-800/90 text-white border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Android Target URL:</span>
            <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setTargetUrlType('cloud')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  targetUrlType === 'cloud'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cloud Preview URL
              </button>
              <button
                type="button"
                onClick={() => setTargetUrlType('local')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  targetUrlType === 'local'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Localhost Emulator (10.0.2.2:3000)
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <code className="text-[11px] font-mono text-emerald-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[280px]">
              {activeTargetUrl}
            </code>
            <button
              type="button"
              onClick={downloadAllAndroidFiles}
              className="flex items-center space-x-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded cursor-pointer transition shadow-2xs"
            >
              <Download className="w-3 h-3" />
              <span>Download All 4 Files</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex space-x-4 sm:space-x-6 text-xs font-bold bg-slate-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition ${
              activeTab === 'quickstart' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>3-Step Quickstart</span>
          </button>

          <button
            onClick={() => setActiveTab('kotlin')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition ${
              activeTab === 'kotlin' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>MainActivity.kt</span>
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition ${
              activeTab === 'manifest' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>AndroidManifest.xml</span>
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition ${
              activeTab === 'layout' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>activity_main.xml</span>
          </button>

          <button
            onClick={() => setActiveTab('gradle')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition ${
              activeTab === 'gradle' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>build.gradle.kts</span>
          </button>

          <button
            onClick={() => setActiveTab('troubleshooting')}
            className={`py-3.5 border-b-2 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap transition ${
              activeTab === 'troubleshooting' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Troubleshooting</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 1: Quickstart */}
          {activeTab === 'quickstart' && (
            <div className="space-y-5">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 leading-relaxed flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold">Pre-Configured Android Project Included:</strong> The <code className="bg-emerald-200/60 font-mono px-1 py-0.5 rounded text-emerald-950 font-bold">/android</code> folder is already generated in this repository with full Gradle configuration, ready to open in Android Studio and run immediately on <strong className="underline">localhost</strong>!
                </div>
              </div>

              {/* Localhost inside Android Studio Callout */}
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-4 text-xs space-y-2 border border-indigo-700/50 shadow-sm">
                <div className="flex items-center space-x-2 font-bold text-sm text-indigo-300">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Easiest: Run Localhost inside Android Studio Terminal</span>
                </div>
                <p className="text-slate-300 text-xs">
                  If you have Android Studio open, you can run the app directly in local host in just 5 seconds:
                </p>
                <div className="bg-slate-950 text-emerald-300 p-2.5 rounded-lg font-mono text-[11px] flex items-center justify-between border border-slate-800">
                  <code>npm install && npm run dev</code>
                  <button
                    onClick={() => handleCopy('terminal_cmd', 'npm install && npm run dev')}
                    className="text-xs text-indigo-300 hover:text-white cursor-pointer ml-2"
                  >
                    {copiedKey === 'terminal_cmd' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Press <kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded text-[10px]">Alt + F12</kbd> (or <kbd className="bg-slate-800 text-slate-200 px-1 py-0.5 rounded text-[10px]">Option + F12</kbd> on Mac) to open Android Studio's built-in terminal, paste the command, and your app is live on <strong className="text-white">http://localhost:3000</strong>!
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Open Pre-Built Project in Android Studio</h4>
                    <p className="text-slate-600 mt-1">
                      Open Android Studio → Click <strong>File &gt; Open...</strong> → Select the <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">android</code> folder from this project. Gradle will sync automatically in seconds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Make Sure Localhost Server is Running</h4>
                    <p className="text-slate-600 mt-1">
                      In any terminal window (or inside Android Studio's Terminal tab), keep <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">npm run dev</code> running.
                    </p>
                    <p className="text-slate-500 mt-1 text-[11px]">
                      💡 <strong>Why 10.0.2.2?</strong> Inside Android Studio's emulator, <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">10.0.2.2:3000</code> is the internal routing IP to your computer's <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">localhost:3000</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Click Run (▶) in Android Studio</h4>
                    <p className="text-slate-600 mt-1">
                      Click the green <strong>Run (▶)</strong> button in Android Studio. The app will launch in your Android emulator or connected device with full AI screening, JD parsing, PDF/CSV export, and chatbot support!
                    </p>
                    <div className="mt-2.5 p-2.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] flex items-center justify-between">
                      <span>Configured Target: {activeTargetUrl}</span>
                      <button
                        onClick={() => handleCopy('url', activeTargetUrl)}
                        className="text-emerald-400 hover:text-emerald-300 ml-2 cursor-pointer font-bold"
                      >
                        {copiedKey === 'url' ? 'Copied!' : 'Copy Target'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Kotlin */}
          {activeTab === 'kotlin' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  app/src/main/java/com/example/screenai/MainActivity.kt
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy('kt', currentMainActivity)}
                    className="flex items-center space-x-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    {copiedKey === 'kt' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'kt' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile('MainActivity.kt', currentMainActivity)}
                    className="flex items-center space-x-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <pre className="text-xs font-mono bg-slate-950 text-slate-200 p-4 rounded-xl overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                {currentMainActivity}
              </pre>
            </div>
          )}

          {/* TAB 3: Manifest */}
          {activeTab === 'manifest' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  app/src/main/AndroidManifest.xml
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy('manifest', ANDROID_MANIFEST)}
                    className="flex items-center space-x-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    {copiedKey === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'manifest' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile('AndroidManifest.xml', ANDROID_MANIFEST)}
                    className="flex items-center space-x-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <pre className="text-xs font-mono bg-slate-950 text-slate-200 p-4 rounded-xl overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                {ANDROID_MANIFEST}
              </pre>
            </div>
          )}

          {/* TAB 4: Layout */}
          {activeTab === 'layout' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  app/src/main/res/layout/activity_main.xml
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy('layout', ANDROID_ACTIVITY_XML)}
                    className="flex items-center space-x-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    {copiedKey === 'layout' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'layout' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile('activity_main.xml', ANDROID_ACTIVITY_XML)}
                    className="flex items-center space-x-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <pre className="text-xs font-mono bg-slate-950 text-slate-200 p-4 rounded-xl overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                {ANDROID_ACTIVITY_XML}
              </pre>
            </div>
          )}

          {/* TAB 5: Gradle */}
          {activeTab === 'gradle' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  app/build.gradle.kts (Module :app)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy('gradle', ANDROID_BUILD_GRADLE)}
                    className="flex items-center space-x-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    {copiedKey === 'gradle' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'gradle' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => downloadFile('build.gradle.kts', ANDROID_BUILD_GRADLE)}
                    className="flex items-center space-x-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <pre className="text-xs font-mono bg-slate-950 text-slate-200 p-4 rounded-xl overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                {ANDROID_BUILD_GRADLE}
              </pre>
            </div>
          )}

          {/* TAB 6: Troubleshooting */}
          {activeTab === 'troubleshooting' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>1. ERR_CLEARTEXT_NOT_PERMITTED when testing http://10.0.2.2:3000</span>
                </h4>
                <p className="text-slate-600">
                  Android by default blocks unencrypted HTTP traffic. This is already resolved in our <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">AndroidManifest.xml</code> via <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">android:usesCleartextTraffic="true"</code>. If testing against our HTTPS Cloud URL, this is not needed.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>2. How does file upload work in Android WebView?</span>
                </h4>
                <p className="text-slate-600">
                  Standard WebViews do not open file dialogues without custom code. Our <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">MainActivity.kt</code> overrides <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">WebChromeClient.onShowFileChooser</code> with an <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">ActivityResultContracts.StartActivityForResult</code> launcher, so clicking "Upload Resumes" triggers the native Android file selector smoothly!
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>3. Running on a Physical Android Smartphone</span>
                </h4>
                <p className="text-slate-600">
                  Connect your phone with a USB cable. On your phone, go to <strong>Settings → Developer Options → Enable USB Debugging</strong>. In Android Studio's device dropdown at the top, select your phone name and click Run (▶). Alternatively, go to <strong>Build → Build Bundle(s) / APK(s) → Build APK(s)</strong> to generate an installable <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">.apk</code> file!
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>4. Back Button Handling</span>
                </h4>
                <p className="text-slate-600">
                  Instead of closing the app when pressing the Android back button, <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">OnBackPressedCallback</code> checks <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">webView.canGoBack()</code> to navigate backwards inside the app history first.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Ready for Android 8.0 through Android 15 (API 26 - 35)</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer transition shadow-2xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
