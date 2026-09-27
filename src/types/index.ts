export type Contact = {
  id: string;
  name: string;
  phone: string;
  relation: string;
  primary: boolean;
  alerts: boolean;
  location: boolean;
  avatar?: string;
};

export type Report = {
  id: string;
  category: string;
  description: string;
  severity: string;
};

export type User = {
  name: string;
  phone: string;
  gender: 'female' | 'male' | 'non-binary' | 'other';
  avatar: string;
  email?: string;
  onboarded: boolean;
};

export type Emergency = {
  active: boolean;
  trigger: 'sos' | 'discreet';
};
