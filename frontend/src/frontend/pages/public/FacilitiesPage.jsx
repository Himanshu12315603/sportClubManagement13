import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import { Badge, Button, Card, CardTitle, ChipGroup, InfoNote, PageHeader, SectionHeading } from '../../components/ui/primitives';
import { facilities } from '../../data/facilities';
import { BOOKING_RULES, refundPolicyNote, socialPlaySessions } from '../../data/courts';

const filters = [
  { id: 'all', label: 'All facilities' },
  { id: 'play', label: 'Courts & studio' },
  { id: 'lifestyle', label: 'Shop & cafe' },
];

const playIds = ['tennis', 'badminton', 'cricket', 'padel', 'fitness'];

export default function FacilitiesPage() {
  const [filter, setFilter] = useState('all');

  const list = useMemo(() => {
    if (filter === 'play') return facilities.filter((f) => playIds.includes(f.id));
    if (filter === 'lifestyle') return facilities.filter((f) => !playIds.includes(f.id));
    return facilities;
  }, [filter]);

  return (
    <div className="cb-page cb-container">
      <PageHeader
        title="Facilities"
        icon="Map"
        subtitle="Everything under one roof — courts, studio, pro shop and the courtside cafe."
        actions={<Button icon="CalendarCheck" as={Link} to="/trial">Book a trial</Button>}
      />

      <div className="cb-row between wrap" style={{ gap: 14, marginBottom: 26 }}>
        <ChipGroup options={filters} value={filter} onChange={(o) => setFilter(o.id)} />
        <span className="tiny dim">Open daily {BOOKING_RULES.openingTime} – {BOOKING_RULES.closingTime}</span>
      </div>

      <div className="cb-stack" style={{ gap: 20 }}>
        {list.map((f) => (
          <Card key={f.id} glass id={f.id} className="cb-facility-row" style={{ padding: 0 }}>
            <div className="product-thumb">
              <img src={f.image} alt={f.name} loading="lazy" />
            </div>
            <div style={{ padding: 24 }}>
              <div className="cb-row between wrap" style={{ gap: 12 }}>
                <div className="cb-row" style={{ gap: 12 }}>
                  <span className="stat-icon" style={{ color: f.accent }}><Icon name={f.icon} size={19} /></span>
                  <div>
                    <h3>{f.name}</h3>
                    <div className="tiny dim">{f.courts > 1 ? `${f.courts} courts` : 'Single venue'} · {f.hours}</div>
                  </div>
                </div>
                <div className="cb-row" style={{ gap: 8 }}>
                  <Badge tone={f.availabilityTone.replace('badge-', '')}>{f.availability}</Badge>
                  <span className="cb-row tiny" style={{ gap: 4, color: '#fbbf24' }}><Icon name="Star" size={13} /> {f.rating}</span>
                </div>
              </div>

              <p className="small" style={{ marginTop: 14 }}>{f.description}</p>

              <div className="pill-row" style={{ marginTop: 14 }}>
                {f.tags.map((t) => (
                  <span key={t} className="chip" style={{ cursor: 'default' }}>{t}</span>
                ))}
              </div>

              <div className="cb-row between wrap" style={{ gap: 12, marginTop: 20 }}>
                <div className="cb-row" style={{ gap: 20 }}>
                  {f.peakPrice > 0 ? (
                    <>
                      <div>
                        <div className="tiny dim">Off-peak</div>
                        <div className="semibold text-electric">₹{f.offPeakPrice}/hr</div>
                      </div>
                      <div>
                        <div className="tiny dim">Peak</div>
                        <div className="semibold">₹{f.peakPrice}/hr</div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="tiny dim">Access</div>
                      <div className="semibold text-success">Included with membership</div>
                    </div>
                  )}
                </div>

                {playIds.includes(f.id) ? (
                  <Button icon="CalendarDays" as={Link} to="/login" iconRight="ArrowRight">Book this facility</Button>
                ) : (
                  <Button variant="outline" icon="ArrowRight" as={Link} to={f.id === 'shop' ? '/shop' : '/cafeteria'}>
                    {f.id === 'shop' ? 'Visit the shop' : 'Explore the cafeteria'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="cb-section" style={{ paddingBottom: 0 }}>
        <SectionHeading eyebrow="Social play" title="Join a shared court" subtitle="Prefer company? Join a social session and split the court with other members." />
        <div className="cb-grid cols-2">
          <Card glass>
            <CardTitle icon="Users" title="Upcoming social sessions" hint="Shared-court social play" />
            <div className="cb-stack" style={{ gap: 12 }}>
              {socialPlaySessions.map((s) => (
                <div key={s.id} className="cb-row between wrap" style={{ gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(38,50,71,0.5)' }}>
                  <div>
                    <div className="small semibold">{s.title}</div>
                    <div className="tiny dim">{s.day} · {s.time} · {s.level} · ₹{s.fee} per player</div>
                  </div>
                  <div className="cb-row" style={{ gap: 10 }}>
                    <span className="tiny mono dim">{s.joined}/{s.capacity} joined</span>
                    <Button size="sm" variant="outline" as={Link} to="/login">Join</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card glass>
            <CardTitle icon="Info" title="Booking rules" hint="How sessions work at ClubBloom" />
            <div className="cb-stack" style={{ gap: 12 }}>
              {[
                { icon: 'Timer', text: `Every session lasts exactly ${BOOKING_RULES.sessionMinutes} minutes.` },
                { icon: 'CalendarClock', text: `New start times open on a ${BOOKING_RULES.slotStepMinutes}-minute grid.` },
                { icon: 'Repeat', text: `A member may book at most ${BOOKING_RULES.maxBookingsPerDay} sessions per day.` },
                { icon: 'Ban', text: 'Double booking is blocked — unavailable slots are clearly marked.' },
              ].map((r) => (
                <div key={r.text} className="cb-row" style={{ gap: 11, alignItems: 'flex-start' }}>
                  <span className="stat-icon" style={{ width: 32, height: 32, borderRadius: 10, flex: 'none' }}><Icon name={r.icon} size={14} /></span>
                  <span className="small muted">{r.text}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <InfoNote icon="RotateCcw">{refundPolicyNote}</InfoNote>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
