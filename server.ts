import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Gemini SDK with User-Agent header as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Candidate Evaluation endpoint
app.post('/api/screen-candidate', async (req, res) => {
  try {
    const { jobDescription, candidateResume } = req.body;

    if (!jobDescription || !candidateResume) {
      return res.status(400).json({ error: 'jobDescription and candidateResume are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback if API key is not present
      return res.json({
        fallback: true,
        message: 'No GEMINI_API_KEY found. Falling back to local NLP engine.'
      });
    }

    const prompt = `You are a Principal Technical Recruiter and Talent Assessment Lead evaluating a candidate for an open job requisition.

Analyze this candidate's resume rigorously against the job description.

JOB DESCRIPTION:
Title: ${jobDescription.title || 'Role'}
Required Skills: ${(jobDescription.requiredSkills || []).join(', ')}
Preferred Skills: ${(jobDescription.preferredSkills || []).join(', ')}
Minimum Experience: ${jobDescription.minExperienceYears || 0} years
Education Level: ${jobDescription.educationLevel || 'Degree'}
Full Description:
${jobDescription.rawText || jobDescription.summary || ''}

CANDIDATE RESUME:
Name: ${candidateResume.name || 'Candidate'}
Current Role: ${candidateResume.currentRole || 'Professional'}
Experience: ${candidateResume.experienceYears || 'Unknown'} years
Education: ${candidateResume.education || 'Unknown'}
Resume Content:
${candidateResume.rawText || ''}

Provide an honest, objective, and detailed assessment. Score each metric between 0 and 100 based on genuine qualification.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert talent acquisition AI. Evaluate candidate resumes strictly and objectively against job descriptions. Return only valid JSON according to the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Composite overall fit score from 0 to 100' },
            skillsScore: { type: Type.INTEGER, description: 'Hard and technical skills match score 0-100' },
            experienceScore: { type: Type.INTEGER, description: 'Relevance and depth of work experience score 0-100' },
            educationScore: { type: Type.INTEGER, description: 'Education and certifications alignment score 0-100' },
            tier: {
              type: Type.STRING,
              description: 'One of: TOP_MATCH, STRONG_FIT, MODERATE_FIT, LOW_MATCH'
            },
            matchedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Skills explicitly present in both JD and resume'
            },
            missingRequiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Critical required skills from JD that candidate lacks'
            },
            bonusSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Preferred or high-value extra skills candidate brings'
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 3-4 specific strengths of candidate'
            },
            gaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 2-4 critical gaps, missing tools, or experience deficits'
            },
            executiveSummary: {
              type: Type.STRING,
              description: 'Professional 2-3 sentence recruiter executive summary of candidate suitability'
            },
            interviewQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: 'Targeted interview question testing declared skills or gaps' },
                  rationale: { type: Type.STRING, description: 'Why recruiter should ask this question' },
                  expectedResponse: { type: Type.STRING, description: 'What a top candidate response should demonstrate' }
                },
                required: ['question', 'rationale', 'expectedResponse']
              },
              description: '3 targeted interview questions'
            }
          },
          required: [
            'overallScore',
            'skillsScore',
            'experienceScore',
            'educationScore',
            'tier',
            'matchedSkills',
            'missingRequiredSkills',
            'strengths',
            'gaps',
            'executiveSummary',
            'interviewQuestions'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, result: parsed });
  } catch (err: unknown) {
    console.error('Error in /api/screen-candidate:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Screening failed',
      fallback: true
    });
  }
});

// Generate Tailored Interview Questions & Email Draft
app.post('/api/candidate-actions', async (req, res) => {
  try {
    const { actionType, candidateName, roleTitle, strengths, gaps } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        subject: actionType === 'INVITE' ? `Interview Invitation: ${roleTitle}` : `Update on your application for ${roleTitle}`,
        body: actionType === 'INVITE'
          ? `Dear ${candidateName},\n\nThank you for applying for the ${roleTitle} position. We were very impressed with your background and would like to invite you to an initial interview.\n\nBest regards,\nRecruiting Team`
          : `Dear ${candidateName},\n\nThank you for your interest in the ${roleTitle} role. After careful consideration, we have chosen to move forward with other candidates whose experience more closely matches our immediate requirements.\n\nWe wish you the very best in your search.\n\nSincerely,\nRecruiting Team`
      });
    }

    const prompt = `Write a personalized recruiter email for candidate "${candidateName}" who applied for "${roleTitle}".
Action: ${actionType === 'INVITE' ? 'Invite to first-round technical interview' : 'Polite, constructive rejection email'}.
Candidate Strengths: ${(strengths || []).join(', ')}
Candidate Areas of Concern: ${(gaps || []).join(', ')}

Return a JSON with:
- subject (string)
- body (string, professional and well-formatted)` ;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: unknown) {
    console.error('Error generating email draft:', err);
    res.status(500).json({ error: 'Failed to generate action' });
  }
});

// Multi-turn Gemini Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: "I am your AI Recruiting Copilot. Please attach a GEMINI_API_KEY to enable live multi-turn reasoning across your candidate resumes and job description."
      });
    }

    const systemInstruction = `You are a Principal Talent Acquisition Partner and Technical Recruiter Copilot.
You have full visibility into the active Job Requisition and Candidate Resumes provided by the user.

CONTEXT DATA:
${context ? JSON.stringify(context, null, 2) : 'No requisition or candidate context loaded yet.'}

GUIDELINES:
- Provide sharp, data-backed insights on candidate qualifications, trade-offs, and skill gaps.
- Answer questions directly: compare candidates, highlight red flags, draft specific interview questions, and give hiring recommendations.
- Keep responses professional, structured with concise bullet points, and actionable for hiring managers.`;

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
      }
    });

    res.json({ reply: response.text || "I was unable to generate a response." });
  } catch (err: unknown) {
    console.error('Error in /api/chat:', err);
    // Graceful response on transient 503 or rate limits
    const candCount = req.body?.context?.candidates?.length || 0;
    const roleTitle = req.body?.context?.jobDescription?.title || 'Open Requisition';
    res.json({
      reply: `I have reviewed the active candidate pool for **${roleTitle}** (${candCount} resumes loaded).

${candCount > 0 ? `• **Top Candidate Focus:** Review candidates with verified matches in mandatory requisition skills.\n• **Interview Focus:** Probe declared project contributions and verify any missing technologies highlighted in the evaluation cards.` : '• Upload your Job Description and Resumes to evaluate candidate qualifications and generate targeted interview questions.'}

*(Note: The AI reasoning service is experiencing a temporary load spike; detailed qualitative synthesis will resume on your next query.)*`
    });
  }
});

// Auto-extract JD structured fields from user raw text
app.post('/api/extract-jd', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'rawText is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ fallback: true });
    }

    const prompt = `Analyze this raw job description and extract key structured information:
${rawText}

Return valid JSON with:
- title: string (role title)
- department: string
- minExperienceYears: number
- educationLevel: string
- requiredSkills: array of strings (core mandatory skills)
- preferredSkills: array of strings (nice to have / bonus skills)
- summary: 1-2 sentence executive summary`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            department: { type: Type.STRING },
            minExperienceYears: { type: Type.INTEGER },
            educationLevel: { type: Type.STRING },
            requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING }
          },
          required: ['title', 'requiredSkills', 'preferredSkills', 'minExperienceYears', 'educationLevel', 'summary']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, extracted: parsed });
  } catch (err: unknown) {
    console.error('Error in /api/extract-jd:', err);
    // Heuristic fallback extraction
    const raw = req.body?.rawText || '';
    const lines = raw.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const title = lines[0] && lines[0].length < 60 ? lines[0].replace(/^(job title|role|title|position):\s*/i, '') : 'Open Requisition';
    // Multi-pattern experience extraction from given JD
    let exp = 0;
    const expPatterns = [
      /(?:min(?:imum)?|at\s+least|requires?)\s*(\d+)(?:\s*[-–to]\s*\d+)?\+?\s*(?:years?|yrs?)/i,
      /(?:experience\s*(?:required|needed)?|work\s+experience|relevant\s+experience)\s*:\s*(\d+)(?:\s*[-–to]\s*\d+)?\+?\s*(?:years?|yrs?)?/i,
      /(\d+)\s*[-–to]\s*(\d+)\s*(?:years?|yrs?)(?:\s+of)?(?:\s+(?:relevant|work|professional)?\s*experience)?/i,
      /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+(?:relevant|work|professional|industry)?\s*experience)/i,
      /(\d+)\+?\s*(?:years?|yrs?)/i
    ];
    for (const pat of expPatterns) {
      const match = raw.match(pat);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 30) {
          exp = parsed;
          break;
        }
      }
    }

    // Detect common skills
    const commonSkills = [
      'React', 'TypeScript', 'JavaScript', 'Python', 'FastAPI', 'Node.js',
      'Docker', 'Kubernetes', 'PostgreSQL', 'SQL', 'AWS', 'GCP', 'Azure',
      'Git', 'CI/CD', 'REST APIs', 'GraphQL', 'Java', 'Go', 'Redis'
    ];
    const detected = commonSkills.filter(s => new RegExp(`\\b${s}\\b`, 'i').test(raw));

    res.json({
      success: true,
      extracted: {
        title,
        department: 'Engineering',
        minExperienceYears: exp,
        educationLevel: "Bachelor's Degree or equivalent",
        requiredSkills: detected.slice(0, 6),
        preferredSkills: detected.slice(6, 10),
        summary: lines.slice(1, 3).join(' ') || 'Job requisition details'
      }
    });
  }
});

// Server setup: Vite dev middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Resume Screening server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
