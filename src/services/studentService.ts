import { nestClient } from '../api/axiosInstance';
import { STUDENT_ENDPOINTS, CLASS_ENDPOINTS, DASHBOARD_ENDPOINTS } from '../constants/apiEndpoints';
import type { ClassItem, AssignmentItem } from '../types/student';

export async function getStudentClasses(): Promise<ClassItem[]> {
  const res = await nestClient.get(STUDENT_ENDPOINTS.CLASSES);
  const data = res.data as { results?: ClassItem[] } | ClassItem[];
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function joinClass(joinCode: string): Promise<unknown> {
  const res = await nestClient.post(STUDENT_ENDPOINTS.JOIN_CLASS, { join_code: joinCode });
  return res.data;
}

export async function getClassDetail(classId: string): Promise<ClassItem> {
  const res = await nestClient.get(CLASS_ENDPOINTS.DETAIL(classId));
  return res.data as ClassItem;
}

export async function getAssignmentsByClass(classId: string): Promise<AssignmentItem[]> {
  const res = await nestClient.get(CLASS_ENDPOINTS.ASSIGNMENTS_BY_CLASS(classId));
  const data = res.data as { results?: AssignmentItem[] } | AssignmentItem[];
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function getTimeSlotsByClass(classId: string): Promise<unknown[]> {
  const res = await nestClient.get(CLASS_ENDPOINTS.TIME_SLOTS(classId));
  const data = res.data as { results?: unknown[] } | unknown[];
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function getLatestStats(): Promise<unknown[]> {
  const res = await nestClient.get(DASHBOARD_ENDPOINTS.LATEST_STATS);
  return Array.isArray(res.data) ? res.data : [];
}
