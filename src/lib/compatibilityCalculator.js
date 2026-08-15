/**
 * Rule-Based Match Compatibility Calculator
 * Evaluates filter overlap (accepted marital status, age range, income, diet, city, family type)
 */
export const calculateCompatibilityEstimate = (myProfile, targetProfile, partnerPreferences = null) => {
  if (!targetProfile) return 85;

  let score = 50; // Base baseline score

  // 1. Accepted Marital Status Match (+25% boost or -20% penalty)
  if (partnerPreferences?.accepted_marital_statuses && targetProfile.marital_status) {
    const isAccepted = partnerPreferences.accepted_marital_statuses.includes(targetProfile.marital_status);
    if (isAccepted) {
      score += 25;
    } else {
      score -= 20;
    }
  } else {
    score += 15;
  }

  // 2. Preferred Age Range (+15%)
  if (partnerPreferences?.age_min && partnerPreferences?.age_max && targetProfile.age) {
    if (targetProfile.age >= partnerPreferences.age_min && targetProfile.age <= partnerPreferences.age_max) {
      score += 15;
    }
  } else if (myProfile?.age && targetProfile.age) {
    const ageDiff = Math.abs(myProfile.age - targetProfile.age);
    if (ageDiff <= 4) score += 15;
    else if (ageDiff <= 7) score += 8;
  }

  // 3. Location / City Match (+15%)
  if (targetProfile.city) {
    if (partnerPreferences?.city && partnerPreferences.city !== 'any' && partnerPreferences.city.trim()) {
      if (targetProfile.city.toLowerCase().includes(partnerPreferences.city.toLowerCase())) {
        score += 15;
      }
    } else if (myProfile?.city && myProfile.city.toLowerCase() === targetProfile.city.toLowerCase()) {
      score += 15;
    } else {
      score += 5;
    }
  }

  // 4. Diet Preference Match (+10%)
  if (partnerPreferences?.diet && partnerPreferences.diet !== 'any') {
    if (partnerPreferences.diet === targetProfile.diet) {
      score += 10;
    }
  } else if (myProfile?.diet && myProfile.diet === targetProfile.diet) {
    score += 10;
  }

  // 5. Verification Status Boost (+5%)
  if (targetProfile.is_id_verified || targetProfile.is_fully_verified) {
    score += 5;
  }

  return Math.min(Math.max(score, 45), 98);
};

export default calculateCompatibilityEstimate;
