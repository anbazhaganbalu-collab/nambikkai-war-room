import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, ProjectStage, ApprovalStatus, FileReference, EventRole, Vendor } from '../types';
import { Upload, FileText, Trash2, Plus, X, AlertCircle, ImageIcon, FileSpreadsheet, Link as LinkIcon } from 'lucide-react';

interface TaskFormProps {
  initialTask?: Partial<Task>;
  parentId?: string;
  vendors: Vendor[];
  allTasks: Task[];
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialTask, parentId, vendors, allTasks, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    assigneeNotes: initialTask?.assigneeNotes || '',
    startDate: initialTask?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    endDate: initialTask?.endDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    stage: initialTask?.stage || ProjectStage.STRATEGY,
    status: initialTask?.status || TaskStatus.TODO,
    approvalStatus: initialTask?.approvalStatus || ApprovalStatus.DRAFT,
    assignee: initialTask?.assignee || EventRole.FOUNDER,
    reviewer: initialTask?.reviewer || EventRole.BUSINESS_HEAD,
    approver: initialTask?.approver || EventRole.FOUNDER,
    gatekeeper: initialTask?.gatekeeper || '',
    backupPlan: initialTask?.backupPlan || '',
    escalationMatrix: initialTask?.escalationMatrix || '',
    progress: initialTask?.progress || 0,
    parentId: parentId || initialTask?.parentId || undefined,
    dependencies: initialTask?.dependencies || [],
    vendorId: initialTask?.vendorId || '',
    files: initialTask?.files || []
  });

  const [newFileName, setNewFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Auto-save draft functionality
  useEffect(() => {
    const draftKey = `nambikkai_task_draft_${initialTask?.id || 'new'}`;
    const interval = setInterval(() => {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }, 10000);
    return () => clearInterval(interval);
  }, [initialTask?.id, formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const draftKey = `nambikkai_task_draft_${initialTask?.id || 'new'}`;
    localStorage.removeItem(draftKey);
    onSubmit(formData);
  };

  const handleCancelClick = () => {
    if (confirm('Are you sure you want to discard your draft? Any unsaved changes will be lost.')) {
      const draftKey = `nambikkai_task_draft_${initialTask?.id || 'new'}`;
      localStorage.removeItem(draftKey);
      onCancel();
    }
  };

  const simulateUpload = () => {
    if (!newFileName) return;
    setIsUploading(true);
    setTimeout(() => {
      const extension = newFileName.split('.').pop()?.toLowerCase();
      let type: FileReference['type'] = 'DOC';
      if (['xlsx', 'xls', 'csv'].includes(extension!)) type = 'EXCEL';
      if (['pdf'].includes(extension!)) type = 'PDF';
      if (['png', 'jpg', 'jpeg'].includes(extension!)) type = 'IMAGE';

      const newFile: FileReference = {
        id: `file-${Date.now()}`,
        name: newFileName,
        type,
        url: '#',
        uploadedAt: new Date().toISOString(),
        version: 'v1.0'
      };
      setFormData({ ...formData, files: [...(formData.files || []), newFile] });
      setNewFileName('');
      setIsUploading(false);
    }, 800);
  };

  const toggleDependency = (taskId: string) => {
    const current = formData.dependencies || [];
    if (current.includes(taskId)) {
      setFormData({ ...formData, dependencies: current.filter(id => id !== taskId) });
    } else {
      setFormData({ ...formData, dependencies: [...current, taskId] });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-6xl overflow-hidden my-auto border border-slate-200 animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
                {initialTask?.id ? 'Configure Command Node' : 'Initialize New Directive'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {initialTask?.id || 'NEW-NODE'}</p>
            </div>
            <button type="button" onClick={handleCancelClick} className="p-4 hover:bg-slate-200 rounded-2xl transition-all text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10 overflow-y-auto custom-scrollbar">
            <div className="space-y-6 md:col-span-1">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Directive Title</label>
                <input
                  required
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 focus:border-red-500 outline-none font-black text-slate-800 transition-all bg-slate-50/30 text-lg"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee (Lead Node)</label>
                <select 
                  className="w-full border-2 border-slate-100 rounded-xl p-4 text-xs font-black bg-slate-50/30 outline-none focus:border-red-500"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value as any })}
                >
                  {Object.values(EventRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Assignee Notes / Intelligence</label>
                <textarea
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-32 resize-none bg-slate-50/30 outline-none focus:border-red-500"
                  value={formData.assigneeNotes}
                  onChange={(e) => setFormData({ ...formData, assigneeNotes: e.target.value })}
                  placeholder="Input detailed notes, blockers, or SITREP..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Launch Date</label>
                  <input 
                    type="date"
                    className="w-full border-2 border-slate-100 rounded-xl p-4 text-xs font-black bg-slate-50/30 outline-none focus:border-red-500"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</label>
                  <input 
                    type="date"
                    className="w-full border-2 border-slate-100 rounded-xl p-4 text-xs font-black bg-slate-50/30 outline-none focus:border-red-500"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 md:col-span-1 border-x border-slate-100 px-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" /> Node Dependencies
                </label>
                <div className="max-h-56 overflow-y-auto border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-2 custom-scrollbar">
                  {allTasks.filter(t => t.id !== initialTask?.id).map(t => (
                    <label key={t.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-red-400 transition-all">
                      <input 
                        type="checkbox" 
                        checked={formData.dependencies?.includes(t.id)} 
                        onChange={() => toggleDependency(t.id)}
                        className="w-4 h-4 accent-red-600 rounded"
                      />
                      <span className="text-[10px] font-black uppercase italic text-slate-600 truncate">{t.title}</span>
                    </label>
                  ))}
                  {allTasks.length <= 1 && <p className="text-[10px] text-slate-400 text-center py-4 italic">No other nodes available.</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Detailed Parameters</label>
                <textarea
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium h-48 resize-none bg-slate-50/30 outline-none focus:border-red-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task breakdown..."
                />
              </div>
            </div>

            <div className="space-y-6 md:col-span-1">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Documentation (Files/Excel)</label>
                <div className="flex gap-2">
                  <input 
                    placeholder="Ref Name (e.g. Budget.xlsx)"
                    className="flex-1 border-2 border-slate-100 rounded-xl p-4 text-[11px] font-black bg-slate-50/30 outline-none focus:border-blue-500 uppercase"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                  />
                  <button type="button" onClick={simulateUpload} disabled={isUploading || !newFileName} className="bg-slate-800 text-white px-6 rounded-xl font-black text-[10px] uppercase hover:bg-black disabled:opacity-50">
                    <Plus className="w-5 h-5"/>
                  </button>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {formData.files?.map(file => (
                    <div key={file.id} className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200 group">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-[10px] font-black text-slate-700 uppercase truncate max-w-[150px]">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => setFormData({ ...formData, files: formData.files?.filter(f => f.id !== file.id) })} className="text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-center mb-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Metrics</label>
                   <span className="text-sm font-black text-red-600 italic">{formData.progress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 mt-auto">
            <button type="button" onClick={handleCancelClick} className="px-8 py-4 text-[11px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-all italic underline underline-offset-4">Discard Draft</button>
            <button type="submit" className="px-12 py-4 bg-red-600 text-white text-[11px] font-black rounded-2xl hover:bg-red-700 shadow-xl transition-all uppercase tracking-widest">Commit Directive</button>
          </div>
        </form>
      </div>
    </div>
  );
};