import {
  Badge, Card, CardTitle, InfoNote, KeyValue, PageHeader, StatCard,
} from '../../components/ui/primitives';
import Icon from '../../components/ui/Icon';
import ChatPanel from '../../components/ai/ChatPanel';
import { managerAiInsights, retentionSummary, managerKpis } from '../../data/analytics';
import { managerSuggestions, aiDisclosure } from '../../data/aiResponses';

const typeIcon = {
  revenue: 'LineChart',
  renewal: 'CalendarClock',
  retention: 'Heart',
  utilisation: 'BarChart3',
  stock: 'Package',
  growth: 'Sprout',
};
const toneBadge = { info: 'info', warning: 'warning', danger: 'danger', success: 'active' };
const toneStat = { info: '', warning: 'gold', danger: 'neon', success: 'green' };

export default function ManagerAiInsights() {
  return (
    <div className="cb-stack" style={{ gap: 20 }}>
      <PageHeader
        icon="Sparkles"
        title="AI insights"
        subtitle="Locally generated recommendations across revenue, retention, courts and inventory."
        badge={<Badge tone="info">Offline demo</Badge>}
      />

      <div className="cb-grid cols-4">
        <StatCard icon="Target" label="NPS" value={retentionSummary.nps} detail="Net promoter score" />
        <StatCard icon="Repeat" tone="green" label="Renewal rate" value={`${retentionSummary.renewalRate}%`} detail="Rolling 12 months" delay={0.05} />
        <StatCard icon="TrendingDown" tone="neon" label="Churn rate" value={`${retentionSummary.churnRate}%`} detail="Monthly average" delay={0.1} />
        <StatCard icon="Heart" tone="gold" label="Avg membership" value={`${retentionSummary.avgMembershipMonths} mo`} detail={`${managerKpis.totalMembers} members`} delay={0.15} />
      </div>

      <div className="cb-grid cols-2">
        {managerAiInsights.map((insight) => (
          <Card glass key={insight.id} style={{ borderColor: 'rgba(0,163,255,0.18)' }}>
            <CardTitle
              icon={typeIcon[insight.type] || 'Sparkles'}
              iconTone={toneStat[insight.tone] || ''}
              title={insight.title}
              hint={insight.headline}
              right={<Badge tone={toneBadge[insight.tone] || 'neutral'}>{insight.type}</Badge>}
            />
            <ul className="cb-stack" style={{ gap: 10, paddingLeft: 0, listStyle: 'none', margin: 0 }}>
              {insight.points.map((point) => (
                <li key={point} className="cb-row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <span className="stat-icon" style={{ width: 24, height: 24, borderRadius: 8, flex: 'none' }}>
                    <Icon name="Check" size={12} />
                  </span>
                  <span className="small" style={{ color: '#cbd5e1' }}>{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="cb-grid" style={{ gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        <ChatPanel mode="manager" suggestions={managerSuggestions} title="ClubBloom AI — Manager" subtitle="Ask about revenue, retention, courts or inventory" />

        <Card glass>
          <CardTitle icon="BarChart3" title="Retention summary" hint="Health of the member base" />
          <KeyValue label="Renewal rate" value={`${retentionSummary.renewalRate}%`} mono />
          <KeyValue label="Churn rate" value={`${retentionSummary.churnRate}%`} mono />
          <KeyValue label="Avg membership length" value={`${retentionSummary.avgMembershipMonths} months`} mono />
          <KeyValue label="Net promoter score" value={retentionSummary.nps} mono />
          <div style={{ marginTop: 16 }}>
            <InfoNote icon="Info">{aiDisclosure}</InfoNote>
          </div>
        </Card>
      </div>
    </div>
  );
}
