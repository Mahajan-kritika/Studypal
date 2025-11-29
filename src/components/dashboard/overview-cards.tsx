
'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useHistory } from '@/hooks/use-history';
import { useMemo, useState } from 'react';
import { format, subDays, parseISO } from 'date-fns';

const chartConfig = {
  activities: {
    label: 'Activities',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

interface WeeklyProgressChartProps {
    onBarClick: (date: string) => void;
}

export function WeeklyProgressChart({ onBarClick }: WeeklyProgressChartProps) {
    const { history } = useHistory();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const chartData = useMemo(() => {
        const days = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                day: format(date, 'eee'),
                date: format(date, 'yyyy-MM-dd'),
                activities: 0,
            };
        });

        history.forEach(item => {
            const itemDate = parseISO(item.timestamp);
            const formattedDate = format(itemDate, 'yyyy-MM-dd');
            const dayEntry = days.find(d => d.date === formattedDate);
            if (dayEntry) {
                dayEntry.activities += 1;
            }
        });

        return days;
    }, [history]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart 
            accessibilityLayer 
            data={chartData}
            onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            allowDecimals={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideIndicator />}
          />
          <Bar 
            dataKey="activities" 
            radius={4}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onClick={(data) => onBarClick(data.date)}
          >
            {chartData.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill="hsl(var(--primary))"
                    filter={activeIndex === index ? 'url(#glow)' : 'none'}
                    style={{ transition: 'filter 0.2s ease-in-out', cursor: 'pointer' }}
                />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
