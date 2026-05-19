import React from 'react';
import { Calendar as CalendarIcon, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import SimpleBar from 'simplebar-react';
import { Badge } from '@/shared/ui/shadcn/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { Timeline } from '@/shared/ui/components/Timeline';
import { AvatarGroup } from '@/shared/ui/shadcn/components/animate-ui/primitives/animate/avatar-group';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/shadcn/components/ui/avatar';

const activities = [
  { id: 1, time: '07:45 am', title: 'Breakfast with Jane', desc: 'Let her know how important is her work to us', color: 'bg-blue-500', done: true },
  { id: 2, time: '09:00 am', title: 'Verify Mr. Doe proposal', desc: 'Take important decision based on results', color: 'bg-indigo-500', done: false },
  { id: 3, time: '10:45 am', title: 'Get budget approved', desc: 'Let the team know next steps', color: 'bg-rose-500', done: false },
  { id: 4, time: '01:30 pm', title: 'Review website updates', desc: 'Create new project wireframes for next week', color: 'bg-amber-500', done: false },
  { id: 5, time: '02:00 pm', title: 'Team Meeting', desc: 'Our new product needs to reach 1M people', color: 'bg-emerald-500', done: false },
];

export const DailyPlanWidget: React.FC = () => {
  const navigate = useNavigate();

  const timelineItems = React.useMemo(() => activities.map((item) => ({
    id: String(item.id),
    icon: (
      <div className={cn(
        "size-5 rounded-full border-2 border-sidebar-background z-10 flex items-center justify-center transition-all group-hover:scale-125 shadow-sm",
        item.done ? "bg-emerald-500 border-emerald-500" : item.color
      )}>
        {item.done && <CheckCircle2 className="size-3 text-white" />}
      </div>
    ),
    title: (
       <div className="flex items-center justify-between w-full">
          <h3 className={cn(
            "text-xs font-bold transition-colors tracking-tight",
            item.done && "text-muted-foreground line-through"
          )}>
            {item.title}
          </h3>
          {item.done && (
            <Badge className="text-[9px] h-4 px-1 bg-emerald-500/10 text-emerald-600 border-none uppercase font-black">
              Completed
            </Badge>
          )}
       </div>
    ),
    subtitle: (
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.time}</span>
        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
          {item.desc}
        </p>
      </div>
    ),
    iconContainerClassName: "bg-transparent h-5 w-5",
    lineClassName: "left-[10px] top-6 bg-sidebar-border"
  })), []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <SimpleBar className="h-full">
          <div className="p-4 space-y-8">
            <Timeline items={timelineItems} gap="lg" showLine={true} />

            <div className="pt-6 border-t border-sidebar-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Up Next</span>
                </div>
                <button onClick={() => navigate('/apps/calendar')} className="text-xs font-bold text-primary hover:underline">
                  Open Calendar
                </button>
              </div>
              
              <div className="p-4 rounded-2xl bg-sidebar-surface border border-sidebar-border shadow-sm group hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase">Technical Sync</div>
                  <span className="text-[10px] font-bold tabular-nums">15:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <AvatarGroup translate="-15%" transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                    {[
                      ...[1, 2, 3].map(i => (
                        <Avatar key={i} className="size-7 rounded-full border-2 border-sidebar-surface">
                          <AvatarImage src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="Team" />
                          <AvatarFallback className="text-[10px] font-bold">T{i}</AvatarFallback>
                        </Avatar>
                      )),
                      <div key="more" className="size-7 rounded-full border-2 border-sidebar-surface bg-primary text-white flex items-center justify-center text-[9px] font-black z-20">
                        +4
                      </div>
                    ]}
                  </AvatarGroup>
                  <button className="p-1.5 bg-sidebar-background border border-sidebar-border rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                    <ChevronRight className="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SimpleBar>
      </div>
      
      <div className="p-4 border-t border-sidebar-border bg-sidebar-surface/10 mt-auto">
        <ActionButton className="w-full rounded-pill shadow-lg">
           <Plus className="size-3" />
           New Activity
        </ActionButton>
      </div>
    </div>
  );
};
