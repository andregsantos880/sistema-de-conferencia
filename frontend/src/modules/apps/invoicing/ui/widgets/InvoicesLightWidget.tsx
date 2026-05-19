import React, { useMemo } from 'react';
import { CreditCard, ArrowUpRight, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/shared/ui/shadcn/components/ui/chart';
import { useInvoices } from '../../application/hooks/useInvoice';
import { cn } from '@/shadcn/lib/utils';
import SimpleBar from 'simplebar-react';
import ActionButton from '@/components/forms/buttons/ActionButton';
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge';


export const InvoicesLightWidget: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useInvoices({ pageSize: 5 });
  const invoices = data?.items || [];

  const revenueData = useMemo(() => {
    // Mock 7-day revenue trend
    return [
      { day: 'Mon', revenue: 4200 },
      { day: 'Tue', revenue: 3800 },
      { day: 'Wed', revenue: 5100 },
      { day: 'Thu', revenue: 4700 },
      { day: 'Fri', revenue: 6200 },
      { day: 'Sat', revenue: 3500 },
      { day: 'Sun', revenue: 5800 },
    ];
  }, []);

  const totalRevenue = useMemo(() => {
    return revenueData.reduce((sum, item) => sum + item.revenue, 0);
  }, [revenueData]);

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/invoices/create');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0">
        <SimpleBar className="flex-1 h-full">
          <div className="p-4 space-y-6">
            {/* Revenue Monitor */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Revenue Monitor</h3>
                  <p className="text-2xl font-black tabular-nums tracking-tight">
                    ${totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
                    <ArrowUpRight className="size-3" />
                    <span>+12.5% vs last week</span>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <CreditCard className="size-4" />
                </div>
              </div>

              <div className="h-[120px] w-full -ml-2">
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "var(--chart-6)",
                    },
                  }}
                  className="h-full w-full"
                >
                  <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-revenue)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent Invoices</h3>
                <button 
                  onClick={() => navigate('/invoices')}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl bg-sidebar-hover/30 animate-pulse" />
                  ))
                ) : (
                  invoices.map((invoice) => (
                    <button
                      key={invoice.id}
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="flex items-center justify-between w-full p-4 rounded-2xl bg-sidebar-surface border border-sidebar-border hover:bg-sidebar-hover transition-colors group text-left shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-10 rounded-2xl shrink-0 flex items-center justify-center",
                          invoice.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" :
                          invoice.status === 'overdue' ? "bg-rose-500/10 text-rose-500" :
                          "bg-amber-500/10 text-amber-500"
                        )}>
                          {invoice.status === 'paid' ? <CheckCircle2 className="size-4" /> : <FileText className="size-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black truncate tracking-tight">{invoice.number}</p>
                          <p className="text-[10px] text-muted-foreground truncate font-medium">{invoice.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-xs font-black tabular-nums">
                          {invoice.currency} {invoice.total.toLocaleString()}
                        </p>
                        <InvoiceStatusBadge status={invoice.status} className="px-1.5 py-0 scale-90 origin-right" />
                      </div>
                    </button>
                  ))

                )}
              </div>
            </div>
          </div>
        </SimpleBar>
      </div>

      <div className="p-4 border-t border-sidebar-border/50 bg-sidebar-surface/10 mt-auto">
        <ActionButton 
          onClick={handleCreate}
          className="w-full rounded-pill shadow-lg"
        >
          <FileText className="size-3" />
          Create New Invoice
        </ActionButton>
      </div>
    </div>
  );
};

