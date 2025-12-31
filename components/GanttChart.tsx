import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { format, differenceInDays, addDays } from 'date-fns';

interface GanttChartProps {
  tasks: Task[];
  startDate: Date;
  daysToShow?: number;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-slate-200 border-slate-300 text-slate-600',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 border-blue-400 text-blue-700',
  [TaskStatus.COMPLETED]: 'bg-emerald-100 border-emerald-400 text-emerald-700',
  [TaskStatus.DELAYED]: 'bg-red-50 border-red-300 text-red-700 shadow-[0_0_10px_rgba(239,68,68,0.1)] ring-1 ring-red-200',
  [TaskStatus.CRITICAL]: 'bg-red-600 border-red-800 text-white shadow-[0_0_15px_rgba(185,28,28,0.4)] animate-pulse font-black',
};

const DAY_WIDTH = 48;
const ROW_HEIGHT = 48;

export const GanttChart: React.FC<GanttChartProps> = ({ tasks, startDate, daysToShow = 30 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dependencyLines, setDependencyLines] = useState<{ x1: number, y1: number, x2: number, y2: number }[]>([]);

  const timeline = useMemo(() => {
    return Array.from({ length: daysToShow }).map((_, i) => addDays(startDate, i));
  }, [startDate, daysToShow]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [tasks]);

  useEffect(() => {
    const lines: { x1: number, y1: number, x2: number, y2: number }[] = [];
    sortedTasks.forEach((task, index) => {
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          const depIndex = sortedTasks.findIndex(t => t.id === depId);
          if (depIndex !== -1) {
            const depTask = sortedTasks[depIndex];
            const depEndOffset = differenceInDays(new Date(depTask.endDate), startDate) + 1;
            const taskStartOffset = differenceInDays(new Date(task.startDate), startDate);
            const x1 = (depEndOffset * DAY_WIDTH) + 256;
            const y1 = (depIndex * ROW_HEIGHT) + (ROW_HEIGHT / 2) + ROW_HEIGHT;
            const x2 = (taskStartOffset * DAY_WIDTH) + 256;
            const y2 = (index * ROW_HEIGHT) + (ROW_HEIGHT / 2) + ROW_HEIGHT;
            lines.push({ x1, y1, x2, y2 });
          }
        });
      }
    });
    setDependencyLines(lines);
  }, [sortedTasks, startDate]);

  return (
    <div className="overflow-x-auto bg-white border rounded-[2.5rem] shadow-2xl relative" ref={containerRef}>
      <div className="min-w-max relative">
        <svg className="absolute inset-0 pointer-events-none z-10" width="100%" height="100%">
          {dependencyLines.map((line, i) => (
            <g key={i}>
              <path d={`M ${line.x1} ${line.y1} L ${line.x1 + 10} ${line.y1} L ${line.x1 + 10} ${line.y2} L ${line.x2} ${line.y2}`} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" className="opacity-40" />
              <circle cx={line.x2} cy={line.y2} r="3" fill="#ef4444" className="opacity-60" />
            </g>
          ))}
        </svg>
        <div className="flex border-b sticky top-0 bg-white z-20">
          <div className="w-64 p-4 font-black text-[10px] uppercase tracking-widest border-r sticky left-0 bg-white italic border-slate-100">Directive Matrix</div>
          {timeline.map((day) => (
            <div key={day.toISOString()} className="w-12 text-center py-3 border-r border-slate-50 text-[10px] flex flex-col items-center justify-center font-bold">
              <span className="text-slate-400 uppercase tracking-tighter">{format(day, 'MMM')}</span>
              <span className="text-slate-800">{format(day, 'dd')}</span>
            </div>
          ))}
        </div>
        {sortedTasks.map((task) => {
          const taskStart = new Date(task.startDate);
          const duration = Math.max(1, differenceInDays(new Date(task.endDate), taskStart) + 1);
          const offset = differenceInDays(taskStart, startDate);
          const isOverdue = task.status !== TaskStatus.COMPLETED && new Date(task.endDate) < new Date();
          
          return (
            <div key={task.id} className="flex border-b border-slate-50 hover:bg-slate-50/50 transition-colors group relative h-12">
              <div className="w-64 p-3 border-r border-slate-100 sticky left-0 bg-white group-hover:bg-slate-50 z-[5] text-[10px] truncate font-black uppercase italic tracking-tight flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-red-500 animate-pulse' : 'bg-slate-200'}`} />
                {task.title}
              </div>
              <div className="flex flex-1 relative h-full">
                {offset >= 0 && offset < daysToShow && (
                  <div 
                    className={`absolute top-2 h-8 rounded-xl border px-3 flex items-center text-[8px] font-black uppercase tracking-widest whitespace-nowrap overflow-hidden z-20 transition-all shadow-sm ${STATUS_COLORS[task.status]}`} 
                    style={{ left: `${offset * DAY_WIDTH}px`, width: `${duration * DAY_WIDTH}px` }}
                  >
                    <div className="relative z-10 flex-1 truncate">{task.title}</div>
                    
                    {/* Visual Progress Bar Within Task Bar */}
                    <div 
                      className={`absolute bottom-0 left-0 h-1 bg-black/10 transition-all duration-1000 ${task.status === TaskStatus.CRITICAL ? 'bg-white/40' : ''}`} 
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
                {timeline.map((_, i) => <div key={i} className="w-12 border-r border-slate-50 h-full opacity-50"></div>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};