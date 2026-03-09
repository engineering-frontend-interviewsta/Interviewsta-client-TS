import { djangoClient } from '../api/axiosInstance';
import { TEACHER_ENDPOINTS, CLASS_ENDPOINTS } from '../constants/apiEndpoints';
import type { TeacherDashboardStats, StudentBatchItem } from '../types/teacher';
import type { ClassItem } from '../types/student';

export async function getTeacherDashboardStats(): Promise<TeacherDashboardStats> {
  const res = await djangoClient.get(TEACHER_ENDPOINTS.DASHBOARD_STATS);
  return (res.data ?? {}) as TeacherDashboardStats;
}

export async function getTeacherClasses(): Promise<ClassItem[]> {
  const res = await djangoClient.get(CLASS_ENDPOINTS.LIST);
  const data = res.data as { results?: ClassItem[] } | ClassItem[];
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function getClassPerformance(classId: string): Promise<unknown> {
  const res = await djangoClient.get(TEACHER_ENDPOINTS.CLASS_PERFORMANCE(classId));
  return res.data;
}

export async function getStudentsBatch(): Promise<StudentBatchItem[]> {
  const res = await djangoClient.get(TEACHER_ENDPOINTS.STUDENTS_BATCH);
  const data = res.data as { results?: StudentBatchItem[] } | StudentBatchItem[];
  return Array.isArray(data) ? data : (data?.results ?? []);
}
