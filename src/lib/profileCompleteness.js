/**
 * Utility to calculate profile completeness score and missing items
 */
export function calculateProfileCompleteness(profile) {
  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      filledCount: 0,
      totalCount: 9,
      missingItems: [
        { id: 'photo', label: 'Upload Primary Photo', weight: 15 },
        { id: 'photo_2', label: 'Upload 2nd Showcase Photo', weight: 10 },
        { id: 'basic', label: 'Full Name, Age & Gender', weight: 10 },
        { id: 'location', label: 'City & State Residence', weight: 10 },
        { id: 'career', label: 'Career & Education Details', weight: 10 },
        { id: 'kundali', label: 'Vedic Kundali (Rashi, Nakshatra, Manglik)', weight: 15 },
        { id: 'family', label: 'Family Heritage (Parents & Native Place)', weight: 15 },
        { id: 'bio', label: 'Personal About Me / Bio', weight: 10 },
        { id: 'verification', label: 'Government ID Verification', weight: 15 }
      ]
    };
  }

  const items = [
    {
      id: 'photo',
      label: 'Upload Primary Photo',
      weight: 15,
      isComplete: Boolean(profile.photo_url && !profile.photo_url.includes('unsplash') && profile.photo_url.trim().length > 0)
    },
    {
      id: 'photo_2',
      label: 'Upload 2nd Showcase Photo',
      weight: 10,
      isComplete: Boolean(profile.photo_url_2 && profile.photo_url_2.trim().length > 0)
    },
    {
      id: 'basic',
      label: 'Full Name, Age & Gender',
      weight: 10,
      isComplete: Boolean(profile.full_name && profile.full_name !== 'Deleted User' && profile.age)
    },
    {
      id: 'location',
      label: 'City & State Residence',
      weight: 10,
      isComplete: Boolean(profile.city && profile.state)
    },
    {
      id: 'career',
      label: 'Career & Education Details',
      weight: 10,
      isComplete: Boolean(profile.occupation && profile.education_level)
    },
    {
      id: 'kundali',
      label: 'Vedic Kundali (Rashi, Nakshatra, Manglik)',
      weight: 15,
      isComplete: Boolean(profile.rashi || profile.nakshatra || profile.manglik)
    },
    {
      id: 'family',
      label: 'Family Heritage (Parents & Native Place)',
      weight: 15,
      isComplete: Boolean(profile.father_occupation || profile.mother_occupation || profile.native_place)
    },
    {
      id: 'bio',
      label: 'Personal About Me / Bio',
      weight: 10,
      isComplete: Boolean(profile.bio && profile.bio.trim().length >= 10)
    },
    {
      id: 'verification',
      label: 'Government ID Document',
      weight: 15,
      isComplete: Boolean(profile.is_id_verified || profile.is_fully_verified || profile.id_document_url)
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
    isComplete: percentage >= 85,
    filledCount,
    totalCount: items.length,
    missingItems
  };
}

export default calculateProfileCompleteness;
