import { useEffect, useRef, useState } from 'react';
import { resolveAnswer, aiDisclosure } from '../../data/aiResponses';
import { Badge, Button, Card, CardTitle, InfoNote } from '../ui/primitives';
import Icon from '../ui/Icon';

/**
 * ClubBloom AI chat surface.
 *
 * This is a locally-resolved, rule-based assistant — there is NO model call.
 * Swap `resolveAnswer` for a real backend request via `services/api.js` later.
 */
export default function ChatPanel({ mode = 'customer', suggestions = [], title = 'ClubBloom AI', subtitle }) {
  const [messages, setMessages] = useState([
    {
      id: 'seed',
      role: 'ai',
      text:
        mode === 'manager'
          ? 'Hello! I can analyse revenue, retention, court utilisation and inventory. Pick a question below or ask your own.'
          : 'Hi! I can help you pick a sport, find a court, compare membership plans or explain your virtual garden. What would you like to know?',
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = (text) => {
    const question = (text ?? input).trim();
    if (!question) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'me', text: question }]);
    setInput('');
    setTyping(true);
    window.setTimeout(() => {
      const answer = resolveAnswer({ message: question, mode });
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'ai', text: answer }]);
      setTyping(false);
    }, 550);
  };

  return (
    <Card glass glow className="cb-chat-card">
      <CardTitle
        icon="Bot"
        title={title}
        hint={subtitle || 'Answers generated locally from club data'}
        right={<Badge tone="info">Offline demo</Badge>}
      />

      <div
        ref={scrollRef}
        className="cb-stack"
        style={{ gap: 14, maxHeight: 460, overflowY: 'auto', paddingRight: 6, marginBottom: 14 }}
      >
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.role === 'me' ? 'me' : 'ai'}`}>
            {m.role === 'ai' ? (
              <span className="stat-icon" style={{ width: 26, height: 26, borderRadius: 8, flex: 'none' }}>
                <Icon name="Bot" size={13} />
              </span>
            ) : null}
            <span style={{ whiteSpace: 'pre-wrap' }}>{m.text}</span>
          </div>
        ))}
        {typing ? (
          <div className="chat-bubble ai">
            <span className="stat-icon" style={{ width: 26, height: 26, borderRadius: 8, flex: 'none' }}>
              <Icon name="Bot" size={13} />
            </span>
            <span className="anim-blink">Thinking…</span>
          </div>
        ) : null}
      </div>

      <div className="pill-row" style={{ marginBottom: 12 }}>
        {suggestions.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => send(s)} disabled={typing}>
            {s}
          </button>
        ))}
      </div>

      <div className="cb-row" style={{ gap: 10 }}>
        <input
          className="input"
          value={input}
          placeholder="Ask ClubBloom AI…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !typing) send();
          }}
        />
        <Button icon="Send" onClick={() => send()} disabled={typing || !input.trim()}>
          Send
        </Button>
      </div>

      <div style={{ marginTop: 14 }}>
        <InfoNote icon="Info">{aiDisclosure}</InfoNote>
      </div>
    </Card>
  );
}
