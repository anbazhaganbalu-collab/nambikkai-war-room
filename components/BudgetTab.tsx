import React from 'react';
import { BudgetCategory, BudgetLineItem, PayoutApprovalStatus } from '../types';
/* Import missing Activity icon */
import { Plus, Trash2, PieChart, ShieldCheck, Clock, CheckCircle2, AlertCircle, FileCheck, Download, TrendingUp, DollarSign, FileSpreadsheet, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface BudgetTabProps {
  items: BudgetLineItem[];
  currentUserRole: string;
  onAdd: (header: BudgetCategory) => void;
  onUpdate: (id: string, updates: Partial<BudgetLineItem>) => void;
  onDelete: (id: string) => void;
  onDraftPO: (item: BudgetLineItem) => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN').format(val);
};

export const BudgetTab: React.FC<BudgetTabProps> = ({ items, onAdd, onUpdate, onDelete, onDraftPO }) => {
  const totals = items.reduce((acc, item) => ({
    allocated: acc.allocated + (item.quantity * item.unitPrice),
    spent: acc.spent + item.spent,
    gst: acc.gst + (item.spent * (item.gstPercent / 100)),
    advances: acc.advances + item.advancePaid
  }), { allocated: 0, spent: 0, gst: 0, advances: 0 });

  const exportCSV = () => {
    const headers = ['Category', 'Description', 'Vendor', 'Allocated', 'Spent', 'Advance Paid', 'GST %', 'Balance Due'];
    const rows = items.map(i => [
      i.header, i.description, i.vendorName, i.quantity * i.unitPrice, i.spent, i.advancePaid, i.gstPercent, (i.spent - i.advancePaid)
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `nambikkai_financial_audit_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePODraft = (item: BudgetLineItem) => {
    if (confirm(`Confirm: Draft Purchase Order for ${item.vendorName || 'Selected Vendor'}? This will use Petrichor GST details.`)) {
      alert(`PO Drafted for ${item.description}. Check PO Gallery in 'Iterations' tab.`);
    }
  };

  return (
    <div className="p-10 space-y-12 bg-slate-950 min-h-full pb-32 animate-in fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Budget Control Center</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 italic">Petrichor HQ | 18% GST Compliant Tracker</p>
        </div>
        <button onClick={exportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-900/20">
          <Download className="w-5 h-5" /> Export Audit CSV
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <BudgetStat label="Target Allocation" val={`₹${formatCurrency(totals.allocated)}`} color="text-slate-400" icon={TrendingUp} />
        <BudgetStat label="Actual Deployment" val={`₹${formatCurrency(totals.spent)}`} color="text-red-500" icon={Activity} />
        <BudgetStat label="GST Liability (18%)" val={`₹${formatCurrency(totals.gst)}`} color="text-blue-400" icon={DollarSign} />
        <BudgetStat label="Paid Advances" val={`₹${formatCurrency(totals.advances)}`} color="text-emerald-500" icon={ShieldCheck} />
      </div>

      <div className="space-y-16">
        {Object.values(BudgetCategory).map(header => {
          const headerItems = items.filter(i => i.header === header);
          const headerAllocated = headerItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
          const headerSpent = headerItems.reduce((sum, i) => sum + i.spent, 0);
          const variance = headerAllocated - headerSpent;

          return (
            <div key={header} className="bg-slate-900/50 rounded-[5rem] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="px-12 py-12 bg-slate-800/40 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-8">
                   <div className="w-16 h-16 bg-red-600/10 rounded-[2.5rem] flex items-center justify-center border border-red-900/20 shadow-inner">
                      <PieChart className="w-8 h-8 text-red-600" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{header}</h3>
                      <div className="flex gap-6 mt-3">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">Allocated: <span className="text-slate-200">₹{formatCurrency(headerAllocated)}</span></p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">Spent: <span className="text-red-500">₹{formatCurrency(headerSpent)}</span></p>
                      </div>
                   </div>
                </div>
                <button onClick={() => onAdd(header)} className="px-8 py-4 bg-red-600 text-white text-[10px] font-black rounded-2xl uppercase hover:bg-red-700 shadow-xl transition-all">+ Add Allocation Node</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-black/40">
                    <tr>
                      <th className="px-12 py-8">Objective / Vendor</th>
                      <th className="px-12 py-8">Unit Cap</th>
                      <th className="px-12 py-8">Actual Deployment</th>
                      <th className="px-12 py-8">Advance Balance</th>
                      <th className="px-12 py-8 text-center">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {headerItems.map(item => (
                      <tr key={item.id} className="group hover:bg-slate-800/40 transition-all">
                        <td className="px-12 py-10">
                          <input className="bg-transparent border-none outline-none text-slate-100 font-black text-lg w-full uppercase italic tracking-tighter" value={item.description} onChange={(e) => onUpdate(item.id, { description: e.target.value })} />
                          <input className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 w-full italic" value={item.vendorName} placeholder="LINK STRATEGIC VENDOR..." onChange={(e) => onUpdate(item.id, { vendorName: e.target.value })} />
                        </td>
                        <td className="px-12 py-10">
                           <div className="flex items-center gap-2 font-black text-slate-400 italic text-lg">
                             ₹<input className="bg-transparent w-24 border-none outline-none" type="number" value={item.unitPrice} onChange={(e) => onUpdate(item.id, { unitPrice: Number(e.target.value) })} />
                           </div>
                        </td>
                        <td className="px-12 py-10">
                           <div className="flex items-center gap-2 font-black text-red-500 italic text-lg">
                             ₹<input className="bg-slate-950/50 rounded-xl px-4 py-2 w-32 border border-slate-700 outline-none focus:border-red-500" type="number" value={item.spent} onChange={(e) => onUpdate(item.id, { spent: Number(e.target.value) })} />
                           </div>
                        </td>
                        <td className="px-12 py-10">
                           <span className={`font-black italic text-lg ${item.spent - item.advancePaid > 0 ? 'text-amber-500' : 'text-emerald-500 opacity-30'}`}>
                             ₹{formatCurrency(item.spent - item.advancePaid)}
                           </span>
                        </td>
                        <td className="px-12 py-10">
                          <div className="flex items-center justify-center gap-4">
                            <button onClick={() => handlePODraft(item)} className="p-4 text-slate-500 hover:text-red-500 bg-slate-800/50 rounded-2xl transition-all" title="Draft PO"><FileCheck className="w-5 h-5"/></button>
                            <button onClick={() => onDelete(item.id)} className="p-4 text-slate-500 hover:text-red-500 bg-slate-800/50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const BudgetStat = ({ label, val, color, icon: Icon }: any) => (
  <div className="bg-slate-900 p-12 rounded-[4rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-all">
       <Icon className="w-24 h-24 text-white" />
    </div>
    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">{label}</p>
    <p className={`text-4xl font-black ${color} tracking-tighter italic`}>{val}</p>
  </div>
);
