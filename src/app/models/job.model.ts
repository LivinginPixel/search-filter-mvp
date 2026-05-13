export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  jobType: 'Remote' | 'Hybrid' | 'On Site';
  experienceLevel: 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
  companyType: 'Startup' | 'Scale-up' | 'Corporate' | 'Agency';
  salary: string;
  logo: string;
  badge: 'hot' | 'new' | null;
  tags: string[];
  // Detail panel content
  description: string;
  responsibilities: string[];
  recruiterName: string;
  recruiterRole: string;
  postedAgo: string;
  companyDescription: string;
  companyMeta: {
    type: string;
    size: string;
    location: string;
    schedule: string;
  };
}
