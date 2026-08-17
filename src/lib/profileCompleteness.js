/**
 * Utility to calculate profile completeness score and missing items
 */
export function calculateProfileCompleteness(profile) {
  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      filledCount: 0,
      totalCount: 6,
      missingItems: [
        { id: 'photo', label: 'Upload Profile Photo', weight: 20 },
        { id: 'basic', label: 'Full Name & Age', weight: 15 },
        { id: 'location', label: 'City & State Location', weight: 15 },
        { id: 'career', label: 'Career & Education Details', weight: 20 },
        { id: 'bio', label: 'Personal About Me / Bio', weight: 15 },
        { id: 'verification', label: 'Government ID Verification', weight: 15 }
      ]
    };
  }

  const items = [
    {
      id: 'photo',
      label: 'Upload Real Profile Photo',
      weight: 20,
      isComplete: Boolean(profile.photo_url && !profile.photo_url.includes('unsplash') && profile.photo_url.trim().length > 0)
    },
    {
      id: 'basic',
      label: 'Full Name & Age',
      weight: 15,
      isComplete: Boolean(profile.full_name && profile.full_name !== 'Deleted User' && profile.age)
    },
    {
      id: 'location',
      label: 'City & State Location',
      weight: 15,
      isComplete: Boolean(profile.city && profile.state)
    },
    {
      id: 'career',
      label: 'Career & Education Details',
      weight: 20,
      isComplete: Boolean(profile.occupation && profile.education_level)
    },
    {
      id: 'bio',
      label: 'Personal About Me / Bio',
      weight: 15,
      isComplete: Boolean(profile.bio && profile.bio.trim().length >= 10)
    },
    {
      id: 'verification',
      label: 'Government ID Document',
      weight: 15,
      isComplete: Boolean(profile.is_id_verified || profile.is_fully_verified)
    }
  ];

  let score = 0;
  const missingItems = [];
  let filledCount = 0;

  for (const item of items) {
    if (item.isComplete) {
      score += item.weight;
      filledCount++;
    } else {
      missingItems.push(item);
    }
  }

  const percentage = Math.min(100, Math.max(0, score));

  return {
    percentage,
    isComplete: percentage >= 90,
    filledCount,
    totalCount: items.length,
    missingItems
  };
}

export default calculateProfileCompleteness;
