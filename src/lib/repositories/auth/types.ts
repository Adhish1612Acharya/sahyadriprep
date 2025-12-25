export type UserRole = 'student' | 'college_admin' | 'super_admin';

export type CollegeAdminProfileRow = {
  id: string;
  college_id: string;
};

export type CollegeRow = {
  id: string;
  email_domain: string | null;
};
