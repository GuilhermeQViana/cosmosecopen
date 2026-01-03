import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useVendorDomains } from '@/hooks/useVendorRequirements';
import { useVendorAssessments, useVendorAssessmentResponses } from '@/hooks/useVendorAssessments';
import { useVendorRequirements } from '@/hooks/useVendorRequirements';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

interface VendorComplianceRadarProps {
  vendorId?: string;
  assessmentId?: string;
  showAllVendors?: boolean;
}

export function VendorComplianceRadar({ vendorId, assessmentId, showAllVendors = true }: VendorComplianceRadarProps) {
  const { data: domains = [], isLoading: domainsLoading } = useVendorDomains();
  const { data: requirements = [] } = useVendorRequirements();
  const { data: assessments = [], isLoading: assessmentsLoading } = useVendorAssessments(vendorId);
  const { data: singleResponses = [] } = useVendorAssessmentResponses(assessmentId || null);

  const chartData = useMemo(() => {
    if (domains.length === 0) return [];

    // Get latest completed assessments with responses
    const completedAssessments = assessments.filter(a => 
      a.status === 'completed' || a.status === 'approved'
    );

    return domains.map((domain) => {
      const domainRequirements = requirements.filter(r => r.domain_id === domain.id);
      const domainRequirementIds = domainRequirements.map(r => r.id);

      // Calculate average score for this domain across all assessments
      let totalScore = 0;
      let count = 0;

      if (assessmentId && singleResponses.length > 0) {
        // Single assessment view
        const domainResponses = singleResponses.filter(r => 
          domainRequirementIds.includes(r.requirement_id)
        );
        if (domainResponses.length > 0) {
          totalScore = domainResponses.reduce((sum, r) => sum + r.compliance_level, 0);
          count = domainResponses.length;
        }
      } else if (showAllVendors && completedAssessments.length > 0) {
        // Aggregate view - would need to fetch all responses
        // For now, use overall_score as approximation
        completedAssessments.forEach(assessment => {
          if (assessment.overall_score !== null) {
            totalScore += assessment.overall_score / 20; // Convert to 0-5 scale
            count++;
          }
        });
      }

      const averageScore = count > 0 ? (totalScore / count) : 0;
      const scorePercentage = (averageScore / 5) * 100;

      return {
        domain: domain.name.split(' ')[0], // Abbreviate for chart
        fullName: domain.name,
        score: Math.round(scorePercentage),
        fullMark: 100,
      };
    });
  }, [domains, requirements, assessments, assessmentId, singleResponses, showAllVendors]);

  const isLoading = domainsLoading || assessmentsLoading;

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Conformidade por Domínio</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = chartData.some(d => d.score > 0);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Conformidade por Domínio</CardTitle>
        <CardDescription>
          Performance média em cada área de avaliação
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Realize avaliações para ver a conformidade por domínio</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid 
                  stroke="hsl(var(--border))" 
                  strokeOpacity={0.3}
                />
                <PolarAngleAxis 
                  dataKey="domain" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name="Conformidade"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}%`,
                    props.payload.fullName,
                  ]}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
