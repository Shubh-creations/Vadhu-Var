/**
 * Rule-Based Match Compatibility Calculator
 * Evaluates filter overlap (city, education, diet, family type)
 */
export const calculateCompatibilityEstimate = (myProfile, targetProfile) => {
  if (!myProfile || !targetProfile) return 88; // Default estimate

  let score = 50; // Base score

  // 1. Location / City Match (+20%)
  if (myProfile.city && targetProfile.city) {
    if (myProfile.city.toLowerCase() === targetProfile.city.toLowerCase()) {
      score += 20;
    } else {
      score += 10;
    }
  }

  // 2. Diet Preference Match (+15%)
  if (myProfile.diet && targetProfile.diet) {
    if (myProfile.diet === targetProfile.diet) {
      score += 15;
    }
  }

  // 3. Family Type Match (+15%)
  if (myProfile.family_type && targetProfile.family_type) {
    if (myProfile.family_type === targetProfile.family_type) {
      score += 15;
    }
  }

  // 4. Education Alignment (+10%)
  if (myProfile.education_level && targetProfile.education_level) {
    score += 10;
  }

  return Math.min(score, 98);
};

export default calculateCompatibilityEstimate;
