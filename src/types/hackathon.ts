export type HackathonTrack = 'Web' | 'AI/ML' | 'Blockchain' | 'Open Innovation';
export type CheckInStatus = 'Not Checked-In' | 'Checked-In' | 'Checked-Out';
export type ProjectStatus = 'Submitted' | 'Under Review' | 'Judged';
export type SeatStatus = 'Empty' | 'Occupied' | 'Reserved';
export type ExpenseStatus = 'Pending' | 'Paid' | 'Cancelled';
export type LogisticsStatus = 'Ordered' | 'In Transit' | 'Delivered' | 'Distributed';

export interface Participant {
  id: string;
  name: string;
  email: string;
  college: string;
  skill: string;
  track: HackathonTrack;
  checkInStatus: CheckInStatus;
  teamName: string | null;
}

export interface Team {
  id: string;
  name: string;
  members: string[]; // participant IDs
  checkInStatus?: CheckInStatus;
  checkInTime?: string;
  seatAssigned?: string | null; // e.g., 'Table 1 - Seat A'
}

export interface ProjectSubmission {
  id: string;
  teamId: string;
  teamName: string;
  projectTitle: string;
  techStack: string[];
  submissionTime: string;
  githubLink: string;
  status: ProjectStatus;
  evaluationScore?: number; // 0-100 score
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
}

export interface LogisticsItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  location: string;
  status: LogisticsStatus;
}

export interface SeatingTable {
  id: string;
  tableNumber: number;
  seatCount: number;
}

export interface SeatingLocation {
  id: string;
  name: string;
  layoutType?: 'grid' | 'theater-2-row' | 'theater-3-row';
  tables: SeatingTable[];
}

export interface Volunteer {
  id: string;
  name: string;
  role: string;
  assignedRoom: string;
  status: 'Active' | 'On Break' | 'Off Duty';
}
