# ScreenAI Android Project (Localhost Ready)

This folder contains a ready-to-run Android Studio project for **ScreenAI - AI Resume Screening & Evaluation Matrix**.

---

## ⚡ Option 1: Just Run Localhost in Android Studio (Quickest)

If you have Android Studio open and just want to run localhost:

1. Open the **Terminal** tab at the bottom of Android Studio (or press `Alt + F12` on Windows/Linux or `Option + F12` on Mac).
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

---

## 📱 Option 2: Run in Android Studio Emulator (Connects to Localhost)

1. Open **Android Studio**.
2. Select **File > Open...** and choose the `android` folder in this repository.
3. Gradle will sync automatically.
4. Ensure your localhost server is running in your terminal:
   ```bash
   npm run dev
   ```
5. Click the green **Run (▶)** button in Android Studio.
6. The app will launch in the Android Emulator and automatically connect to `http://10.0.2.2:3000` (which is Android Studio's bridge to your computer's `localhost:3000`).

### Notes:
- **10.0.2.2:3000**: In the Android Emulator, `10.0.2.2` is the special IP alias that routes directly to `localhost` of your host computer.
- **Physical Device over USB**: If testing on a physical phone connected with USB debugging, run `adb reverse tcp:3000 tcp:3000` so `localhost:3000` resolves directly to your laptop.
- **File Uploads**: Supports uploading PDF, DOCX, and TXT resumes directly from Android storage or Google Drive.
