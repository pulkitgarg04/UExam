export interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}