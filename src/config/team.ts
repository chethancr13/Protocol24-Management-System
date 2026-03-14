export type UserRole = 'admin' | 'logistics' | 'tech' | 'finance' | 'registration';

export interface UserAccount {
  password: string;
  role: UserRole;
  name: string;
  color: string;
}

export const TEAM_ACCOUNTS: Record<string, UserAccount> = {
  "admin":        { password: "admin123",    role: "admin",      name: "Event Head",        color: "#a855f7" }, // purple
  "logistics":    { password: "log123",      role: "logistics",  name: "Logistics Lead",    color: "#14b8a6" }, // teal
  "tech":         { password: "tech123",     role: "tech",       name: "Tech Lead",         color: "#3b82f6" }, // blue
  "finance":      { password: "finance123",  role: "finance",    name: "Finance Head",      color: "#22c55e" }, // green
  "registration": { password: "reg123",      role: "registration", name: "Reg Coordinator", color: "#f43f5e" }  // coral
};

export const MODULE_PERMISSIONS: Record<UserRole, string[]> = {
  admin:        ['dashboard', 'participants', 'teams', 'submissions', 'seating', 'check-in', 'expenses', 'logistics', 'volunteers'],
  logistics:    ['dashboard', 'seating', 'check-in', 'logistics', 'volunteers'],
  tech:         ['dashboard', 'submissions'],
  finance:      ['dashboard', 'expenses'],
  registration: ['dashboard', 'teams', 'check-in', 'volunteers']
};

export const canEdit = (role: UserRole, module: string): boolean => {
  if (role === 'admin') return true;
  return MODULE_PERMISSIONS[role]?.includes(module) || false;
};
