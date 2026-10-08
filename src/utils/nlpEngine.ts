/**
 * NLP & Machine Learning Engine for Resume Screening
 * Implements Tokenization, Stopword Removal, TF-IDF Vectorization,
 * Cosine Similarity, and Entity/Skill Alignment.
 */

// Common English stopwords to ignore in TF-IDF
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  'yourselves', 'will', 'also', 'using', 'used', 'worked', 'work', 'working', 'experience', 'responsible',
  'team', 'including', 'years', 'role'
]);

/**
 * Tokenize and normalize text into clean words & n-grams
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];
  // Normalize unicode, lowercase, replace punctuation with spaces
  const clean = text
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = clean.split(' ').filter(w => w.length > 1 && !STOPWORDS.has(w));
  return words;
}

/**
 * Compute Term Frequency (TF) for a document
 */
export function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  if (tokens.length === 0) return tf;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalized TF
  for (const [token, count] of tf.entries()) {
    tf.set(token, count / tokens.length);
  }

  return tf;
}

/**
 * Compute Inverse Document Frequency (IDF) across a corpus of documents
 */
export function computeIDF(documents: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const totalDocs = documents.length;
  if (totalDocs === 0) return idf;

  const docFreq = new Map<string, number>();

  for (const doc of documents) {
    const seen = new Set(doc);
    for (const token of seen) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }

  for (const [token, df] of docFreq.entries()) {
    // Standard smooth IDF formula: log(1 + (N / (1 + df)))
    idf.set(token, Math.log(1 + (totalDocs / (df + 1))) + 1);
  }

  return idf;
}

/**
 * Compute TF-IDF vector for a document given global vocabulary and IDF
 */
export function computeTFIDFVector(
  tf: Map<string, number>,
  idf: Map<string, number>,
  vocabulary: string[]
): number[] {
  return vocabulary.map(term => {
    const termTf = tf.get(term) || 0;
    const termIdf = idf.get(term) || 1;
    return termTf * termIdf;
  });
}

/**
 * Compute Cosine Similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return Math.min(1, Math.max(0, dotProduct / denominator));
}

/**
 * Calculate TF-IDF Cosine Similarity between Job Description and Resume
 */
export function calculateDocumentSimilarity(jobDescText: string, resumeText: string): number {
  const jdTokens = tokenizeText(jobDescText);
  const resumeTokens = tokenizeText(resumeText);

  if (jdTokens.length === 0 || resumeTokens.length === 0) return 0;

  const allDocs = [jdTokens, resumeTokens];
  const idf = computeIDF(allDocs);

  // Vocabulary = all unique tokens
  const vocabSet = new Set([...jdTokens, ...resumeTokens]);
  const vocabulary = Array.from(vocabSet);

  const jdTf = computeTF(jdTokens);
  const resumeTf = computeTF(resumeTokens);

  const jdVector = computeTFIDFVector(jdTf, idf, vocabulary);
  const resumeVector = computeTFIDFVector(resumeTf, idf, vocabulary);

  const rawSim = cosineSimilarity(jdVector, resumeVector);
  
  // Scale dynamically to a realistic recruiter score (0 - 100)
  // Since high-dimensional TF-IDF on varied document structures rarely exceeds 0.70,
  // we normalize with sigmoid/polynomial mapping:
  const normalized = Math.min(100, Math.round(Math.pow(rawSim * 1.5, 0.75) * 100));
  return normalized;
}

/**
 * Check if a skill exists in resume text with fuzzy/variant matching
 */
export function checkSkillMatch(skill: string, resumeText: string): boolean {
  if (!skill || !resumeText) return false;
  const lowerSkill = skill.toLowerCase().trim();
  const lowerResume = resumeText.toLowerCase();

  // Exact substring
  if (lowerResume.includes(lowerSkill)) return true;

  // Synonyms & common tech abbreviations
  const synonyms: Record<string, string[]> = {
    'js': ['javascript', 'ecmascript'],
    'javascript': ['js', 'es6', 'typescript', 'ts'],
    'typescript': ['ts', 'typescript'],
    'react': ['reactjs', 'react.js', 'nextjs', 'next.js'],
    'node': ['nodejs', 'node.js', 'express'],
    'python': ['py', 'python3', 'django', 'fastapi', 'flask'],
    'aws': ['amazon web services', 'ec2', 's3', 'lambda', 'cloudformation'],
    'gcp': ['google cloud platform', 'google cloud', 'bigquery'],
    'azure': ['microsoft azure'],
    'docker': ['containerization', 'containers', 'dockerfile', 'k8s', 'kubernetes'],
    'kubernetes': ['k8s', 'container orchestration'],
    'sql': ['postgresql', 'postgres', 'mysql', 'mssql', 'sqlite', 'relational database'],
    'nosql': ['mongodb', 'cassandra', 'dynamodb', 'redis'],
    'ml': ['machine learning', 'deep learning', 'scikit-learn', 'tensorflow', 'pytorch'],
    'nlp': ['natural language processing', 'llm', 'transformers', 'bert', 'spacy', 'nltk'],
    'ci/cd': ['github actions', 'jenkins', 'gitlab ci', 'continuous integration'],
    'rest': ['restful', 'rest api', 'http api', 'graphql'],
    'graphql': ['apollo', 'graphql api']
  };

  if (synonyms[lowerSkill]) {
    for (const syn of synonyms[lowerSkill]) {
      if (lowerResume.includes(syn)) return true;
    }
  }

  // Word boundary regex
  const escaped = lowerSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(lowerResume);
}

/**
 * Extract contact information and credentials from raw resume text
 */
export function parseResumeDetails(rawText: string, fileName?: string): {
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  education: string;
} {
  // Extract email
  const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i);
  const email = emailMatch ? emailMatch[1] : 'candidate@example.com';

  // Extract phone
  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)(\d{3}[-.\s]?\d{4})/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract candidate name: Look for header line or first non-empty line
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  let name = fileName ? fileName.replace(/\.(pdf|docx|txt|md)$/i, '').replace(/[-_]/g, ' ') : 'Applicant';
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 40 && !firstLine.includes('@') && !firstLine.toLowerCase().includes('resume')) {
      name = firstLine;
    }
  }

  // Extract years of experience heuristic
  let experienceYears = 3;
  const expMatches = rawText.match(/(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?/i);
  if (expMatches && expMatches[1]) {
    experienceYears = parseInt(expMatches[1], 10);
  } else {
    // Count year ranges like "2019 - 2023"
    const yearRanges = rawText.match(/(20\d{2})\s*(?:-|to|–)\s*(20\d{2}|present|current)/gi);
    if (yearRanges && yearRanges.length > 0) {
      experienceYears = Math.min(18, Math.max(1, yearRanges.length * 2));
    }
  }

  // Extract education heuristic
  let education = "Bachelor's Degree";
  const lower = rawText.toLowerCase();
  if (lower.includes('ph.d') || lower.includes('phd') || lower.includes('doctorate')) {
    education = "Ph.D. / Doctorate";
  } else if (lower.includes('master') || lower.includes('m.s.') || lower.includes('mba') || lower.includes('m.tech')) {
    education = "Master's Degree (M.S. / M.Tech / MBA)";
  } else if (lower.includes('bachelor') || lower.includes('b.s.') || lower.includes('b.e.') || lower.includes('b.tech')) {
    education = "Bachelor's Degree (B.S. / B.Tech)";
  } else if (lower.includes('associate') || lower.includes('diploma')) {
    education = "Associate's Degree / Diploma";
  }

  return {
    name,
    email,
    phone,
    experienceYears,
    education
  };
}

/**
 * Automatically parse and extract Job Title, Min Experience, Mandatory Skills, and Bonus Skills from raw JD text
 */
export function extractJobDescriptionFields(rawText: string): {
  title: string;
  department: string;
  minExperienceYears: number;
  educationLevel: string;
  requiredSkills: string[];
  preferredSkills: string[];
  summary: string;
} {
  if (!rawText || !rawText.trim()) {
    return {
      title: '',
      department: '',
      minExperienceYears: 0,
      educationLevel: '',
      requiredSkills: [],
      preferredSkills: [],
      summary: ''
    };
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Extract Title
  let title = '';
  const titleLine = lines.find(l => /^(?:job\s*title|title|role|position|vacancy):\s*(.+)/i.test(l));
  if (titleLine) {
    const match = titleLine.match(/^(?:job\s*title|title|role|position|vacancy):\s*(.+)/i);
    if (match) title = match[1].trim();
  }
  if (!title && lines.length > 0) {
    // If first line is short and doesn't contain common sentences, use it
    const first = lines[0];
    if (first.length < 65 && !first.endsWith('.') && !first.toLowerCase().includes('about us')) {
      title = first.replace(/^#+\s*/, '').trim();
    }
  }
  if (!title) {
    title = 'Open Requisition';
  }

  // 2. Extract Experience (years) directly from given JD
  let minExperienceYears = 0;
  const expPatterns = [
    /(?:min(?:imum)?|at\s+least|requires?)\s*(\d+)(?:\s*[-–to]\s*\d+)?\+?\s*(?:years?|yrs?)/i,
    /(?:experience\s*(?:required|needed)?|work\s+experience|relevant\s+experience)\s*:\s*(\d+)(?:\s*[-–to]\s*\d+)?\+?\s*(?:years?|yrs?)?/i,
    /(\d+)\s*[-–to]\s*(\d+)\s*(?:years?|yrs?)(?:\s+of)?(?:\s+(?:relevant|work|professional)?\s*experience)?/i,
    /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+(?:relevant|work|professional|industry)?\s*experience)/i,
    /(\d+)\+?\s*(?:years?|yrs?)/i
  ];
  for (const pat of expPatterns) {
    const match = rawText.match(pat);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 30) {
        minExperienceYears = parsed;
        break;
      }
    }
  }

  // 3. Extract Education
  let educationLevel = "Bachelor's Degree in related field";
  const lowerText = rawText.toLowerCase();
  if (lowerText.includes('master') || lowerText.includes('m.s.') || lowerText.includes('m.tech')) {
    educationLevel = "Master's Degree (M.S. / M.Tech / MBA)";
  } else if (lowerText.includes('ph.d') || lowerText.includes('phd') || lowerText.includes('doctorate')) {
    educationLevel = "Ph.D. / Doctorate in related field";
  } else if (lowerText.includes('bachelor') || lowerText.includes('b.s.') || lowerText.includes('b.tech') || lowerText.includes('b.e.')) {
    educationLevel = "Bachelor's Degree in Computer Science or related field";
  }

  // 4. Skills Catalog for rapid keyword extraction
  const skillCatalog = [
    // Languages
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'HTML', 'CSS', 'SQL',
    // Frameworks & Libraries
    'React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Vue', 'Angular', 'Tailwind CSS',
    // Databases
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB', 'SQLite', 'Elasticsearch',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Git', 'GitHub', 'GitLab', 'Linux', 'Ansible', 'Jenkins',
    // AI / ML / Data
    'Machine Learning', 'Deep Learning', 'NLP', 'PyTorch', 'TensorFlow', 'scikit-learn', 'Pandas', 'NumPy', 'Generative AI', 'LLM', 'Gemini API', 'LangChain',
    // Architecture & Concepts
    'REST APIs', 'GraphQL', 'Microservices', 'Agile', 'System Design'
  ];

  // Divide into required vs preferred text sections if explicit headers exist
  let requiredSectionText = rawText;
  let preferredSectionText = '';

  const preferredHeaderIndex = rawText.search(/(?:preferred|bonus|nice to have|plus|desired qualifications|good to have):/i);
  if (preferredHeaderIndex !== -1) {
    requiredSectionText = rawText.slice(0, preferredHeaderIndex);
    preferredSectionText = rawText.slice(preferredHeaderIndex);
  }

  const detectedRequired: string[] = [];
  const detectedPreferred: string[] = [];

  for (const skill of skillCatalog) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');

    if (preferredSectionText && regex.test(preferredSectionText)) {
      detectedPreferred.push(skill);
    } else if (regex.test(requiredSectionText)) {
      detectedRequired.push(skill);
    }
  }

  // If no preferred section was found, take first 6-7 as required and rest as preferred
  let finalRequired = detectedRequired;
  let finalPreferred = detectedPreferred;

  if (detectedPreferred.length === 0 && detectedRequired.length > 5) {
    finalRequired = detectedRequired.slice(0, 6);
    finalPreferred = detectedRequired.slice(6, 10);
  }

  // Summary
  const summary = lines.slice(1, 3).join(' ').slice(0, 220) || `Role for ${title} requiring ${minExperienceYears}+ years experience.`;

  return {
    title,
    department: 'Engineering',
    minExperienceYears,
    educationLevel,
    requiredSkills: finalRequired,
    preferredSkills: finalPreferred,
    summary
  };
}

