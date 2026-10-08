export interface JobDescription {
  id: string;
  title: string;
  department: string;
  minExperienceYears: number;
  educationLevel: string;
  summary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  rawText: string;
}

export interface CandidateResume {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currentRole: string;
  experienceYears: number;
  education: string;
  skills: string[];
  summary: string;
  rawText: string;
  fileName?: string;
}

export type CandidateTier = 'TOP_MATCH' | 'STRONG_FIT' | 'MODERATE_FIT' | 'LOW_MATCH';

export type CandidateStatus = 'PENDING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'ON_HOLD' | 'REJECTED';

export interface SkillAlignment {
  skill: string;
  type: 'REQUIRED' | 'PREFERRED';
  matched: boolean;
  contextSnippet?: string;
}

export interface CandidateAnalysisResult {
  id: string;
  candidateId: string;
  candidateName: string;
  currentRole: string;
  experienceYears: number;
  education: string;
  
  // Scores (0 - 100)
  overallScore: number;
  nlpCosineScore: number;
  geminiSemanticScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  
  // Categorization
  tier: CandidateTier;
  status: CandidateStatus;
  
  // Detailed Insights
  matchedSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  bonusSkills: string[];
  skillAlignments: SkillAlignment[];
  
  strengths: string[];
  gaps: string[];
  executiveSummary: string;
  
  // Interview support
  interviewQuestions: {
    question: string;
    rationale: string;
    expectedResponse: string;
  }[];
  
  recruiterNotes: string;
  emailDraft?: {
    type: 'INVITE' | 'REJECT';
    subject: string;
    body: string;
  };
}

export interface ScreeningWeights {
  skillsWeight: number; // e.g. 0.40
  experienceWeight: number; // e.g. 0.30
  educationWeight: number; // e.g. 0.15
  semanticWeight: number; // e.g. 0.15
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

