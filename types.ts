
export enum View {
  DASHBOARD = 'DASHBOARD',
  PARENT_SURVEY_DASHBOARD = 'PARENT_SURVEY_DASHBOARD',
  PARENT_SURVEY_EDITOR = 'PARENT_SURVEY_EDITOR',
  STUDENT_SURVEY_DASHBOARD = 'STUDENT_SURVEY_DASHBOARD',
  STUDENT_SURVEY_EDITOR = 'STUDENT_SURVEY_EDITOR',
  PARENT_COUNSELING_DASHBOARD = 'PARENT_COUNSELING_DASHBOARD',
  PARENT_COUNSELING_EDITOR = 'PARENT_COUNSELING_EDITOR',
  PARENT_COUNSELING_VIEW = 'PARENT_COUNSELING_VIEW',
  PARENT_COUNSELING_REQUEST_EDITOR = 'PARENT_COUNSELING_REQUEST_EDITOR',
  STUDENT_COUNSELING_DASHBOARD = 'STUDENT_COUNSELING_DASHBOARD',
  STUDENT_COUNSELING_EDITOR = 'STUDENT_COUNSELING_EDITOR',
  STUDENT_COUNSELING_VIEW = 'STUDENT_COUNSELING_VIEW',
  TEACHER_OBSERVATION_DASHBOARD = 'TEACHER_OBSERVATION_DASHBOARD',
  TEACHER_OBSERVATION_EDITOR = 'TEACHER_OBSERVATION_EDITOR',
  TEACHER_OBSERVATION_VIEW = 'TEACHER_OBSERVATION_VIEW',
  SEARCH_RESULTS = 'SEARCH_RESULTS',
  PEER_RELATIONSHIP_DASHBOARD = 'PEER_RELATIONSHIP_DASHBOARD',
  PEER_RELATIONSHIP_EDITOR = 'PEER_RELATIONSHIP_EDITOR',
  PEER_RELATIONSHIP_RESULTS = 'PEER_RELATIONSHIP_RESULTS',
  STUDENT_REFLECTION_DASHBOARD = 'STUDENT_REFLECTION_DASHBOARD',
  STUDENT_REFLECTION_EDITOR = 'STUDENT_REFLECTION_EDITOR',
  STUDENT_REFLECTION_VIEW = 'STUDENT_REFLECTION_VIEW',
  TEACHER_COMMUNITY_DASHBOARD = 'TEACHER_COMMUNITY_DASHBOARD',
  TEACHER_COMMUNITY_EDITOR = 'TEACHER_COMMUNITY_EDITOR',
  TEACHER_COMMUNITY_POST = 'TEACHER_COMMUNITY_POST',
  PARENT_CONSENT_MANAGEMENT = 'PARENT_CONSENT_MANAGEMENT',
}

export enum DataSourceType {
  ParentSurvey = '학부모 기초조사서',
  StudentSurvey = '학생 기초조사서',
  ParentCounseling = '학부모 상담 기록',
  StudentCounseling = '학생 상담 기록',
  TeacherObservation = '교사 관찰 기록',
  SchoolViolenceSurvey = '학교폭력 설문',
  RestorativeReflection = '회복적 성찰문',
  PeerRelationshipSurvey = '교우 관계 설문',
  ParentCounselingRequest = '학부모 상담 신청',
  StudentReflection = '학생 성찰 기록',
  AIReport = 'AI 분석 리포트',
  AIScenario = 'AI 상담 시나리오',
}

export enum DataStatus {
  Submitted = '제출',
  NotSubmitted = '미제출',
}

export interface DataSource {
  id: number;
  type: DataSourceType;
  status: DataStatus;
  content: string;
}

export interface Student {
  id: number;
  number: number;
  name: string;
  avatar: string;
  dataSources: DataSource[];
}

export interface SearchResult {
    student: Student;
    dataSource: DataSource;
    snippet: string;
}

export interface SurveyQuestion {
    id: string;
    text: string;
    isDefault: boolean;
    type?: 'text' | 'choice';
    options?: string[];
    askReason?: boolean;
}

export interface MenuItem {
  title: string;
  description: string;
  view: View;
  icon: string;
}

export interface User {
  id: string;
  password?: string;
  name: string;
  school: string;
  grade: string;
  classNum: string;
  students: Student[];
  menuItems: MenuItem[];
  hasCompletedTutorial?: boolean;
}

export interface CommunityPost {
  id: number;
  category: '생활지도' | '학생 상담' | '학부모 상담';
  title: string;
  author: string;
  date: string;
  content: string;
  tags: string[];
}