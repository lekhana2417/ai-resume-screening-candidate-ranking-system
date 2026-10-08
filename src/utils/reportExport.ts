import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JobDescription, CandidateAnalysisResult } from '../types';

/**
 * Format CSV string properly escaping quotes and commas
 */
function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generate and download formatted CSV for HR record-keeping
 */
export function exportFormattedCSV(
  jobDescription: JobDescription,
  results: CandidateAnalysisResult[]
): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const timeStr = new Date().toLocaleTimeString();

  // Section 1: Requisition Header
  const csvLines: string[] = [
    '=== HR REQUISITION AUDIT & CANDIDATE EVALUATION REPORT ===',
    `Report Generated Date,${escapeCSV(dateStr + ' ' + timeStr)}`,
    `Job Requisition Title,${escapeCSV(jobDescription.title || 'Target Requisition')}`,
    `Department,${escapeCSV(jobDescription.department || 'Not Specified')}`,
    `Minimum Experience Required,${escapeCSV((jobDescription.minExperienceYears || 0) + ' Years')}`,
    `Education Requirement,${escapeCSV(jobDescription.educationLevel || 'Not Specified')}`,
    `Mandatory Core Skills,${escapeCSV((jobDescription.requiredSkills || []).join('; '))}`,
    `Bonus / Preferred Skills,${escapeCSV((jobDescription.preferredSkills || []).join('; '))}`,
    `Total Evaluated Candidates,${escapeCSV(results.length)}`,
    '', // Empty line separator
    '=== CANDIDATE RANKING MATRIX & EVALUATION SCORES ==='
  ];

  // Section 2: Table Headers
  const headers = [
    'Rank',
    'Candidate Name',
    'Current Role',
    'Experience (Years)',
    'Education',
    'Overall Fit Score (%)',
    'Qualification Tier',
    'Technical Skills Score (%)',
    'Experience Depth Score (%)',
    'NLP Vector Cosine Score (%)',
    'Degree Alignment Score (%)',
    'Pipeline Status',
    'Verified Mandatory Skills',
    'Missing Mandatory Skills',
    'Bonus Competencies',
    'Primary Candidate Strength',
    'Key Requisition Gap',
    'Executive Summary',
    'Recruiter Notes'
  ];
  csvLines.push(headers.map(escapeCSV).join(','));

  // Section 3: Candidate Rows sorted by overall score
  const sorted = [...results].sort((a, b) => b.overallScore - a.overallScore);
  sorted.forEach((cand, idx) => {
    const row = [
      idx + 1,
      cand.candidateName,
      cand.currentRole,
      cand.experienceYears,
      cand.education,
      `${cand.overallScore}%`,
      cand.tier.replace('_', ' '),
      `${cand.skillsScore}%`,
      `${cand.experienceScore}%`,
      `${cand.nlpCosineScore}%`,
      `${cand.educationScore}%`,
      cand.status.replace('_', ' '),
      cand.matchedSkills.join('; '),
      cand.missingRequiredSkills.join('; '),
      cand.bonusSkills.join('; '),
      cand.strengths[0] || 'N/A',
      cand.gaps[0] || 'None detected',
      cand.executiveSummary,
      cand.recruiterNotes || 'None'
    ];
    csvLines.push(row.map(escapeCSV).join(','));
  });

  csvLines.push('');
  csvLines.push('=== COMPLIANCE & SIGN-OFF ===');
  csvLines.push(`Evaluated by ScreenAI Talent Decision Support System,HR Reviewer Signature: ____________________,Date: ____________________`);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvLines.join('\n'));
  const link = document.createElement('a');
  const sanitizedTitle = (jobDescription.title || 'Requisition').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `HR_Evaluation_Report_${sanitizedTitle}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate and download formatted PDF Report for HR record-keeping
 */
export function exportFormattedPDF(
  jobDescription: JobDescription,
  results: CandidateAnalysisResult[],
  options = { includeInterviewQuestions: true, includeStrengthsGaps: true }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const sorted = [...results].sort((a, b) => b.overallScore - a.overallScore);

  // 1. Title Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CANDIDATE SCREENING & EVALUATION REPORT', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Official HR Record • Generated: ${dateStr} • Powered by ScreenAI`, 14, 22);

  // 2. Requisition Summary Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 38, 182, 36, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Target Requisition: ${jobDescription.title || 'Open Position'}`, 18, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Department: ${jobDescription.department || 'General'}`, 18, 52);
  doc.text(`Min. Experience: ${jobDescription.minExperienceYears || 0}+ Years`, 18, 58);
  doc.text(`Education: ${jobDescription.educationLevel || "Bachelor's Degree or equivalent"}`, 18, 64);

  const reqSkillsText = (jobDescription.requiredSkills || []).slice(0, 8).join(', ') || 'Auto-detected';
  doc.text(`Core Required Skills: ${reqSkillsText}`, 18, 70);

  // 3. Evaluation Summary Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Candidate Qualification Matrix (${sorted.length} Resumes Evaluated)`, 14, 82);

  const tableBody = sorted.map((cand, idx) => [
    `#${idx + 1}`,
    cand.candidateName,
    cand.currentRole,
    `${cand.experienceYears}y`,
    `${cand.overallScore}%`,
    cand.tier.replace('_', ' '),
    `${cand.skillsScore}%`,
    `${cand.nlpCosineScore}%`,
    cand.status.replace('_', ' ')
  ]);

  autoTable(doc, {
    startY: 86,
    head: [[
      'Rank',
      'Candidate',
      'Current Role',
      'Exp',
      'Fit Score',
      'Tier',
      'Skills',
      'NLP Sim',
      'Status'
    ]],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 2
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { cellWidth: 34 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
      5: { halign: 'center', cellWidth: 22 },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 14 },
      8: { halign: 'center', cellWidth: 24 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // 4. Candidate Detailed Summaries on subsequent pages or sections
  let currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 170;

  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Detailed Candidate Assessments & Skill Gap Dossiers', 14, currentY);
  currentY += 6;

  sorted.forEach((cand, i) => {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    // Candidate Card Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, currentY, 182, 38, 1.5, 1.5, 'FD');

    // Name & Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${i + 1}. ${cand.candidateName} — ${cand.currentRole}`, 18, currentY + 6);

    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(`Overall Fit: ${cand.overallScore}% (${cand.tier.replace('_', ' ')}) | Status: ${cand.status}`, 18, currentY + 12);

    // Skills line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const matched = cand.matchedSkills.slice(0, 7).join(', ') || 'None';
    const missing = cand.missingRequiredSkills.slice(0, 5).join(', ') || 'None';
    doc.text(`Matched Core Skills: ${matched}`, 18, currentY + 18);
    doc.text(`Missing Requisition Requirements: ${missing}`, 18, currentY + 23);

    // Strengths & Gaps
    const strengthSnippet = cand.strengths[0] || 'Relevant background';
    const gapSnippet = cand.gaps[0] || 'No critical deficiencies';
    doc.text(`Highlight: ${strengthSnippet.slice(0, 95)}`, 18, currentY + 28);
    doc.text(`Key Flag: ${gapSnippet.slice(0, 95)}`, 18, currentY + 33);

    currentY += 42;
  });

  // 5. Final Compliance & Sign-off Box
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY += 4;
  }

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, 182, 26, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('HR RECORD AUDIT & VERIFICATION SIGN-OFF', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('This evaluation record reflects automated NLP keyword matching and AI assessment.', 18, currentY + 12);
  doc.text('Hiring Manager Signature: ___________________________    Date: _______________', 18, currentY + 20);

  // Trigger Save
  const sanitizedTitle = (jobDescription.title || 'Requisition').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`HR_Candidate_Evaluation_Report_${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
