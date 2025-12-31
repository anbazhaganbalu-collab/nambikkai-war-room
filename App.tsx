import React, { useState, useMemo, useEffect } from 'react';
import { 
  Zap, Grid3X3, Play, Wallet, Monitor, ArrowRight, Plus, List, Users,
  ShieldAlert, Sparkles, FileCheck, Info, Search, QrCode, CloudRain, 
  UserCheck, MapPin, Download, DollarSign, Trash2, ClipboardList, TrendingUp,
  ChevronRight, Activity, Music, Database, Layers, ShieldCheck, Newspaper,
  Camera, Lock, Clock, AlertTriangle, FileText, BarChart3, MessageSquare, Handshake, BookOpen, Layers2
} from 'lucide-react';
import { GanttChart } from './components/GanttChart';
import { TaskForm } from './components/TaskForm';
import { BudgetTab } from './components/BudgetTab';
import { ContactDirectory } from './components/ContactDirectory';
import { 
  Task, TaskStatus, ApprovalStatus, ProjectStage, 
  BudgetCategory, BudgetLineItem, EventRole, PayoutApprovalStatus, Contact, 
  RunSheetEntry, Vendor, SecurityZone, MediaClip, NegotiationLog
} from './types';
import { addDays, format, differenceInDays, isAfter, subDays } from 'date-fns';
import { getProjectInsights } from './services/geminiService';

type MainView = 'WAR_ROOM' | 'MASTER_PLAN' | 'TIMELINE' | 'BUDGET' | 'CONTACTS' | 'VENDORS' | 'ITERATIONS' | 'EVENT_DAY' | 'INSTRUCTIONS';

const BACKUP_KEY = 'nambikkai_ultra_matrix_feb16';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetLineItem[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [runSheet, setRunSheet] = useState<RunSheetEntry[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [activeView, setActiveView] = useState<MainView>('WAR_ROOM');
  const [aiInsights, setAiInsights] = useState<string>("Initializing Nambikkai Intelligence Matrix...");
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [pendingParentId, setPendingParentId] = useState<string | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(BACKUP_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.tasks?.length >= 130) {
          setTasks(p.tasks); setBudgetItems(p.budgetItems); setContacts(p.contacts);
          setRunSheet(p.runSheet); setVendors(p.vendors);
          return;
        }
      } catch(e) {}
    }

    // --- GENERATING 135 GRANULAR TASKS FROM CHECKLIST ---
    const allTasks: Task[] = [];
    const targetDate = new Date('2026-02-16');
    const baseDate = subDays(targetDate, 45); // Start 45 days before

    const phases = [
      { id: 'm1', title: 'Phase 1: Strategy & Legal (15 January Kickoff)', count: 15, stage: ProjectStage.STRATEGY, role: EventRole.FOUNDER, tasks: [
        'Budget Band Confirmation (Cap ₹15L)', 'Stakeholder Financial Approval', 'Hyatt Regency Ballroom Blocking', 'Contract Review for Venue', 'Token Payment (~20%)', 'Petrichor GST/PAN Verification', 'Event Format Definition', 'Press Meet Narrative Mapping', 'Product Demo Flow Chart', 'Panel Discussion Objectives', 'Core Messaging Finalization', '3-5 Key Talking Points', 'Chief Guest Identification', 'Chief Guest RSVP Confirmation', 'Panel Participant Selection'
      ]},
      { id: 'm2', title: 'Phase 2: Vendor & Creative Lock', count: 20, stage: ProjectStage.VENDOR_CREATIVE, role: EventRole.BUSINESS_HEAD, tasks: [
        'AV Vendor Hire (LED/Projector)', 'Mic & Sound Array Selection', 'Tech Crew Deployment Plan', 'Photographer Hire (2 Slots)', 'Videographer Hire (4K Coverage)', 'Emcee Bilingual Selection', 'Independent PRO Hiring', 'Digital PR Agency Outreach', 'Stage Décor Concept Art', 'Backdrop Design Approval', 'Standee Graphics Printing', 'Launch Film Script v1', 'Graphics Rendering for Launch', 'Launch Film Audio Mix', 'Digital Invite Design', 'Printed Invite Prototype', 'Press Kit Template Draft', 'Event Graphic Guidelines', 'Badge Design v1', 'Creative Sign-off'
      ]},
      { id: 'm3', title: 'Phase 3: Diplomatic & VVIP Outreach', count: 25, stage: ProjectStage.GUEST_MGMT, role: EventRole.INVITATION_MGMT, tasks: [
        'Guest List Master Spreadsheet', 'Media Outreach DB (60 Pax)', 'Influencer Tier List (20 Pax)', 'PR Agency Liaison List', 'VIP Guest Protocol Mapping', 'Influencer Costing Strategy', 'Tier-1 Negotiated Fees', 'Tier-2 Barter Relationship', 'Save the Date Email Blast', 'Formal Digital Invites', 'Physical Invite Couriering', 'Invitation Delivery Tracking', 'Media Call List (Chennai Club)', 'TV Channel News Desk Liaison', 'Journalist accreditation', 'Advertiser Prospect List', 'Sponsorship Opportunity Kit', 'RSVP Tracking Hub Setup', 'Daily RSVP Status SITREP', 'VIP Written Confirmation', 'Chief Guest Travel Plan', 'Speaker Logistics Brief', 'Dietary Preference Check', 'Table Seating Protocol', 'Hamper Curation'
      ]},
      { id: 'm4', title: 'Phase 4: Content & Tech Production', count: 18, stage: ProjectStage.CONTENT, role: EventRole.CREATIVE_LEAD, tasks: [
        'Founder Speech Finalization', 'Product Demo Slide Deck', 'Speaker Intro Briefs', 'Emcee Script Finalization', 'Tamil/English Translation QC', 'Minute-by-Minute Run Sheet', 'Cue Point Integration', 'Q&A Protocol Logic', 'Press Release (Pre-Event)', 'Press Release (Launch Day)', 'Live Stream Link Generation', 'Test Broadcast (720p)', 'Social Media Schedule', 'Post-Launch Announcement', 'Thumbnail Design Node', 'Launch Video Final Export', 'Backup Video Drive Config', 'Creative Node Approval'
      ]},
      { id: 'm5', title: 'Phase 5: Logistics & Hyatt Ops', count: 15, stage: ProjectStage.LOGISTICS, role: EventRole.FLOOR_MANAGER, tasks: [
        'Hyatt F&B Menu Lock-in', 'Veg/Non-Veg Mix Audit', 'Seating Chart Layout', 'Press Front Row Mapping', 'Media Desk Location Setup', 'Signage Placement Walkthrough', 'Valet Coordination Plan', 'Registration Kit Assembly', '300 Badges/Lanyards Pack', 'Feedback Card Printing', 'Green Room Refreshments', 'Speaker Briefing Zone', 'Travel Vouchers for Guests', 'Final Vendor Confirmation', 'Signage Proof Verification'
      ]},
      { id: 'm6', title: 'Phase 6: Technical Recce & Sync', count: 12, stage: ProjectStage.TECH_REHEARSAL, role: EventRole.CONSOLE, tasks: [
        'Hyatt Venue Tech Recce', 'LED/Projector Brightness Test', 'Wi-Fi Load Capability Check', 'Demo Link Connectivity Test', 'Offline Backup Verification', 'Live Stream Audio Check', 'Secondary Internet Failover', 'Speaker Stage Rehearsal', 'Mic Technique Briefing', 'AV Content Timing Sync', 'Music Fade In/Out Logic', 'Gimmick Hardware Fire-test'
      ]},
      { id: 'm7', title: 'Phase 7: Final Protocol Pulse', count: 10, stage: ProjectStage.REMINDERS, role: EventRole.INVITATION_MGMT, tasks: [
        'Final RSVP Reminder (WhatsApp)', 'Parking/Map Data Blast', 'Media Byte Slots Assignment', 'Interview Schedule Matrix', 'Registration Desk Briefing', 'On-Ground Role Huddle', 'Emergency Contact List', 'Backup Speaker Standby', 'Escalation Protocol Brief', 'Final Team SITREP'
      ]},
      { id: 'm8', title: 'Phase 8: Launch Execution (Feb 16)', count: 15, stage: ProjectStage.EVENT_DAY, role: EventRole.FLOOR_MANAGER, tasks: [
        'Team Arrival (1:30 PM)', 'Venue Setup Audit', 'AV Final Sound Check', 'Live-Stream Signal Check', 'Speaker Protocol Refresh', 'Registration Open (5:15 PM)', 'Emcee Opening Cue', 'Event Flow Management', 'Demo Interaction Control', 'Media Interview Segment', 'Giveaway Distribution', 'Group Photo Ops', 'Thank You Remarks', 'Venue Pack-up Audit', 'Node Cleanup'
      ]},
      { id: 'm9', title: 'Phase 9: Post-Mission Analytics', count: 8, stage: ProjectStage.POST_EVENT, role: EventRole.FINANCE, tasks: [
        'Post-Event Thank You Blast', 'Highlight Reel Editing', 'Media Clipping Compilation', 'Sentiment Analysis Report', 'Social Media High-Impact Post', 'Lessons Learned Debrief', 'Final Vendor Payment Node', 'Audit Settlement (Petrichor)'
      ]},
    ];

    phases.forEach((p, idx) => {
      const macroStart = addDays(baseDate, idx * 5);
      const macroEnd = idx === 7 ? targetDate : addDays(macroStart, 15);
      
      const macro: Task = {
        id: p.id,
        title: p.title,
        description: `Strategic management of all directives in ${p.title}.`,
        startDate: format(macroStart, 'yyyy-MM-dd'),
        endDate: format(macroEnd, 'yyyy-MM-dd'),
        status: idx < 1 ? TaskStatus.COMPLETED : TaskStatus.TODO,
        approvalStatus: ApprovalStatus.APPROVED,
        stage: p.stage,
        assignee: p.role,
        reviewer: EventRole.FOUNDER,
        approver: EventRole.FOUNDER,
        gatekeeper: 'Management',
        backupPlan: 'Contingency Delta',
        escalationMatrix: 'Anba',
        progress: idx < 1 ? 100 : 0,
        files: [],
        dependencies: idx > 0 ? [phases[idx-1].id] : []
      };
      allTasks.push(macro);

      // Add Granular Checklist Items as Sub-Tasks
      p.tasks.forEach((subTitle, sIdx) => {
        const subStart = addDays(macroStart, sIdx % 5);
        const subEnd = addDays(subStart, 2);
        allTasks.push({
          id: `${p.id}-s${sIdx}`,
          parentId: p.id,
          title: `${subTitle}`,
          description: `Granular checklist directive for ${p.title}. Ensure compliance with Hyatt protocols.`,
          startDate: format(subStart, 'yyyy-MM-dd'),
          endDate: format(subEnd, 'yyyy-MM-dd'),
          status: idx < 1 ? TaskStatus.COMPLETED : TaskStatus.TODO,
          approvalStatus: ApprovalStatus.APPROVED,
          stage: p.stage,
          assignee: p.role,
          reviewer: p.role,
          approver: EventRole.FOUNDER,
          gatekeeper: 'Internal Ops',
          backupPlan: 'Switch to manual workflow',
          escalationMatrix: 'Phase Lead',
          progress: idx < 1 ? 100 : 0,
          files: [],
          dependencies: sIdx > 0 ? [`${p.id}-s${sIdx-1}`] : []
        });
      });
    });

    setTasks(allTasks);

    setVendors([
      { id: 'v1', name: 'Hyatt Regency Chennai', service: 'Venue', contact: 'Karthik', email: 'sales@hyatt.com', location: 'Teynampet', negotiationStatus: 'CLOSED', negotiationLogs: [{ id: 'n1', date: '2025-11-20', points: 'Ballroom booking for 350 pax', outcome: 'Token advance ₹2L paid from Petrichor', status: 'CLOSED' }], gstNumber: '33AAAPH0123A1Z1', panNumber: 'PETRI1234K' },
      { id: 'v2', name: 'Console Tech Chennai', service: 'AV & LED', contact: 'Siva', email: 'ops@consoletech.in', location: 'Anna Nagar', negotiationStatus: 'BATTLE', negotiationLogs: [{ id: 'n1', date: '2025-12-01', points: 'P2.5 LED + Line Array', outcome: 'Initial quote ₹1.8L; Pending battle', status: 'BATTLE' }] }
    ]);

    setBudgetItems([
      { id: 'b1', header: BudgetCategory.CATERING, description: 'Hyatt F&B Allocation (350 pax)', quantity: 350, unitPrice: 2400, allocated: 840000, spent: 0, gstPercent: 18, advancePaid: 200000, vendorName: 'Hyatt Regency Chennai', status: 'PARTIAL', payoutApproval: PayoutApprovalStatus.APPROVED_BY_FOUNDER },
    ]);

    setContacts([
      { id: 'c1', category: 'Politician', name: 'Thiru. Minister', designation: 'Cabinet Minister', phone: '+91 9988776655', paName: 'Rajesh (PA)', paPhone: '+91 9988776656', status: 'Confirmed' },
      { id: 'c2', category: 'Artist', name: 'Cine Star X', designation: 'Actor', phone: '+91 9000123456', paName: 'Mani (Manager)', paPhone: '+91 9000123457', status: 'Invited' }
    ]);

    setRunSheet([
      { id: 'r1', time: '16:30', activity: 'Guest Arrivals & Hyatt Welcome', owner: EventRole.INVITATION_MGMT, audioVisualCue: 'Nambikkai Theme (Acoustic)', lightingCue: 'Warm Golden Wash', status: 'PENDING', delayMinutes: 0 },
      { id: 'r2', time: '17:30', activity: 'Launch Sequence Start', owner: EventRole.FLOOR_MANAGER, audioVisualCue: 'Intro SFX (Surround)', lightingCue: 'Strobe Flash on Stage', status: 'PENDING', delayMinutes: 0 }
    ]);
  }, []);

  // AI Insights Engine
  useEffect(() => {
    if (tasks.length >= 130) {
      getProjectInsights(tasks).then(setAiInsights).catch(() => setAiInsights("Operational risk monitor active."));
    }
  }, [tasks]);

  // Dependency Shifting Engine
  const handleTaskSubmit = (data: Partial<Task>) => {
    let updatedTasks = [...tasks];
    if (editingTask) {
      updatedTasks = tasks.map(t => t.id === editingTask.id ? { ...t, ...data } as Task : t);
    } else {
      updatedTasks = [...tasks, { ...data, id: `T-${Date.now()}` } as Task];
    }

    const shiftDependents = (allTasks: Task[]) => {
      let changed = false;
      const newTasks = allTasks.map(task => {
        if (task.dependencies?.length) {
          const maxDepEnd = Math.max(...task.dependencies.map(id => {
            const d = allTasks.find(t => t.id === id);
            return d ? new Date(d.endDate).getTime() : 0;
          }));
          const depEndFmt = format(new Date(maxDepEnd), 'yyyy-MM-dd');
          if (isAfter(new Date(depEndFmt), new Date(task.startDate))) {
            changed = true;
            const dur = differenceInDays(new Date(task.endDate), new Date(task.startDate));
            const nStart = addDays(new Date(depEndFmt), 1);
            const nEnd = addDays(nStart, dur);
            return { ...task, startDate: format(nStart, 'yyyy-MM-dd'), endDate: format(nEnd, 'yyyy-MM-dd') };
          }
        }
        return task;
      });
      return { newTasks, changed };
    };

    let result = shiftDependents(updatedTasks);
    while(result.changed) result = shiftDependents(result.newTasks);

    setTasks(result.newTasks);
    setShowTaskForm(false);
    setEditingTask(null);
    localStorage.setItem(BACKUP_KEY, JSON.stringify({ tasks: result.newTasks, budgetItems, contacts, runSheet, vendors }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-20 bg-black border-r border-slate-800 flex flex-col items-center py-8 gap-4 shrink-0 z-50 overflow-y-auto custom-scrollbar">
          <NavIcon active={activeView === 'WAR_ROOM'} onClick={() => setActiveView('WAR_ROOM')} icon={Zap} title="War Room" />
          <NavIcon active={activeView === 'MASTER_PLAN'} onClick={() => setActiveView('MASTER_PLAN')} icon={List} title="Master Plan (GANTT)" />
          <NavIcon active={activeView === 'TIMELINE'} onClick={() => setActiveView('TIMELINE')} icon={Grid3X3} title="Deep Nodes" />
          <NavIcon active={activeView === 'BUDGET'} onClick={() => setActiveView('BUDGET')} icon={Wallet} title="Budget Ops" />
          <NavIcon active={activeView === 'CONTACTS'} onClick={() => setActiveView('CONTACTS')} icon={Users} title="Protocol List" />
          <NavIcon active={activeView === 'VENDORS'} onClick={() => setActiveView('VENDORS')} icon={Handshake} title="Negotiation Log" />
          <NavIcon active={activeView === 'ITERATIONS'} onClick={() => setActiveView('ITERATIONS')} icon={Layers2} title="Iteration Gallery" />
          <NavIcon active={activeView === 'EVENT_DAY'} onClick={() => setActiveView('EVENT_DAY')} icon={Play} title="Live Run-Sheet" />
          <NavIcon active={activeView === 'INSTRUCTIONS'} onClick={() => setActiveView('INSTRUCTIONS')} icon={BookOpen} title="Mission Manual" />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-slate-900 border-b border-slate-800 px-8 py-5 flex items-center justify-between z-40 shadow-2xl">
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Nambikkai <span className="text-red-500 italic">Feb 16 Mission</span></h2>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Petrichor HQ | Hyatt Regency Launch Matrix</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Countdown</span>
                  <span className="text-xl font-black text-red-500 italic tracking-tight">{differenceInDays(new Date('2026-02-16'), new Date())} DAYS TO GO</span>
               </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeView === 'WAR_ROOM' && <WarRoomView tasks={tasks} insights={aiInsights} />}
            {activeView === 'MASTER_PLAN' && <div className="p-10 h-full"><GanttChart tasks={tasks} startDate={new Date('2026-01-01')} daysToShow={60} /></div>}
            {activeView === 'TIMELINE' && <TimelineView tasks={tasks} selectedTaskId={selectedTaskId} setSelectedTaskId={setSelectedTaskId} onEdit={(t) => { setEditingTask(t); setShowTaskForm(true); }} onDelete={(id) => setTasks(tasks.filter(t => t.id !== id))} startDate={new Date('2026-01-01')} />}
            {activeView === 'BUDGET' && <BudgetTab items={budgetItems} currentUserRole="FOUNDER" onAdd={(header) => setBudgetItems([...budgetItems, { id: `B-${Date.now()}`, header, description: 'New Allocation', quantity: 1, unitPrice: 0, allocated: 0, spent: 0, gstPercent: 18, advancePaid: 0, vendorName: '', status: 'PENDING', payoutApproval: PayoutApprovalStatus.DRAFT }])} onUpdate={(id, updates) => setBudgetItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))} onDelete={(id) => setBudgetItems(prev => prev.filter(i => i.id !== id))} onDraftPO={() => {}} />}
            {activeView === 'CONTACTS' && <ContactDirectory contacts={contacts} onUpdate={(id, updates) => setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))} onAdd={() => setContacts([...contacts, { id: `C-${Date.now()}`, category: 'Journalist', name: 'New Contact', designation: '', phone: '', status: 'Pending' }])} />}
            {activeView === 'VENDORS' && <VendorLogView vendors={vendors} onUpdate={setVendors} />}
            {activeView === 'ITERATIONS' && <IterationGallery tasks={tasks} />}
            {activeView === 'EVENT_DAY' && <RunSheetView entries={runSheet} onUpdate={setRunSheet} />}
            {activeView === 'INSTRUCTIONS' && <MissionManual />}
          </div>
        </main>
      </div>

      {showTaskForm && <TaskForm initialTask={editingTask || {}} parentId={pendingParentId} allTasks={tasks} vendors={vendors} onSubmit={handleTaskSubmit} onCancel={() => { setShowTaskForm(false); setEditingTask(null); }} />}
    </div>
  );
}

function NavIcon({ active, icon: Icon, onClick, title }: any) {
  return (
    <button onClick={onClick} className={`p-4 rounded-2xl transition-all relative group shrink-0 ${active ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-600 hover:bg-slate-900'}`}>
      <Icon className="w-5 h-5" />
      <span className="absolute left-full ml-4 px-3 py-1.5 bg-black text-white text-[8px] font-black uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-all z-[60] whitespace-nowrap">{title}</span>
    </button>
  );
}

function WarRoomView({ tasks, insights }: any) {
  const macros = tasks.filter((t: any) => !t.parentId);
  return (
    <div className="p-10 space-y-10 animate-in fade-in">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardStat label="Macro Success" val={macros.length} color="text-red-500" icon={Layers} />
          <DashboardStat label="Micro Directives" val={tasks.length - macros.length} color="text-emerald-500" icon={Database} />
          <DashboardStat label="Protocol Nodes" val="135" color="text-white" icon={ShieldCheck} />
          <DashboardStat label="Petrichor Burn" val="₹10.5L" color="text-amber-500" icon={BarChart3} />
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter border-l-4 border-red-600 pl-6">Active Mission Phases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {macros.slice(0, 6).map(task => (
                <div key={task.id} className="bg-slate-900/50 p-8 rounded-[3rem] border border-slate-800 hover:border-red-600 transition-all group shadow-xl">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{task.stage}</p>
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tight leading-none mt-1">{task.title}</h4>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden my-6 border border-slate-800">
                    <div className="h-full bg-red-600 transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${task.progress}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-red-600 uppercase italic">{task.progress}% Operational</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase italic">DEADLINE: {task.endDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-red-950/20 p-10 rounded-[4rem] border border-red-900/30 shadow-2xl overflow-y-auto">
             <h4 className="text-red-500 font-black uppercase text-sm italic tracking-[0.3em] flex items-center gap-4 mb-8"><Sparkles className="w-6 h-6" /> Gemini Protocol Intelligence</h4>
             <div className="space-y-6">
                <div className="bg-black/40 p-6 rounded-3xl border border-red-900/20 leading-relaxed text-slate-300 text-sm italic whitespace-pre-wrap">
                  {insights}
                </div>
                <div className="flex items-center gap-3 p-4 bg-red-600/10 rounded-2xl border border-red-500/20">
                   <Activity className="w-4 h-4 text-red-500" />
                   <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">REAL-TIME RISK MONITOR: ACTIVE</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function VendorLogView({ vendors, onUpdate }: any) {
  const [activeVendor, setActiveVendor] = useState<string | null>(vendors[0]?.id || null);
  return (
    <div className="p-10 h-full flex flex-col">
      <div className="bg-slate-900/50 rounded-[4rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-1">
        <div className="w-80 border-r border-slate-800 bg-black/30 p-8 space-y-4 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 italic">Partner Command</h3>
          {vendors.map((v: any) => (
            <div key={v.id} onClick={() => setActiveVendor(v.id)} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${activeVendor === v.id ? 'bg-red-600/10 border-red-500/50 text-white' : 'bg-slate-800/40 border-transparent text-slate-500 hover:border-slate-700'}`}>
              <p className="font-black text-sm uppercase italic tracking-tighter">{v.name}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-60">{v.service}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {activeVendor ? (
            <div className="space-y-12">
               {vendors.filter((v: any) => v.id === activeVendor).map((v: any) => (
                 <div key={v.id} className="space-y-12">
                    <header className="flex justify-between items-start">
                       <div>
                          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">{v.name}</h2>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{v.contact} | {v.email}</p>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                          <span className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase border-2 ${v.negotiationStatus === 'CLOSED' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-500' : 'bg-amber-600/10 border-amber-500 text-amber-500'}`}>
                            NEGOTIATION {v.negotiationStatus}
                          </span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">GST: {v.gstNumber}</span>
                       </div>
                    </header>
                    <div className="space-y-6">
                       <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] border-l-4 border-red-600 pl-6">Cost Battle History</h4>
                       <div className="grid grid-cols-1 gap-4">
                          {v.negotiationLogs.map((log: any) => (
                            <div key={log.id} className="bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700 flex justify-between items-center group">
                               <div>
                                  <p className="text-[10px] font-black text-red-500 uppercase italic">Directive Round: {log.date}</p>
                                  <p className="text-sm font-medium text-slate-300 italic mt-2">"{log.points}"</p>
                                  <p className="text-[11px] font-black text-emerald-500 uppercase mt-2">Outcome: {log.outcome}</p>
                               </div>
                               <span className="px-3 py-1 bg-slate-700 rounded-lg text-[8px] font-black uppercase">{log.status}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          ) : <div className="h-full flex items-center justify-center text-slate-800 font-black uppercase tracking-widest italic opacity-20">Select Partner node</div>}
        </div>
      </div>
    </div>
  );
}

function IterationGallery({ tasks }: { tasks: Task[] }) {
  const allFiles = tasks.flatMap(t => t.files.map(f => ({ ...f, taskTitle: t.title })));
  return (
    <div className="p-10 space-y-10 animate-in fade-in h-full overflow-y-auto">
       <div className="bg-slate-900/50 p-10 rounded-[4rem] border border-slate-800 shadow-2xl">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-4"><Layers2 className="w-7 h-7 text-red-600" /> Iteration Vault (Assets & Reference Excels)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {allFiles.map(file => (
               <div key={file.id} className="bg-slate-800/50 p-8 rounded-[3rem] border border-slate-700 hover:border-red-600 transition-all flex flex-col justify-between group h-64 shadow-lg">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-black text-red-500 uppercase border border-red-900/30 px-3 py-1 rounded-lg">{file.type}</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">VER: {file.version}</span>
                    </div>
                    <p className="text-sm font-black text-white uppercase italic tracking-tighter leading-tight">{file.name}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-2 italic truncate">Ref: {file.taskTitle}</p>
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    <button className="text-[10px] font-black text-red-500 uppercase hover:underline">Download Asset</button>
                    {file.isApproved && <span className="bg-emerald-600/20 text-emerald-500 text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-emerald-500/30">FINAL APPROVED</span>}
                  </div>
               </div>
             ))}
             {allFiles.length === 0 && <div className="col-span-full py-20 text-center text-slate-800 font-black uppercase italic tracking-widest opacity-20"><Search className="mx-auto w-12 h-12 mb-4" />No assets in matrix store</div>}
          </div>
       </div>
    </div>
  );
}

function MissionManual() {
  return (
    <div className="p-10 animate-in fade-in h-full overflow-y-auto">
      <div className="bg-slate-900/50 p-12 rounded-[5rem] border border-slate-800 shadow-2xl space-y-12">
        <header>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter border-l-8 border-red-600 pl-10">Command Protocol Manual v6.0</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] mt-4 pl-10 italic">Nambikkai Launch Matrix | Feb 16 Executive Directives</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pl-10">
           <div className="space-y-8">
              <h4 className="text-red-500 font-black uppercase tracking-[0.2em] italic text-sm border-b border-red-900/30 pb-2">01. VVIP & Diplomatic Protocol</h4>
              <p className="text-slate-400 text-sm leading-relaxed">All Politicians and Cine Artists must enter via the Hyatt Porte-Cochere Node. Escort directly to Zone B. PA contact details are primary communication nodes. No impromptu press interaction allowed until Nambikkai AV concludes.</p>
              
              <h4 className="text-red-500 font-black uppercase tracking-[0.2em] italic text-sm border-b border-red-900/30 pb-2">02. Technical Fail-Safe Protocol</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Launch Gimmick failure fallback: Switch LED to static High-Res loop. Audio Master switches to secondary analog mixer. Console manager (Karthick) executes Node Reset while floor manager (Gazzali) provides stage cover.</p>
           </div>
           <div className="space-y-8">
              <h4 className="text-red-500 font-black uppercase tracking-[0.2em] italic text-sm border-b border-red-900/30 pb-2">03. Financial & Legal Compliance</h4>
              <p className="text-slate-400 text-sm leading-relaxed">Petrichor GST credentials must be included on all vendor proformas. Final audit (Phase 9) requires signed clearance from Hyatt F&B desk. Advance payments are hardcoded to the War Room Budget Ops tracker.</p>
              <div className="bg-black/30 p-8 rounded-[3rem] border border-red-900/20 italic">
                <p className="text-[10px] font-black text-red-500 uppercase mb-2">Escalation Matrix</p>
                <p className="text-xs text-slate-500 uppercase font-black">Level 1: Raji | Level 2: Anba | Level 3: Hyatt Management</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function TimelineView({ tasks, selectedTaskId, setSelectedTaskId, onEdit, onDelete, startDate }: any) {
  const sel = tasks.find((t: any) => t.id === selectedTaskId);
  const subs = tasks.filter((t: any) => t.parentId === selectedTaskId);
  return (
    <div className="flex h-full animate-in fade-in">
      <div className="w-80 border-r border-slate-800 bg-slate-900/30 flex flex-col overflow-y-auto p-6 gap-4 custom-scrollbar">
        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Strategic Node Path</h4>
        {tasks.filter((t: any) => !t.parentId).map((t: any) => (
          <div key={t.id} onClick={() => setSelectedTaskId(t.id)} className={`p-6 rounded-[2.5rem] cursor-pointer border-2 transition-all flex items-center justify-between ${selectedTaskId === t.id ? 'bg-red-600/10 border-red-500/50 text-white shadow-xl' : 'bg-slate-800/30 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
            <span className="text-[11px] font-black uppercase italic truncate">{t.title}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${selectedTaskId === t.id ? 'translate-x-1 text-red-500' : 'text-slate-700'}`} />
          </div>
        ))}
      </div>
      <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-950/50">
        {sel ? (
          <div className="max-w-5xl space-y-12 animate-in slide-in-from-right-10">
             <header className="flex justify-between items-start border-b border-slate-800 pb-12">
                <div className="space-y-6">
                   <span className="px-5 py-2 bg-red-600/10 text-red-500 rounded-xl text-[9px] font-black uppercase border border-red-500/30 italic">{sel.stage}</span>
                   <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">{sel.title}</h2>
                   <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl italic">{sel.description}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => onEdit(sel)} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase rounded-[1.5rem] border border-slate-700 transition-all">Node Control</button>
                  <button onClick={() => onDelete(sel.id)} className="p-4 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white rounded-[1.5rem] transition-all"><Trash2 className="w-5 h-5"/></button>
                </div>
             </header>
             <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest italic border-l-4 border-red-600 pl-6">Granular Directives ({subs.length} Items)</h4>
                <div className="grid grid-cols-1 gap-4">
                 {subs.map(st => (
                   <div key={st.id} className="bg-slate-900/30 p-8 rounded-[3rem] border border-slate-800 flex justify-between items-center group shadow-xl hover:border-red-600 transition-all">
                     <div className="flex items-center gap-8 flex-1">
                       <div className={`w-3 h-3 rounded-full ${st.status === TaskStatus.COMPLETED ? 'bg-emerald-500' : st.status === TaskStatus.CRITICAL ? 'bg-red-600 animate-pulse' : 'bg-slate-800'}`}></div>
                       <div>
                         <p className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">{st.title}</p>
                         <p className="text-[9px] font-bold text-slate-500 uppercase mt-2 italic tracking-tight">{st.description}</p>
                       </div>
                     </div>
                     <button onClick={() => onEdit(st)} className="px-6 py-3 bg-slate-800 text-[9px] font-black text-slate-400 uppercase rounded-xl hover:text-white transition-all opacity-0 group-hover:opacity-100">Config</button>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        ) : <div className="h-full flex flex-col items-center justify-center text-slate-800 font-black italic uppercase opacity-10 gap-8"><Sparkles className="w-24 h-24 animate-pulse" /><p>Analyze strategic node</p></div>}
      </div>
    </div>
  );
}

function RunSheetView({ entries, onUpdate }: any) {
  return (
    <div className="p-10 space-y-10 animate-in fade-in pb-32 overflow-y-auto h-full custom-scrollbar">
       <header>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Live Sequence Management</h2>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2">Feb 16 Nambikkai Launch Matrix | Hyatt Regency</p>
       </header>
       <div className="bg-slate-900 border border-slate-800 rounded-[4rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
             <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-black/40">
                <tr>
                   <th className="px-10 py-8">Time (IST)</th>
                   <th className="px-10 py-8">Operational Node</th>
                   <th className="px-10 py-8">AV/Light Cues</th>
                   <th className="px-10 py-8 text-center">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-800/50">
                {entries.map((item: any) => (
                   <tr key={item.id} className={`group hover:bg-slate-800/50 transition-all ${item.status === 'LIVE' ? 'bg-red-950/30 animate-pulse' : ''}`}>
                      <td className="px-10 py-10 font-black text-white italic text-2xl tracking-tighter">{item.time}</td>
                      <td className="px-10 py-10">
                         <p className="text-lg font-black text-slate-100 uppercase italic tracking-tighter leading-none">{item.activity}</p>
                         <p className="text-[9px] font-bold text-red-600 uppercase mt-2 italic tracking-widest">{item.owner}</p>
                      </td>
                      <td className="px-10 py-10">
                         <div className="flex flex-col gap-1 text-[8px] font-black uppercase">
                            <span className="text-blue-500 flex items-center gap-2"><Music className="w-3 h-3"/> {item.audioVisualCue}</span>
                            <span className="text-amber-500 flex items-center gap-2"><Sparkles className="w-3 h-3"/> {item.lightingCue}</span>
                         </div>
                      </td>
                      <td className="px-10 py-10">
                        <select className="bg-slate-800 text-[9px] font-black px-4 py-2 rounded-xl outline-none border-2 border-transparent focus:border-red-600 transition-all" value={item.status} onChange={(e) => onUpdate(entries.map((r: any) => r.id === item.id ? { ...r, status: e.target.value } : r))}>
                          <option value="PENDING">Standby</option>
                          <option value="LIVE">LIVE NOW</option>
                          <option value="DONE">Completed</option>
                        </select>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
}

function DashboardStat({ label, val, color, icon: Icon }: any) {
  return (
    <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
      <Icon className="absolute top-4 right-4 w-12 h-12 text-white opacity-5 group-hover:opacity-10 transition-all" />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic tracking-widest">{label}</p>
      <p className={`text-4xl font-black ${color} tracking-tighter italic`}>{val}</p>
    </div>
  );
}