/** Parent interview type (tab) from /interview-test/parent-types/ */
export interface ParentInterviewType {
  id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
}

/** Nested parent in an interview test */
export interface InterviewTestParent {
  id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
}

/** Single interview test from INTERVIEW_TESTS or BY_PARENT_TYPE */
export interface InterviewTest {
  id: string;
  title: string;
  description: string;
  topics: string[];
  company: string | null;
  subject: string | null;
  subjects: string[];
  difficulty: string;
  questions: number | null;
  duration: number;
  credits: number;
  isActive: boolean;
  parent: InterviewTestParent;
}

/** Paginated response for interview tests */
export interface InterviewTestsPaginatedResponse {
  data: InterviewTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
