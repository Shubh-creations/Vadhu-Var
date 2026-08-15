/**
 * 100-Point Weighted Match Scoring & Sorting Engine
 * Compares viewer's saved partner_preferences against candidate profiles
 */

export const calculateDetailedMatchScore = (myProfile, targetProfile, partnerPreferences = null) => {
  if (!targetProfile) {
    return {
      totalScore: 80,
      breakdown: [],
      matchTier: 'Good Match'
    };
  }

  const breakdown = [];
  let totalScore = 0;

  // If viewer has no partner_preferences, compute baseline neutral score
  const pref = partnerPreferences || {
    age_min: 21,
    age_max: 35,
    height_min_cm: 150,
    height_max_cm: 190,
    accepted_marital_statuses: ['never_married', 'divorced', 'widowed', 'awaiting_divorce'],
    diet: 'any',
    min_income_lpa: 'all',
    state: 'any',
    city: '',
    education: 'any'
  };

  // -------------------------------------------------------------
  // 1. Marital Status Acceptance (25 Points)
  // -------------------------------------------------------------
  const maxMaritalPts = 25;
  const targetMarital = targetProfile.marital_status || 'never_married';
  const acceptedStatuses = pref.accepted_marital_statuses || ['never_married', 'divorced', 'widowed', 'awaiting_divorce'];
  const maritalAccepted = acceptedStatuses.includes(targetMarital);

  const maritalFormatted = targetMarital === 'awaiting_divorce'
    ? 'Awaiting Divorce'
    : targetMarital.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (maritalAccepted) {
    totalScore += maxMaritalPts;
    breakdown.push({
      factor: 'Marital Status',
      points: maxMaritalPts,
      maxPoints: maxMaritalPts,
      matched: true,
      reason: `${maritalFormatted} is in your accepted preferences`
    });
  } else {
    breakdown.push({
      factor: 'Marital Status',
      points: 0,
      maxPoints: maxMaritalPts,
      matched: false,
      reason: `${maritalFormatted} is not in your accepted list`
    });
  }

  // -------------------------------------------------------------
  // 2. Age Fit (20 Points)
  // -------------------------------------------------------------
  const maxAgePts = 20;
  const targetAge = Number(targetProfile.age) || 25;
  const minAge = Number(pref.age_min) || 18;
  const maxAge = Number(pref.age_max) || 60;

  if (targetAge >= minAge && targetAge <= maxAge) {
    totalScore += maxAgePts;
    breakdown.push({
      factor: 'Age Fit',
      points: maxAgePts,
      maxPoints: maxAgePts,
      matched: true,
      reason: `${targetAge} yrs (within preferred ${minAge}–${maxAge} yrs)`
    });
  } else {
    const diff = targetAge < minAge ? (minAge - targetAge) : (targetAge - maxAge);
    const agePenalty = diff * 2;
    const earnedAgePts = Math.max(0, maxAgePts - agePenalty);
    totalScore += earnedAgePts;
    breakdown.push({
      factor: 'Age Fit',
      points: earnedAgePts,
      maxPoints: maxAgePts,
      matched: earnedAgePts > 10,
      reason: `${targetAge} yrs (${diff} yr${diff > 1 ? 's' : ''} outside preferred ${minAge}–${maxAge} yrs)`
    });
  }

  // -------------------------------------------------------------
  // 3. Income Fit (15 Points)
  // -------------------------------------------------------------
  const maxIncomePts = 15;
  const targetIncome = Number(targetProfile.annual_income_lpa) || 0;
  const prefMinIncomeStr = pref.min_income_lpa || 'all';

  if (prefMinIncomeStr === 'all' || !prefMinIncomeStr) {
    totalScore += maxIncomePts;
    breakdown.push({
      factor: 'Income Fit',
      points: maxIncomePts,
      maxPoints: maxIncomePts,
      matched: true,
      reason: targetIncome > 0 ? `${targetIncome} LPA (No minimum income required)` : 'No minimum income required'
    });
  } else {
    const prefMinIncome = Number(prefMinIncomeStr) || 0;
    if (targetIncome >= prefMinIncome) {
      totalScore += maxIncomePts;
      breakdown.push({
        factor: 'Income Fit',
        points: maxIncomePts,
        maxPoints: maxIncomePts,
        matched: true,
        reason: `${targetIncome} LPA (meets preferred min ${prefMinIncome} LPA)`
      });
    } else {
      breakdown.push({
        factor: 'Income Fit',
        points: 0,
        maxPoints: maxIncomePts,
        matched: false,
        reason: targetIncome > 0 ? `${targetIncome} LPA (below preferred min ${prefMinIncome} LPA)` : 'Income details not specified'
      });
    }
  }

  // -------------------------------------------------------------
  // 4. Height Fit (10 Points)
  // -------------------------------------------------------------
  const maxHeightPts = 10;
  const targetHeight = Number(targetProfile.height_cm) || 165;
  const minHeight = Number(pref.height_min_cm) || 0;
  const maxHeight = Number(pref.height_max_cm) || 220;

  if (minHeight === 0 || (targetHeight >= minHeight && targetHeight <= maxHeight)) {
    totalScore += maxHeightPts;
    breakdown.push({
      factor: 'Height Range',
      points: maxHeightPts,
      maxPoints: maxHeightPts,
      matched: true,
      reason: `${targetHeight} cm ${minHeight > 0 ? `(within ${minHeight}–${maxHeight} cm)` : '(No height constraint)'}`
    });
  } else {
    const diff = targetHeight < minHeight ? (minHeight - targetHeight) : (targetHeight - maxHeight);
    const earnedHeightPts = Math.max(0, maxHeightPts - diff);
    totalScore += earnedHeightPts;
    breakdown.push({
      factor: 'Height Range',
      points: earnedHeightPts,
      maxPoints: maxHeightPts,
      matched: earnedHeightPts >= 5,
      reason: `${targetHeight} cm (${diff} cm outside preferred ${minHeight}–${maxHeight} cm)`
    });
  }

  // -------------------------------------------------------------
  // 5. Diet Match (10 Points)
  // -------------------------------------------------------------
  const maxDietPts = 10;
  const targetDiet = (targetProfile.diet || 'veg').toLowerCase();
  const prefDiet = (pref.diet || 'any').toLowerCase();

  if (prefDiet === 'any' || !prefDiet || targetDiet === prefDiet) {
    totalScore += maxDietPts;
    breakdown.push({
      factor: 'Diet Preference',
      points: maxDietPts,
      maxPoints: maxDietPts,
      matched: true,
      reason: prefDiet === 'any' ? `${targetDiet} (Open to any diet)` : `${targetDiet} diet match`
    });
  } else {
    breakdown.push({
      factor: 'Diet Preference',
      points: 0,
      maxPoints: maxDietPts,
      matched: false,
      reason: `${targetDiet} (preferred ${prefDiet})`
    });
  }

  // -------------------------------------------------------------
  // 6. Location Match (10 Points)
  // -------------------------------------------------------------
  const maxLocationPts = 10;
  const targetCity = (targetProfile.city || '').toLowerCase();
  const targetState = (targetProfile.state || '').toLowerCase();
  const prefCity = (pref.city || '').toLowerCase().trim();
  const prefState = (pref.state || 'any').toLowerCase().trim();

  let locationMatched = false;
  let locationReason = '';

  if (!prefCity && (prefState === 'any' || !prefState)) {
    locationMatched = true;
    locationReason = targetCity ? `${targetProfile.city}, ${targetProfile.state || 'India'} (No location constraint)` : 'Any location accepted';
  } else if (prefCity && targetCity.includes(prefCity)) {
    locationMatched = true;
    locationReason = `City match: ${targetProfile.city}`;
  } else if (prefState !== 'any' && targetState && targetState.includes(prefState)) {
    locationMatched = true;
    locationReason = `State match: ${targetProfile.state || targetProfile.city}`;
  } else if (!prefCity && prefState === 'any') {
    locationMatched = true;
    locationReason = 'Location accepted';
  } else {
    locationMatched = false;
    locationReason = `${targetProfile.city || 'Other location'} (preferred ${pref.city || pref.state})`;
  }

  if (locationMatched) {
    totalScore += maxLocationPts;
    breakdown.push({
      factor: 'Location',
      points: maxLocationPts,
      maxPoints: maxLocationPts,
      matched: true,
      reason: locationReason
    });
  } else {
    breakdown.push({
      factor: 'Location',
      points: 0,
      maxPoints: maxLocationPts,
      matched: false,
      reason: locationReason
    });
  }

  // -------------------------------------------------------------
  // 7. Education Match (10 Points)
  // -------------------------------------------------------------
  const maxEduPts = 10;
  const targetEdu = (targetProfile.education_level || '').toLowerCase();
  const prefEdu = (pref.education || 'any').toLowerCase().trim();

  if (prefEdu === 'any' || !prefEdu || !targetEdu || targetEdu.includes(prefEdu) || prefEdu.includes(targetEdu)) {
    totalScore += maxEduPts;
    breakdown.push({
      factor: 'Education Level',
      points: maxEduPts,
      maxPoints: maxEduPts,
      matched: true,
      reason: prefEdu === 'any' ? (targetProfile.education_level || 'Open to all education') : `Matching qualification: ${targetProfile.education_level}`
    });
  } else {
    breakdown.push({
      factor: 'Education Level',
      points: 0,
      maxPoints: maxEduPts,
      matched: false,
      reason: `${targetProfile.education_level || 'Not specified'} (preferred ${pref.education})`
    });
  }

  // Final score clamping (0 to 100)
  const finalScore = Math.min(Math.max(Math.round(totalScore), 0), 100);

  let matchTier = 'Good Match';
  if (finalScore >= 90) matchTier = 'Exceptional Match';
  else if (finalScore >= 75) matchTier = 'High Match';
  else if (finalScore >= 60) matchTier = 'Moderate Match';
  else matchTier = 'Partial Match';

  return {
    totalScore: finalScore,
    breakdown,
    matchTier
  };
};

/**
 * Quick compatibility score helper for simple consumers
 */
export const calculateCompatibilityEstimate = (myProfile, targetProfile, partnerPreferences = null) => {
  const result = calculateDetailedMatchScore(myProfile, targetProfile, partnerPreferences);
  return result.totalScore;
};

export default calculateCompatibilityEstimate;
