export interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  skills: string[] | null;
  city: string | null;
  expected_salary: string | null;
  preferred_job_type: string | null;
  search_mode: 'local' | 'global' | null; // New field
  created_at?: string;
}

export interface Message {
  id: string;
  profile_id?: string;
  sender: 'user' | 'bot';
  type: 'text' | 'audio' | 'job-card';
  content: string;
  timestamp: Date;
  jobData?: Job;
  options?: string[]; // New field for Yes/No buttons
}

export type AgentType = 'SUPERVISOR' | 'PROFILE_MANAGER' | 'JOB_MATCHER';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
