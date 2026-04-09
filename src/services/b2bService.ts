import { nestClient } from '../api/axiosInstance';
import { B2B_ENDPOINTS } from '../constants/apiEndpoints';

export type OrganizationSummary = {
  organizationId: string;
  name: string;
  code: string;
};

export type TeacherClass = {
  classId: string;
  name: string;
  code: string;
  description: string;
  studentCount?: number;
};

export type OrgDashboardResponse = {
  organization: OrganizationSummary;
  totals: {
    teachers: number;
    classes: number;
    students: number;
    averageScore: number;
  };
  teachers: Array<{
    teacherUserId: string;
    name: string;
    email: string;
    classCount: number;
    studentCount: number;
    avgScore: number;
  }>;
  classes: Array<{
    classId: string;
    name: string;
    code: string;
    teacherUserId: string;
    teacherName: string;
    studentCount: number;
    avgScore: number;
  }>;
};

export async function createOrganization(name: string, code?: string) {
  return nestClient.post<OrganizationSummary>(B2B_ENDPOINTS.CREATE_ORG, { name, code });
}

export async function getOrgSetupStatus() {
  return nestClient.get<{ hasOrganization: boolean; organization?: OrganizationSummary }>(
    B2B_ENDPOINTS.ORG_SETUP_STATUS,
  );
}

export async function teacherJoinOrganization(orgCode: string) {
  return nestClient.post<OrganizationSummary>(B2B_ENDPOINTS.TEACHER_JOIN_ORG, { orgCode });
}

export async function getTeacherOrganization() {
  return nestClient.get<OrganizationSummary>(B2B_ENDPOINTS.TEACHER_ORG);
}

export async function createTeacherClass(name: string, description = '') {
  return nestClient.post<TeacherClass>(B2B_ENDPOINTS.TEACHER_CLASSES, { name, description });
}

export async function getTeacherClasses() {
  return nestClient.get<TeacherClass[]>(B2B_ENDPOINTS.TEACHER_CLASSES);
}

export async function getTeacherClassDetail(classId: string) {
  return nestClient.get(B2B_ENDPOINTS.TEACHER_CLASS_DETAIL(classId));
}

export type TeacherClassAnalyticsResponse = {
  class: { classId: string; name: string; code: string };
  totals: { students: number; sessions: number; averageScore: number };
  byType: Record<string, { totalSessions: number; averageScore: number }>;
  trend: Array<{ weekStart: string; averageScore: number; totalSessions: number }>;
  rankings: Array<{
    rank: number;
    studentUserId: string;
    name: string;
    email: string;
    averageScore: number;
    totalSessions: number;
  }>;
};

export async function getTeacherClassAnalytics(classId: string) {
  return nestClient.get<TeacherClassAnalyticsResponse>(B2B_ENDPOINTS.TEACHER_CLASS_ANALYTICS(classId));
}

export type TeacherClassAnnouncement = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
};

export async function getTeacherClassAnnouncements(classId: string) {
  return nestClient.get<TeacherClassAnnouncement[]>(B2B_ENDPOINTS.TEACHER_CLASS_ANNOUNCEMENTS(classId));
}

export async function createTeacherClassAnnouncement(
  classId: string,
  payload: { title: string; body?: string; isPinned?: boolean },
) {
  return nestClient.post<TeacherClassAnnouncement>(B2B_ENDPOINTS.TEACHER_CLASS_ANNOUNCEMENTS(classId), payload);
}

export async function deleteTeacherClassAnnouncement(classId: string, announcementId: string) {
  return nestClient.post<{ ok: true }>(B2B_ENDPOINTS.TEACHER_CLASS_ANNOUNCEMENT_DELETE(classId, announcementId), {});
}

export type TeacherClassAssignment = {
  id: string;
  title: string;
  description: string;
  dueAt: string | null;
  createdAt: string;
};

export async function getTeacherClassAssignments(classId: string) {
  return nestClient.get<TeacherClassAssignment[]>(B2B_ENDPOINTS.TEACHER_CLASS_ASSIGNMENTS(classId));
}

export async function createTeacherClassAssignment(
  classId: string,
  payload: { title: string; description?: string; dueAt?: string | null },
) {
  return nestClient.post<TeacherClassAssignment>(B2B_ENDPOINTS.TEACHER_CLASS_ASSIGNMENTS(classId), payload);
}

export async function deleteTeacherClassAssignment(classId: string, assignmentId: string) {
  return nestClient.post<{ ok: true }>(B2B_ENDPOINTS.TEACHER_CLASS_ASSIGNMENT_DELETE(classId, assignmentId), {});
}

export async function getTeacherStudentDetail(studentUserId: string) {
  return nestClient.get(B2B_ENDPOINTS.TEACHER_STUDENT_DETAIL(studentUserId));
}

export type TeacherStudentAnalyticsResponse = {
  student: { studentUserId: string; name: string; email: string };
  classes: Array<{ classId: string; name: string; code: string }>;
  totals: { sessions: number; averageScore: number };
  byType: Record<string, { totalSessions: number; averageScore: number }>;
  trend: Array<{ weekStart: string; averageScore: number; totalSessions: number }>;
  sleeveAverages: Record<string, number>;
  recentSessions: Array<{
    feedbackId: string;
    overallScore: number;
    savedAt: string;
    interviewTitle: string;
    parentType: string;
    sleeveScores: Record<string, number>;
  }>;
};

export async function getTeacherStudentAnalytics(studentUserId: string) {
  return nestClient.get<TeacherStudentAnalyticsResponse>(B2B_ENDPOINTS.TEACHER_STUDENT_ANALYTICS(studentUserId));
}

export async function studentJoinClass(classCode: string) {
  return nestClient.post<TeacherClass>(B2B_ENDPOINTS.STUDENT_JOIN_CLASS, { classCode });
}

export async function getStudentClasses() {
  return nestClient.get<TeacherClass[]>(B2B_ENDPOINTS.STUDENT_CLASSES);
}

export async function getOrgDashboard() {
  return nestClient.get<OrgDashboardResponse>(B2B_ENDPOINTS.ORG_DASHBOARD);
}

export async function getOrgTeacherDetail(teacherUserId: string) {
  return nestClient.get(B2B_ENDPOINTS.ORG_TEACHER_DETAIL(teacherUserId));
}

export async function getOrgClassDetail(classId: string) {
  return nestClient.get(B2B_ENDPOINTS.ORG_CLASS_DETAIL(classId));
}

export async function getOrgStudentDetail(studentUserId: string) {
  return nestClient.get(B2B_ENDPOINTS.ORG_STUDENT_DETAIL(studentUserId));
}
