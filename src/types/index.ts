export type UserRole = "student" | "admin" | "superadmin";
export type Gender = "male" | "female";
export type StudentLevel = "100" | "200" | "300" | "400" | "500";
export type ApplicationStatus = "PENDING" | "ALLOCATED" | "NOT_ALLOCATED";

export interface IUser {
  _id: string;
  matricNumber?: string;
  fullName: string;
  email: string;
  passwordHash: string;
  gender?: Gender;
  level?: StudentLevel;
  role: UserRole;
  specialNeeds?: boolean;
  createdAt: Date;
}

export interface IHostel {
  _id: string;
  name: string;
  gender: Gender;
  totalRooms: number;
  createdAt: Date;
}

export interface IRoom {
  _id: string;
  hostelId: string; // reference to IHostel
  roomNumber: string;
  floor: number; // 0 = ground floor
  capacity: number;
  availableBeds: number;
  block: string;
}

export interface IApplication {
  _id: string;
  studentId: string; // reference to IUser
  semester: string;
  status: ApplicationStatus;
  roomId: string | null; // reference to IRoom
  submittedAt: Date;
  allocatedAt: Date | null;
  notes?: string;
}

export interface ISemester {
  _id: string;
  label: string;
  isOpen: boolean;
  openedAt: Date;
  closedAt: Date | null;
}
