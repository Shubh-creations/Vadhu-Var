/**
 * Profile Completeness Calculation Engine
 * Analyzes candidate profile and partner preferences to compute completeness percentage
 * and generate actionable improvement suggestions with point weights.
 */

export const calculateProfileCompleteness = (profile, partnerPreferences = null) => {
  if (!profile) {
    return {
      percentage: 0,
      completedItems: [],
      missingItems: [
        { key: 'basic', label: 'Complete basic candidate details', weight: 20 },
        { key: 'photo', label: 'Upload your profile photo', weight: 20 },
        { key: 'bio', label: 'Add an introduction bio', weight: 10 },
        { key: 'career', label: 'Add education and occupation', weight: 15 },
        { key: 'id_doc', label: 'Upload Government ID proof', weight: 15 },
        { key: 'partner_pref', label: 'Define partner expectations', weight: 10 },
        { key: 'family_career_proof', label: 'Add family details or career certificate', weight: 10 }
      ]
    };
  }

  const completed = [];
  const missing = [];
  let score = 0;

  // 1. Basic Info (20 pts)
  if (profile.full_name && profile.age && profile.city && profile.gender) {
    score += 20;
    completed.push({ key: 'basic', label: 'Basic profile info complete', weight: 20 });
  } else {
    missing.push({ key: 'basic', label: 'Fill in your full name, age, gender & city', weight: 20 });
  }

  // 2. Profile Photo (20 pts)
  if (profile.photo_url && profile.photo_url.length > 5) {
    score += 20;
    completed.push({ key: 'photo', label: 'Profile photo uploaded', weight: 20 });
  } else {
    missing.push({ key: 'photo', label: 'Upload a clear profile photo (+20%)', weight: 20 });
  }

  // 3. Bio / About Me (10 pts)
  if (profile.bio && profile.bio.trim().length >= 10) {
    score += 10;
    completed.push({ key: 'bio', label: 'Personal bio added', weight: 10 });
  } else {
    missing.push({ key: 'bio', label: 'Write a short introduction bio (+10%)', weight: 10 });
  }

  // 4. Education & Occupation (15 pts)
  if (profile.education_level && profile.occupation) {
    score += 15;
    completed.push({ key: 'career', label: 'Education & profession added', weight: 15 });
  } else {
    missing.push({ key: 'career', label: 'Add your education & profession (+15%)', weight: 15 });
  }

  // 5. Government ID Proof (15 pts)
  if (profile.id_document_url || profile.is_id_verified) {
    score += 15;
    completed.push({ key: 'id_doc', label: 'Government ID submitted for verification', weight: 15 });
  } else {
    missing.push({ key: 'id_doc', label: 'Upload Government ID for trust badge (+15%)', weight: 15 });
  }

  // 6. Partner Preferences (10 pts)
  const hasCustomPrefs = partnerPreferences && (
    partnerPreferences.city || 
    partnerPreferences.state !== 'any' || 
    partnerPreferences.diet !== 'any' || 
    (partnerPreferences.accepted_marital_statuses && partnerPreferences.accepted_marital_statuses.length > 0)
  );
  if (hasCustomPrefs) {
    score += 10;
    completed.push({ key: 'partner_pref', label: 'Partner preferences configured', weight: 10 });
  } else {
    missing.push({ key: 'partner_pref', label: 'Configure partner preferences & age filters (+10%)', weight: 10 });
  }

  // 7. Family / Cultural details or Career Proof (10 pts)
  const hasExtra = (profile.caste || profile.family_type || profile.career_proof_url || profile.family_consent_document_url);
  if (hasExtra) {
    score += 10;
    completed.push({ key: 'family_career_proof', label: 'Family background or career proof added', weight: 10 });
  } else {
    missing.push({ key: 'family_career_proof', label: 'Add family details or career certificate (+10%)', weight: 10 });
  }

  return {
    percentage: Math.min(100, score),
    completedItems: completed,
    missingItems: missing
  };
};

export default calculateProfileCompleteness;
