/** Minimal list for type selection; can be replaced by API later */
export interface InterviewTypeOption {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: number;
  questions: number;
}

export const INTERVIEW_TYPE_OPTIONS: InterviewTypeOption[] = [
  { id: 'technical', title: 'Technical', category: 'Technical', difficulty: 'Medium', duration: 45, questions: 5 },
  { id: 'hr', title: 'HR', category: 'HR', difficulty: 'Medium', duration: 30, questions: 4 },
  { id: 'coding', title: 'Coding', category: 'Coding', difficulty: 'Medium', duration: 60, questions: 2 },
  { id: 'case-study', title: 'Case Study', category: 'Case Study', difficulty: 'Medium', duration: 45, questions: 3 },
  { id: 'communication', title: 'Communication', category: 'Communication', difficulty: 'Medium', duration: 25, questions: 4 },
  { id: 'debate', title: 'Debate', category: 'Debate', difficulty: 'Medium', duration: 30, questions: 2 },
  { id: 'role-based', title: 'Role-Based', category: 'Role-Based Interview', difficulty: 'Medium', duration: 45, questions: 5 },
  { id: 'company', title: 'Company', category: 'Company', difficulty: 'Medium', duration: 45, questions: 5 },
  { id: 'subject', title: 'Subject', category: 'Subject', difficulty: 'Medium', duration: 45, questions: 5 },
];
