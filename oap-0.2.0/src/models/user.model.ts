export type UserRole = "Student" | "Teacher" | "Admin";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
};
