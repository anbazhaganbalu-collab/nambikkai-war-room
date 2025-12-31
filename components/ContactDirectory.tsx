
import React, { useState } from 'react';
import { Contact } from '../types';
import { User, Phone, Briefcase, Search, Plus, Filter, Users } from 'lucide-react';

interface ContactDirectoryProps {
  contacts: Contact[];
  onUpdate: (id: string, updates: Partial<Contact>) => void;
  onAdd: () => void;
}

export const ContactDirectory: React.FC<ContactDirectoryProps> = ({ contacts, onUpdate, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filtered = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm) ||
                          (c.paName && c.paName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-red-600/20 p-3 rounded-2xl">
            <Users className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Diplomatic Directory</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Managing Politicians, PAs, Media & PROs</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              className="bg-slate-800 border-none outline-none pl-12 pr-6 py-3 rounded-2xl text-xs font-bold text-white w-64 ring-1 ring-slate-700 focus:ring-red-500 transition-all"
              placeholder="Search Name, PA or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-slate-800 border-none outline-none px-6 py-3 rounded-2xl text-xs font-black text-white ring-1 ring-slate-700 uppercase tracking-widest"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="ALL">ALL CATEGORIES</option>
            <option value="Politician">Politicians</option>
            <option value="Journalist">Media/Journalists</option>
            <option value="PRO">PROs</option>
            <option value="Vendor">Vendors</option>
          </select>
          <button onClick={onAdd} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Protocol
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Contact Info</th>
                <th className="px-8 py-6">PA Details</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(contact => (
                <tr key={contact.id} className="group hover:bg-slate-800/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-400 text-xs">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white italic uppercase tracking-tight">{contact.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{contact.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                      contact.category === 'Politician' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      contact.category === 'Journalist' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                      contact.category === 'PRO' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                      'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {contact.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                        <Phone className="w-3 h-3 text-red-500" /> {contact.phone}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{contact.email || 'NO EMAIL'}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {contact.paName ? (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase italic">PA: {contact.paName}</p>
                        <p className="text-[10px] font-bold text-slate-500">{contact.paPhone}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-700 italic">No PA Assigned</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase bg-transparent outline-none ring-1 ring-slate-800 focus:ring-red-500 transition-all ${
                        contact.status === 'Confirmed' ? 'text-emerald-500' :
                        contact.status === 'Declined' ? 'text-red-500' :
                        'text-amber-500'
                      }`}
                      value={contact.status}
                      onChange={(e) => onUpdate(contact.id, { status: e.target.value as any })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Invited">Invited</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <button className="text-[10px] font-black text-slate-500 hover:text-red-500 uppercase tracking-widest transition-all">Edit Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BudgetStat = ({ label, val, color }: any) => (
  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${color} tracking-tighter`}>{val}</p>
  </div>
);
