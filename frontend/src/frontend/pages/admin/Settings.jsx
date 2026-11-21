import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api, API_BASE_URL, integrationNotes } from '../../services/api';
import { Badge, Button, Card, CardTitle, InfoNote, KeyValue, PageHeader, Tabs } from '../../components/ui/primitives';
import { Checkbox, Field, Input, Select } from '../../components/ui/form';
import { ConfirmDialog } from '../../components/ui/Modal';

const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York', 'UTC'];

const INTEGRATIONS = [
  { id: 'api', icon: 'Zap', label: 'Backend API', detail: API_BASE_URL, tone: 'warning', status: 'Mock' },
  { id: 'payments', icon: 'CreditCard', label: 'Payments gateway', detail: 'Razorpay / Stripe adapter', tone: 'warning', status: 'Not connected' },
  { id: 'ai', icon: 'Bot', label: 'AI assistant', detail: 'ClubBloom AI (on-device)', tone: 'active', status: 'Offline' },
  { id: 'comms', icon: 'Mail', label: 'Email / SMS', detail: 'Transactional messaging', tone: 'neutral', status: 'Not configured' },
];

export default function Settings() {
  const { clubConfig, setConfig, toast } = useApp();
  const [tab, setTab] = useState('config');
  const [draft, setDraft] = useState(clubConfig);
  const [testing, setTesting] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [maintOpen, setMaintOpen] = useState(false);

  useEffect(() => {
    setDraft(clubConfig);
  }, [clubConfig]);

  const set = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const saveConfig = () => {
    setConfig({
      clubName: draft.clubName,
      timezone: draft.timezone,
      openTime: draft.openTime,
      closeTime: draft.closeTime,
      gstPct: Number(draft.gstPct) || 0,
      maintenanceMode: Boolean(draft.maintenanceMode),
    });
  };

  const saveRules = () => {
    setConfig({
      maxBookingsPerDay: Number(draft.maxBookingsPerDay) || 1,
      trialDays: Number(draft.trialDays) || 0,
      allowSharedPlay: Boolean(draft.allowSharedPlay),
      autoRenewReminder: Boolean(draft.autoRenewReminder),
    });
  };

  const testConnection = async (label) => {
    setTesting(label);
    try {
      const res = await api.health();
      toast('Connection OK', `${label} responded with status "${res.status}".`, 'success');
    } catch (err) {
      toast('Connection failed', String(err?.message || err), 'error');
    } finally {
      setTesting(null);
    }
  };

  const tabs = [
    { id: 'config', label: 'Club configuration', icon: 'Building2' },
    { id: 'rules', label: 'Business rules', icon: 'ClipboardCheck' },
    { id: 'integrations', label: 'Integrations', icon: 'ShieldCheck' },
    { id: 'danger', label: 'Danger zone', icon: 'AlertTriangle' },
  ];

  return (
    <>
      <PageHeader
        icon="Settings"
        title="System Settings"
        subtitle="Platform-wide configuration for the club, its rules and connected services."
        badge={<Badge tone="info">Governance</Badge>}
      />

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      <div style={{ marginTop: 18 }}>
        {tab === 'config' ? (
          <Card glass>
            <CardTitle icon="Building2" title="Club configuration" hint="Identity, hours and tax for the whole platform" />
            <div className="cb-grid cols-2" style={{ gap: 14 }}>
              <Field label="Club name">
                <Input value={draft.clubName} onChange={(e) => set({ clubName: e.target.value })} />
              </Field>
              <Field label="Timezone" hint="Applied to bookings and reports">
                <Select value={draft.timezone} onChange={(e) => set({ timezone: e.target.value })} options={TIMEZONES.map((t) => ({ value: t, label: t }))} />
              </Field>
              <Field label="Opening time">
                <Input type="time" value={draft.openTime} onChange={(e) => set({ openTime: e.target.value })} />
              </Field>
              <Field label="Closing time">
                <Input type="time" value={draft.closeTime} onChange={(e) => set({ closeTime: e.target.value })} />
              </Field>
              <Field label="GST percentage" hint="Applied to shop & cafeteria orders">
                <Input type="number" value={draft.gstPct} onChange={(e) => set({ gstPct: e.target.value })} />
              </Field>
            </div>
            <Checkbox label="Maintenance mode" hint="Temporarily pause public bookings" checked={draft.maintenanceMode} onChange={(v) => set({ maintenanceMode: v })} />
            <div className="cb-row" style={{ marginTop: 6 }}>
              <Button icon="Save" onClick={saveConfig}>Save settings</Button>
            </div>
          </Card>
        ) : null}

        {tab === 'rules' ? (
          <Card glass>
            <CardTitle icon="ClipboardCheck" title="Business rules" hint="Booking and membership policy" />
            <div className="cb-grid cols-2" style={{ gap: 14 }}>
              <Field label="Max bookings per day" hint="Per member">
                <Input type="number" min="1" value={draft.maxBookingsPerDay} onChange={(e) => set({ maxBookingsPerDay: e.target.value })} />
              </Field>
              <Field label="Trial period (days)">
                <Input type="number" min="0" value={draft.trialDays} onChange={(e) => set({ trialDays: e.target.value })} />
              </Field>
            </div>
            <Checkbox label="Allow shared play" hint="Let members share a court with guests" checked={draft.allowSharedPlay} onChange={(v) => set({ allowSharedPlay: v })} />
            <Checkbox label="Auto-renew reminders" hint="Notify members before expiry" checked={draft.autoRenewReminder} onChange={(v) => set({ autoRenewReminder: v })} />
            <div className="cb-row" style={{ marginTop: 6 }}>
              <Button icon="Save" onClick={saveRules}>Save rules</Button>
            </div>
          </Card>
        ) : null}

        {tab === 'integrations' ? (
          <div className="cb-stack" style={{ gap: 18 }}>
            <div className="cb-grid cols-2">
              {INTEGRATIONS.map((int) => (
                <Card glass key={int.id}>
                  <CardTitle
                    icon={int.icon}
                    title={int.label}
                    hint={int.detail}
                    right={<Badge tone={int.tone} icon={int.tone === 'active' ? 'CheckCircle2' : 'AlertTriangle'}>{int.status}</Badge>}
                  />
                  <div className="cb-row between wrap" style={{ gap: 10 }}>
                    <span className="tiny dim">Endpoint health probe via api.health()</span>
                    <Button variant="outline" size="sm" icon={testing === int.label ? 'RefreshCw' : 'Zap'} disabled={testing === int.label} onClick={() => testConnection(int.label)}>
                      {testing === int.label ? 'Testing…' : 'Test connection'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card glass>
              <CardTitle icon="Info" title="Backend hand-off" hint="What still needs wiring" />
              <div className="cb-stack" style={{ gap: 8 }}>
                <KeyValue label="API base URL" value={API_BASE_URL} mono />
                {integrationNotes.map((note) => (
                  <InfoNote key={note}>{note}</InfoNote>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {tab === 'danger' ? (
          <div className="cb-grid cols-2">
            <Card glass>
              <CardTitle icon="RotateCcw" title="Reset demo data" hint="Restore the seeded fixtures" />
              <p className="small muted">Clear local changes and reload the original demo members, bookings and finance figures.</p>
              <div className="cb-row" style={{ marginTop: 12 }}>
                <Button variant="outline" icon="RotateCcw" onClick={() => setResetOpen(true)}>Reset demo data</Button>
              </div>
            </Card>
            <Card glass>
              <CardTitle icon="AlertTriangle" title="Maintenance mode" hint="Pause the public site" />
              <p className="small muted">Turn on maintenance mode to take bookings offline while you make changes.</p>
              <div className="cb-row" style={{ marginTop: 12 }}>
                <Button variant="danger" icon="Ban" onClick={() => setMaintOpen(true)}>Enable maintenance mode</Button>
              </div>
            </Card>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => toast('Demo data reset', 'Local changes have been cleared.', 'success')}
        title="Reset demo data?"
        confirmLabel="Reset data"
        message="This clears your local changes and restores the seeded demo fixtures."
      />

      <ConfirmDialog
        open={maintOpen}
        onClose={() => setMaintOpen(false)}
        onConfirm={() => setConfig({ maintenanceMode: true })}
        title="Enable maintenance mode?"
        confirmLabel="Enable"
        tone="primary"
        icon="AlertTriangle"
        message="Public bookings will be paused until you turn maintenance mode off."
      />
    </>
  );
}
