export type HackathonTrack = 'Web' | 'AI/ML' | 'Blockchain' | 'Open Innovation';
export type CheckInStatus = 'Not Checked-In' | 'Checked-In' | 'Checked-Out';

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
}
