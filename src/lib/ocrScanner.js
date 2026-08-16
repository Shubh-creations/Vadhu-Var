import { createWorker } from 'tesseract.js';

/**
 * Normalizes strings for fuzzy comparison
 */
function cleanString(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, ' ').trim();
}

/**
 * Computes token similarity between user entered name and detected OCR text
 */
function computeNameMatch(fullName, rawText) {
  if (!fullName || !rawText) return { match: false, confidence: 0 };

  const cleanTarget = cleanString(fullName);
  const cleanOCR = cleanString(rawText);

  // Direct substring inclusion
  if (cleanOCR.includes(cleanTarget)) {
    return { match: true, confidence: 98 };
  }

  const nameParts = cleanTarget.split(' ').filter(p => p.length >= 2);
  if (nameParts.length === 0) return { match: false, confidence: 0 };

  let matchedParts = 0;
  for (const part of nameParts) {
    if (cleanOCR.includes(part)) {
      matchedParts++;
    }
  }

  const ratio = matchedParts / nameParts.length;
  const confidence = Math.round(ratio * 95);

  return {
    match: ratio >= 0.5,
    confidence: confidence
  };
}

/**
 * Detects government ID type from text keywords
 */
function detectDocumentType(rawText) {
  const text = rawText.toUpperCase();

  if (
    text.includes('AADHAAR') || 
    text.includes('UIDAI') || 
    text.includes('UNIQUE IDENTIFICATION') || 
    text.includes('MERA AADHAAR') ||
    text.includes('GOVERNMENT OF INDIA') && text.includes('DOB')
  ) {
    return { type: 'Aadhaar Card', confidence: 95 };
  }

  if (
    text.includes('INCOME TAX DEPARTMENT') || 
    text.includes('PERMANENT ACCOUNT NUMBER') || 
    text.includes('PAN CARD') || 
    text.includes('INCOME TAX')
  ) {
    return { type: 'PAN Card', confidence: 95 };
  }

  if (
    text.includes('ELECTION COMMISSION') || 
    text.includes('ELECTORAL') || 
    text.includes('EPIC') || 
    text.includes('VOTER')
  ) {
    return { type: 'Voter ID Card', confidence: 90 };
  }

  if (
    text.includes('DRIVING LICENCE') || 
    text.includes('DRIVING LICENSE') || 
    text.includes('TRANSPORT DEPARTMENT') || 
    text.includes('UNION OF INDIA') && text.includes('DL')
  ) {
    return { type: 'Driving License', confidence: 90 };
  }

  if (
    text.includes('PASSPORT') || 
    text.includes('REPUBLIC OF INDIA')
  ) {
    return { type: 'Passport', confidence: 95 };
  }

  if (text.includes('GOVERNMENT') || text.includes('INDIA') || text.includes('MAHARASHTRA')) {
    return { type: 'Government Photo ID', confidence: 75 };
  }

  return { type: 'Official Document', confidence: 60 };
}

/**
 * Extracts Year of Birth and matches against candidate age
 */
function detectBirthYearAndAgeMatch(rawText, userAge) {
  if (!rawText) return { detectedYear: null, isAgeMatch: true };

  // Match 4-digit years between 1950 and 2010
  const yearMatches = rawText.match(/\b(19\d{2}|200\d|2010)\b/g);
  if (!yearMatches || yearMatches.length === 0) {
    return { detectedYear: null, isAgeMatch: true };
  }

  const currentYear = new Date().getFullYear();
  let bestYear = null;

  if (userAge) {
    const expectedYear = currentYear - Number(userAge);
    // Find closest year to expected birth year
    for (const yr of yearMatches) {
      const numYr = parseInt(yr, 10);
      if (Math.abs(numYr - expectedYear) <= 2) {
        bestYear = numYr;
        break;
      }
    }
  }

  if (!bestYear && yearMatches.length > 0) {
    bestYear = parseInt(yearMatches[0], 10);
  }

  const calculatedAge = bestYear ? currentYear - bestYear : null;
  const isMatch = userAge && calculatedAge ? Math.abs(calculatedAge - Number(userAge)) <= 2 : true;

  return {
    detectedYear: bestYear,
    calculatedAge,
    isAgeMatch: isMatch
  };
}

/**
 * Main OCR Analyzer for uploaded Government ID documents
 * @param {File|Blob|string} imageSource File object or base64/URL
 * @param {Object} candidateInfo { fullName, age, gender }
 */
export async function performOcrPreCheck(imageSource, candidateInfo = {}) {
  let worker = null;
  try {
    worker = await createWorker('eng');
    const ret = await worker.recognize(imageSource);
    const rawText = ret.data.text || '';
    const ocrConfidence = Math.round(ret.data.confidence || 0);

    const docTypeInfo = detectDocumentType(rawText);
    const nameMatch = computeNameMatch(candidateInfo.fullName, rawText);
    const ageInfo = detectBirthYearAndAgeMatch(rawText, candidateInfo.age);

    const isHighTrust = docTypeInfo.confidence >= 80 && (nameMatch.confidence >= 50 || nameMatch.match);

    const result = {
      success: true,
      rawTextSummary: rawText.slice(0, 200).replace(/\s+/g, ' '),
      docType: docTypeInfo.type,
      docConfidence: docTypeInfo.confidence,
      nameMatchConfidence: nameMatch.confidence,
      isNameMatch: nameMatch.match,
      detectedYear: ageInfo.detectedYear,
      isAgeMatch: ageInfo.isAgeMatch,
      ocrConfidence: ocrConfidence,
      status: isHighTrust ? 'verified_match' : 'review_recommended',
      summary: `${docTypeInfo.type} detected • ${nameMatch.confidence}% Name Match`
    };

    return result;
  } catch (err) {
    console.warn('[OCR Pre-Check Notice]:', err);
    // Non-blocking fallback if OCR fails on low-end hardware
    return {
      success: false,
      docType: 'Government Document',
      docConfidence: 70,
      nameMatchConfidence: 80,
      isNameMatch: true,
      status: 'pending_human_review',
      summary: 'Government Document Attached (Ready for Admin Review)'
    };
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        // silent
      }
    }
  }
}
