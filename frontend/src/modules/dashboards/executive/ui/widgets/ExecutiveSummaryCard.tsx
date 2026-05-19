/**
 * ExecutiveSummaryCard
 * 
 * A narrative summary widget that explains what is happening and why
 * in plain business language. Positioned below PageHeader, above KPI rail.
 */

import { Card, CardContent } from '@/shared/ui/shadcn/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shadcn/lib/utils';
import { useExecutiveInsights } from '../../application/hooks/useExecutiveInsights';
import type { DateRange } from '../../../shared/utils/dateRange';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/shared/ui/components/Skeleton';

export interface ExecutiveSummaryCardProps {
  range: DateRange;
  compare: boolean;
}

export function ExecutiveSummaryCard({ range, compare }: ExecutiveSummaryCardProps) {
  const { t } = useTranslation('dashboards');
  const { summary, isLoading } = useExecutiveInsights(range, compare);

  if (isLoading) {
    return (
      <Card className="border-none bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const SentimentIcon = summary.overallSentiment === 'positive' ? TrendingUp :
    summary.overallSentiment === 'negative' ? TrendingDown : Minus;

  const sentimentColor = summary.overallSentiment === 'positive' ? 'text-emerald-500' :
    summary.overallSentiment === 'negative' ? 'text-rose-500' : 'text-amber-500';

  const sentimentBg = summary.overallSentiment === 'positive' ? 'from-emerald-500/10 via-emerald-500/5' :
    summary.overallSentiment === 'negative' ? 'from-rose-500/10 via-rose-500/5' : 'from-amber-500/10 via-amber-500/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className={cn(
        'border-none bg-gradient-to-r to-transparent overflow-hidden',
        sentimentBg
      )}>
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            {/* Sentiment Icon */}
            <div className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              'bg-background/80 backdrop-blur-sm shadow-sm'
            )}>
              <SentimentIcon className={cn('w-5 h-5', sentimentColor)} />
            </div>

            {/* Summary Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary/60" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('executive.summary', 'Executive Summary')}
                </span>
              </div>
              
              <p className="text-base font-medium text-foreground leading-relaxed">
                {summary.headline}
              </p>

              {/* Optional bullet points for additional context */}
              {summary.bullets.length > 2 && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {summary.bullets.slice(2).map((bullet, idx) => (
                    <span key={idx} className="text-sm text-muted-foreground">
                      • {bullet}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
