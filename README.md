# ScreenAI - AI Resume Screening & Candidate Ranking System

A high-performance decision-support platform for recruiters to evaluate custom Job Descriptions against candidate resumes using NLP TF-IDF cosine similarity, skill gap detection, and Gemini AI.

---

## 🚀 How to Run on Localhost (Browser)

You do **not** need Android Studio or any native mobile tools. Running on `localhost` in your browser is fully supported and recommended.

### Step 1: Install Dependencies
Open your terminal in this project directory:
```bash
npm install
```

### Step 2: Start the Dev Server
```bash
npm run dev
```

### Step 3: Open in Your Browser
Open your browser and navigate to:
```
http://localhost:3000
```

That's it! The Express backend and Vite frontend run seamlessly together on port 3000.

---

## 📱 Running in Android Studio (Localhost)

If you are using **Android Studio**:

### Option A: Run Localhost directly in Android Studio Terminal (Easiest)
1. Open this project in Android Studio.
2. Open the built-in **Terminal** tab at the bottom (`Alt + F12` on Windows/Linux or `Option + F12` on Mac).
3. Run:
   ```bash
   npm install && npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

### Option B: Run in Android Studio Emulator (Connects to Localhost)
1. In Android Studio, click **File > Open...** and select the `/android` directory.
2. In your terminal, make sure `npm run dev` is running.
3. Click the green **Run (▶)** button in Android Studio.
4. The emulator launches and automatically connects to `http://10.0.2.2:3000` (which routes directly to your computer's `localhost:3000`).

---

## ✨ Core Features

1. **Custom Job Description (JD) Input**:
   - Paste or upload any custom Job Description.
   - Automatically extracts **Job Title**, **Minimum Experience**, **Mandatory Core Skills**, and **Bonus Skills** within milliseconds using NLP and Gemini AI.

2. **Resume Upload & Batch Evaluation**:
   - Upload multiple resumes (`.txt`, `.pdf`, `.docx`, `.doc`) or paste resume text.
   - Evaluates each candidate against the custom JD requirements.

3. **Candidate Evaluation Matrix**:
   - **Search Bar**: Live filtering by **Candidate Name**, **Status** (Shortlisted, Interviewing, Pending, On Hold, Rejected), or **Keywords** (skills, education, role, summary).
   - **Scoring Breakdown**: Total match score, skills match %, experience alignment, education fit, and NLP semantic cosine similarity.
   - **Skill Gap Detection**: Green chips for matched skills, amber/red chips for missing mandatory skills.

4. **HR Record Export (PDF & CSV)**:
   - Export full candidate ranking matrix to **Formatted PDF** report with status colors, score summary, and timestamp.
   - Export structured data to **CSV** spreadsheet for Excel, Google Sheets, or ATS import.

5. **AI Recruiter Copilot**:
   - Interactive chat assistant to ask questions about candidate comparisons, interview questions, and pipeline summaries.

---

## 🛠 Project Structure
- `server.ts` - Express backend with Gemini AI routes (`/api/extract-jd`, `/api/screen-candidate`, `/api/chat`) and Vite middlewares.
- `src/App.tsx` - Main React application component.
- `src/components/JobDescriptionEditor.tsx` - Automatic JD extraction and editing.
- `src/components/ResumeUploader.tsx` - Multi-resume parser & batch uploader.
- `src/components/CandidateEvaluationMatrix.tsx` - Matrix with search bar, filters, sorting, and export triggers.
- `src/utils/reportExport.ts` - Client-side PDF (`jspdf`, `jspdf-autotable`) and CSV generator.
- `src/utils/nlpEngine.ts` - Local fast TF-IDF and regex skill extractor.
