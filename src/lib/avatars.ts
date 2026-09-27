export interface AvatarOption {
  id: string;
  label: string;
  gender: 'female' | 'male' | 'non-binary' | 'other';
  emoji: string;
  bg: string;
  badgeColor: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  // Female Options
  { id: 'f1', label: 'Priya (Glasses)', gender: 'female', emoji: '👩‍🏫', bg: 'linear-gradient(135deg, #F472B6, #DB2777)', badgeColor: '#EC4899' },
  { id: 'f2', label: 'Ananya (Natural)', gender: 'female', emoji: '👩', bg: 'linear-gradient(135deg, #34D399, #059669)', badgeColor: '#10B981' },
  { id: 'f3', label: 'Zara (Dupatta/Scarf)', gender: 'female', emoji: '🧕', bg: 'linear-gradient(135deg, #818CF8, #4F46E5)', badgeColor: '#6366F1' },
  { id: 'f4', label: 'Ritu (Wavy Hair)', gender: 'female', emoji: '👩‍🦱', bg: 'linear-gradient(135deg, #FBBF24, #D97706)', badgeColor: '#F59E0B' },
  { id: 'f5', label: 'Meera (Professional)', gender: 'female', emoji: '👩‍💼', bg: 'linear-gradient(135deg, #60A5FA, #2563EB)', badgeColor: '#3B82F6' },
  { id: 'f6', label: 'Pooja (Student)', gender: 'female', emoji: '👩‍🎓', bg: 'linear-gradient(135deg, #C084FC, #7E22CE)', badgeColor: '#9333EA' },
  { id: 'f7', label: 'Dr. Sunita', gender: 'female', emoji: '👩‍⚕️', bg: 'linear-gradient(135deg, #38BDF8, #0284C7)', badgeColor: '#0EA5E9' },
  { id: 'f8', label: 'Sneha (Tech)', gender: 'female', emoji: '👩‍💻', bg: 'linear-gradient(135deg, #FB7185, #E11D48)', badgeColor: '#F43F5E' },
  { id: 'f9', label: 'Neha (Active)', gender: 'female', emoji: '🏃‍♀️', bg: 'linear-gradient(135deg, #4ADE80, #15803D)', badgeColor: '#22C55E' },
  { id: 'f10', label: 'Kavya (Artist)', gender: 'female', emoji: '👩‍🎨', bg: 'linear-gradient(135deg, #F43F5E, #BE123C)', badgeColor: '#E11D48' },

  // Male Options
  { id: 'm1', label: 'Aarav (Modern)', gender: 'male', emoji: '👨', bg: 'linear-gradient(135deg, #60A5FA, #1D4ED8)', badgeColor: '#2563EB' },
  { id: 'm2', label: 'Kabir (Beard)', gender: 'male', emoji: '🧔', bg: 'linear-gradient(135deg, #F59E0B, #B45309)', badgeColor: '#D97706' },
  { id: 'm3', label: 'Rohan (Curly Hair)', gender: 'male', emoji: '👨‍🦱', bg: 'linear-gradient(135deg, #34D399, #047857)', badgeColor: '#059669' },
  { id: 'm4', label: 'Dev (Glasses)', gender: 'male', emoji: '👨‍🏫', bg: 'linear-gradient(135deg, #A78BFA, #6D28D9)', badgeColor: '#7C3AED' },
  { id: 'm5', label: 'Arjun (Professional)', gender: 'male', emoji: '👨‍💼', bg: 'linear-gradient(135deg, #38BDF8, #0284C7)', badgeColor: '#0EA5E9' },
  { id: 'm6', label: 'Rahul (Student)', gender: 'male', emoji: '👨‍🎓', bg: 'linear-gradient(135deg, #818CF8, #4338CA)', badgeColor: '#4F46E5' },
  { id: 'm7', label: 'Dr. Vikram', gender: 'male', emoji: '👨‍⚕️', bg: 'linear-gradient(135deg, #2DD4BF, #0F766E)', badgeColor: '#14B8A6' },
  { id: 'm8', label: 'Aditya (Tech)', gender: 'male', emoji: '👨‍💻', bg: 'linear-gradient(135deg, #F472B6, #BE185D)', badgeColor: '#DB2777' },
  { id: 'm9', label: 'Kunal (Athlete)', gender: 'male', emoji: '🏃‍♂️', bg: 'linear-gradient(135deg, #FB923C, #C2410C)', badgeColor: '#EA580C' },
  { id: 'm10', label: 'Sameer (Cap)', gender: 'male', emoji: '🧢', bg: 'linear-gradient(135deg, #64748B, #334155)', badgeColor: '#475569' },

  // Non-Binary / Other Options
  { id: 'nb1', label: 'Alex (Neutral)', gender: 'non-binary', emoji: '🧑', bg: 'linear-gradient(135deg, #F43F5E, #9333EA)', badgeColor: '#A855F7' },
  { id: 'nb2', label: 'Sam (Curly)', gender: 'non-binary', emoji: '🧑‍🦱', bg: 'linear-gradient(135deg, #2DD4BF, #0D9488)', badgeColor: '#14B8A6' },
  { id: 'nb3', label: 'Jordan (Tech)', gender: 'non-binary', emoji: '🧑‍💻', bg: 'linear-gradient(135deg, #38BDF8, #6366F1)', badgeColor: '#818CF8' },
  { id: 'o1', label: 'Guardian Star', gender: 'other', emoji: '⭐', bg: 'linear-gradient(135deg, #FACC15, #E11D48)', badgeColor: '#F43F5E' },
  { id: 'o2', label: 'Safety Shield', gender: 'other', emoji: '🛡️', bg: 'linear-gradient(135deg, #22C55E, #15803D)', badgeColor: '#16A34A' },
  { id: 'o3', label: 'Lotus Peace', gender: 'other', emoji: '🪷', bg: 'linear-gradient(135deg, #F472B6, #EC4899)', badgeColor: '#DB2777' },
  { id: 'o4', label: 'Golden Sun', gender: 'other', emoji: '☀️', bg: 'linear-gradient(135deg, #FBBF24, #D97706)', badgeColor: '#F59E0B' },
];

export function getAvatarById(id: string): AvatarOption {
  return AVATAR_OPTIONS.find(a => a.id === id) || AVATAR_OPTIONS[0];
}
