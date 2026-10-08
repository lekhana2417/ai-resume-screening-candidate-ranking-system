import {
  JobDescription,
  CandidateResume,
  CandidateAnalysisResult,
  ScreeningWeights,
  CandidateTier,
  SkillAlignment
} from '../types';
import {
  calculateDocumentSimilarity,
  checkSkillMatch
} from './nlpEngine';

/**
 * Determine candidate tier based on overall score
 */
export function getTierFromScore(score: number): CandidateTier {
  if (score >= 85) return 'TOP_MATCH';
  if (score >= 70) return 'STRONG_FIT';
  if (score >= 55) return 'MODERATE_FIT';
  return 'LOW_MATCH';
}

/**
 * Fallback local NLP & Heuristic analysis if server or API key is unavailable
 */
export function evaluateCandidateLocally(
  jd: JobDescription,
  candidate: CandidateResume,
  weights: ScreeningWeights = {
    skillsWeight: 0.40,
    experienceWeight: 0.30,
    educationWeight: 0.15,
    semanticWeight: 0.15,
  }
): CandidateAnalysisResult {
  // 1. TF-IDF Cosine Similarity
  const fullJdText = `${jd.title} ${jd.summary} ${jd.rawText} ${(jd.requiredSkills || []).join(' ')} ${(jd.preferredSkills || []).join(' ')}`;
  const fullResumeText = `${candidate.currentRole} ${candidate.summary} ${candidate.rawText} ${(candidate.skills || []).join(' ')}`;
  const nlpCosineScore = calculateDocumentSimilarity(fullJdText, fullResumeText);

  // 2. Skill Alignment
  const matchedSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];
  const bonusSkills: string[] = [];

  const candidateSkillsCombined = [
    ...(candidate.skills || []),
    candidate.rawText
  ].join(' ');

  // Required skills check
  for (const skill of jd.requiredSkills || []) {
    if (checkSkillMatch(skill, candidateSkillsCombined)) {
      matchedSkills.push(skill);
    } else {
      missingRequiredSkills.push(skill);
    }
  }

  // Preferred skills check
  for (const skill of jd.preferredSkills || []) {
    if (checkSkillMatch(skill, candidateSkillsCombined)) {
      matchedSkills.push(skill);
      bonusSkills.push(skill);
    } else {
      missingPreferredSkills.push(skill);
    }
  }

  // Identify any other candidate skills as bonus
  for (const candSkill of candidate.skills || []) {
    if (!jd.requiredSkills.includes(candSkill) && !bonusSkills.includes(candSkill)) {
      bonusSkills.push(candSkill);
    }
  }

  const reqCount = jd.requiredSkills.length || 1;
  const reqMatchedCount = jd.requiredSkills.filter(s => matchedSkills.includes(s)).length;
  const skillsScore = Math.min(100, Math.round((reqMatchedCount / reqCount) * 85 + (bonusSkills.length > 0 ? 15 : 0)));

  // 3. Experience Score
  const expDiff = candidate.experienceYears - jd.minExperienceYears;
  let experienceScore = 70;
  if (expDiff >= 2) experienceScore = 100;
  else if (expDiff >= 0) experienceScore = 90;
  else if (expDiff === -1) experienceScore = 75;
  else if (expDiff === -2) experienceScore = 55;
  else experienceScore = 35;

  // 4. Education Score
  let educationScore = 80;
  const eduLower = candidate.education.toLowerCase();
  if (eduLower.includes('master') || eduLower.includes('phd') || eduLower.includes('doctorate')) {
    educationScore = 100;
  } else if (eduLower.includes('bachelor') || eduLower.includes('b.s.') || eduLower.includes('b.tech')) {
    educationScore = 88;
  } else if (eduLower.includes('associate') || eduLower.includes('diploma')) {
    educationScore = 65;
  }

  // 5. Semantic Score approximation
  const geminiSemanticScore = Math.round((nlpCosineScore * 0.5) + (skillsScore * 0.5));

  // Weighted overall score
  const overallScore = Math.min(
    100,
    Math.round(
      (skillsScore * weights.skillsWeight) +
      (experienceScore * weights.experienceWeight) +
      (educationScore * weights.educationWeight) +
      (nlpCosineScore * weights.semanticWeight)
    )
  );

  const tier = getTierFromScore(overallScore);

  // Generate strengths & gaps
  const strengths: string[] = [];
  if (reqMatchedCount >= reqCount * 0.8) {
    strengths.push(`Matches ${reqMatchedCount} of ${reqCount} required technical skills`);
  }
  if (candidate.experienceYears >= jd.minExperienceYears) {
    strengths.push(`Exceeds required minimum experience (${candidate.experienceYears} yrs vs ${jd.minExperienceYears} yrs required)`);
  }
  if (bonusSkills.length > 0) {
    strengths.push(`Brings valuable complementary skills: ${bonusSkills.slice(0, 3).join(', ')}`);
  }
  if (strengths.length === 0) {
    strengths.push('Demonstrates foundational technical literacy');
  }

  const gaps: string[] = [];
  if (missingRequiredSkills.length > 0) {
    gaps.push(`Missing critical core skills: ${missingRequiredSkills.slice(0, 3).join(', ')}`);
  }
  if (candidate.experienceYears < jd.minExperienceYears) {
    gaps.push(`Experience is below requested threshold (${candidate.experienceYears} yrs vs ${jd.minExperienceYears} yrs min)`);
  }
  if (gaps.length === 0) {
    gaps.push('No critical skill deficiencies detected against current job description');
  }

  const executiveSummary = `${candidate.name} is currently a ${candidate.currentRole} with ${candidate.experienceYears} years of experience. They present an overall alignment score of ${overallScore}% with ${matchedSkills.length} matching competencies.`;

  const interviewQuestions = [
    {
      question: missingRequiredSkills.length > 0
        ? `Can you describe your familiarity with ${missingRequiredSkills[0]} and how you've handled similar technologies?`
        : `Can you walk us through a challenging project using ${matchedSkills[0] || 'your core stack'} where you solved a major architectural bottleneck?`,
      rationale: missingRequiredSkills.length > 0
        ? `Evaluates capability to bridge identified resume gap in ${missingRequiredSkills[0]}.`
        : `Verifies practical depth of stated experience in production environments.`,
      expectedResponse: `Candidate should outline concrete architectural decisions, trade-offs, and measurable business outcomes.`
    },
    {
      question: `How do you approach learning and integrating new tools into existing CI/CD or production pipelines?`,
      rationale: `Tests adaptability and adherence to modern engineering best practices.`,
      expectedResponse: `Demonstrates structured debugging, testing, and continuous learning methodology.`
    },
    {
      question: `Tell us about a time you had to balance urgent feature delivery with technical debt or code quality.`,
      rationale: `Assesses maturity, communication, and engineering judgment.`,
      expectedResponse: `Shows pragmatic balance between speed to market and long-term maintainability.`
    }
  ];

  const requiredAlignments: SkillAlignment[] = (jd.requiredSkills || []).map(skill => ({
    skill,
    type: 'REQUIRED',
    matched: matchedSkills.includes(skill)
  }));

  const preferredAlignments: SkillAlignment[] = (jd.preferredSkills || []).map(skill => ({
    skill,
    type: 'PREFERRED',
    matched: matchedSkills.includes(skill)
  }));

  return {
    id: `eval-${candidate.id}`,
    candidateId: candidate.id,
    candidateName: candidate.name,
    currentRole: candidate.currentRole,
    experienceYears: candidate.experienceYears,
    education: candidate.education,
    overallScore,
    nlpCosineScore,
    geminiSemanticScore,
    skillsScore,
    experienceScore,
    educationScore,
    tier,
    status: 'PENDING',
    matchedSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    bonusSkills,
    skillAlignments: [...requiredAlignments, ...preferredAlignments],
    strengths,
    gaps,
    executiveSummary,
    interviewQuestions,
    recruiterNotes: ''
  };
}

/**
 * Screen candidate through server API with fallback to local NLP
 */
export async function screenCandidate(
  jd: JobDescription,
  candidate: CandidateResume,
  weights: ScreeningWeights
): Promise<CandidateAnalysisResult> {
  const localResult = evaluateCandidateLocally(jd, candidate, weights);

  try {
    const res = await fetch('/api/screen-candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDescription: jd,
        candidateResume: candidate
      })
    });

    if (!res.ok) {
      return localResult;
    }

    const data = await res.json();
    if (data.fallback || !data.result) {
      return localResult;
    }

    const ai = data.result;

    // Harmonize AI scores with NLP mathematical similarity
    const nlpCosineScore = localResult.nlpCosineScore;
    const skillsScore = typeof ai.skillsScore === 'number' ? ai.skillsScore : localResult.skillsScore;
    const experienceScore = typeof ai.experienceScore === 'number' ? ai.experienceScore : localResult.experienceScore;
    const educationScore = typeof ai.educationScore === 'number' ? ai.educationScore : localResult.educationScore;
    const geminiSemanticScore = typeof ai.overallScore === 'number' ? ai.overallScore : localResult.overallScore;

    // Weighted composite
    const compositeScore = Math.min(
      100,
      Math.round(
        (skillsScore * weights.skillsWeight) +
        (experienceScore * weights.experienceWeight) +
        (educationScore * weights.educationWeight) +
        (nlpCosineScore * weights.semanticWeight)
      )
    );

    const tier = getTierFromScore(compositeScore);

    return {
      id: `eval-${candidate.id}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      currentRole: candidate.currentRole,
      experienceYears: candidate.experienceYears,
      education: candidate.education,
      overallScore: compositeScore,
      nlpCosineScore,
      geminiSemanticScore,
      skillsScore,
      experienceScore,
      educationScore,
      tier,
      status: 'PENDING',
      matchedSkills: Array.isArray(ai.matchedSkills) && ai.matchedSkills.length > 0 ? ai.matchedSkills : localResult.matchedSkills,
      missingRequiredSkills: Array.isArray(ai.missingRequiredSkills) ? ai.missingRequiredSkills : localResult.missingRequiredSkills,
      missingPreferredSkills: localResult.missingPreferredSkills,
      bonusSkills: Array.isArray(ai.bonusSkills) ? ai.bonusSkills : localResult.bonusSkills,
      skillAlignments: localResult.skillAlignments,
      strengths: Array.isArray(ai.strengths) && ai.strengths.length > 0 ? ai.strengths : localResult.strengths,
      gaps: Array.isArray(ai.gaps) && ai.gaps.length > 0 ? ai.gaps : localResult.gaps,
      executiveSummary: ai.executiveSummary || localResult.executiveSummary,
      interviewQuestions: Array.isArray(ai.interviewQuestions) && ai.interviewQuestions.length > 0 ? ai.interviewQuestions : localResult.interviewQuestions,
      recruiterNotes: ''
    };
  } catch (e) {
    console.warn('API screening call failed, using local NLP:', e);
    return localResult;
  }
}
