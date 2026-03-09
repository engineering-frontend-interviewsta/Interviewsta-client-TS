export interface ClassItem {
  id: number;
  name: string;
  code?: string;
  join_code?: string;
  is_student?: boolean;
  [key: string]: unknown;
}

export interface AssignmentItem {
  id: number;
  title?: string;
  class_assigned?: number;
  due_date?: string;
  [key: string]: unknown;
}

export interface TimeSlotItem {
  id: number;
  class_obj?: number;
  status?: string;
  start_time?: string;
  end_time?: string;
  [key: string]: unknown;
}
