export interface ClassItem {
  id: number;
  name: string;
  code?: string;
  join_code?: string;
  is_student?: boolean;
  [key: string]: unknown;
}

export interface TeacherDashboardStats {
  total_classes?: number;
  total_students?: number;
  total_assignments?: number;
  [key: string]: unknown;
}

export interface StudentBatchItem {
  id: number;
  email?: string;
  name?: string;
  [key: string]: unknown;
}
