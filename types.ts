export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  CRITICAL = 'CRITICAL'
}

export enum ApprovalStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEW_PENDING = 'REVIEW_PENDING',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED'
}

export enum PayoutApprovalStatus {
  DRAFT = 'DRAFT',
  REQUESTED = 'REQUESTED',
  APPROVED_BY_FOUNDER = 'APPROVED_BY_FOUNDER',
  REJECTED = 'REJECTED'
}

export enum ProjectStage {
  STRATEGY = 'Phase 1: Strategy',
  VENDOR_CREATIVE = 'Phase 2: Vendor/Creative',
  GUEST_MGMT = 'Phase 3: Guest Management',
  CONTENT = 'Phase 4: Content',
  LOGISTICS = 'Phase 5: Logistics',
  TECH_REHEARSAL = 'Phase 6: Tech Rehearsal',
  REMINDERS = 'Phase 7: Reminders',
  EVENT_DAY = 'Phase 8: Event Day',
  POST_EVENT = 'Phase 9: Post Event'
}

export enum BudgetCategory {
  VENUE_ACCOMODATION = 'Venue & Accomodation',
  AV_TECH = 'AV, Stage & Tech',
  MARKETING_PR = 'Marketing, PR & Teasers',
  TALENT_ARTISTS = 'Cine/TV Artists & Talent',
  CATERING = 'Catering & F&B',
  SECURITY_LOGISTICS = 'Security & Logistics',
  ADMIN_MISC = 'Admin & Misc'
}

export enum EventRole {
  FOUNDER = 'Founder (Anba)',
  BUSINESS_HEAD = 'Business Head (Raji)',
  CREATIVE_LEAD = 'Creatives (Hari)',
  INVITATION_MGMT = 'Invitations/Journalists (Muzzamil)',
  ENTERTAINMENT_SECURITY = 'Security/Ent/Troupe (Raman)',
  FLOOR_MANAGER = 'Floor Manager (Gazzali)',
  CONSOLE = 'Console (Karthick)',
  MEDIA = 'Media (Parthiban/Fida)',
  FINANCE = 'Finance (Petrichor)'
}

export interface MediaClip {
  id: string;
  source: string;
  link: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  date: string;
  type: 'PRINT' | 'TV' | 'DIGITAL';
}

export interface SecurityZone {
  id: string;
  name: string;
  clearanceLevel: 'ALL' | 'VVIP' | 'STAFF' | 'CREW';
  manager: string;
  status: 'SECURE' | 'BREACH' | 'PENDING';
}

export interface FileReference {
  id: string;
  name: string;
  type: 'EXCEL' | 'PDF' | 'IMAGE' | 'VIDEO' | 'DOC';
  url: string;
  uploadedAt: string;
  version: string;
  isApproved?: boolean;
}

export interface Task {
  id: string;
  parentId?: string;
  dependencies?: string[];
  title: string;
  description: string;
  assigneeNotes?: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  approvalStatus: ApprovalStatus;
  stage: ProjectStage;
  assignee: EventRole;
  reviewer: EventRole;
  approver: EventRole;
  gatekeeper: string;
  backupPlan: string;
  escalationMatrix: string;
  progress: number;
  vendorId?: string;
  files: FileReference[];
  lastUpdated?: string;
}

export interface NegotiationLog {
  id: string;
  date: string;
  points: string;
  outcome: string;
  status: 'BATTLE' | 'CLOSED' | 'FAILED';
}

export interface Vendor {
  id: string;
  name: string;
  service: string;
  contact: string;
  email: string;
  location: string;
  negotiationStatus: 'BATTLE' | 'CLOSED' | 'FAILED';
  negotiationLogs: NegotiationLog[];
  alternateVendor?: string;
  backupReason?: string;
  gstNumber?: string;
  panNumber?: string;
}

export interface BudgetLineItem {
  id: string;
  header: BudgetCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  allocated: number;
  spent: number;
  gstPercent: number;
  advancePaid: number;
  vendorName: string;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  payoutApproval: PayoutApprovalStatus;
}

export interface Contact {
  id: string;
  category: 'Politician' | 'Journalist' | 'PRO' | 'Vendor' | 'Artist';
  name: string;
  designation: string;
  phone: string;
  email?: string;
  paName?: string;
  paPhone?: string;
  status: 'Invited' | 'Confirmed' | 'Declined' | 'Pending';
}

export interface RunSheetEntry {
  id: string;
  time: string;
  activity: string;
  owner: EventRole;
  audioVisualCue: string;
  lightingCue: string;
  status: 'PENDING' | 'LIVE' | 'DONE' | 'DELAYED';
  delayMinutes: number;
}