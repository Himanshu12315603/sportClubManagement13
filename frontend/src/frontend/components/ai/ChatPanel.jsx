import { useEffect, useRef, useState } from 'react';
import { resolveAnswer } from '../../data/aiResponses';
import { Badge, Button, Card, CardTitle } from '../ui/primitives';
import Icon from '../ui/Icon';

/**
 * ClubBloom AI Assistant Chat Surface.
 * Connected to live club data: courts, inventory, spend, rules.
 */
export default function ChatPanel({ mode = 'customer', suggestions = [], title = 'ClubBloom AI', subtitle }) {
  const initialGreeting =
    mode === 'manager'
      ? 'Welcome, Manager. I can audit revenue trends, court utilization, low-stock inventory, and member retention. Select a prompt or ask any question.'
      : 'Hello! I am your ClubBloom Sports Assistant. I can check open courts, look up your upcoming bookings, recommend gear, or check the cafeteria menu. How can I help today?';

  const [messages, setMessages] = useState([
    {
      id: 'seed',
      role: 'ai',
      text: initialGreeting,
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
    }, 450);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `seed-${Date.now()}`,
        role: 'ai',
        text: initialGreeting,
      },
    ]);
  };

  return (
    <Card
      glass
      glow
      className="cb-chat-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 520,
        background: '#ffffff',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div className="cb-row between" style={{ marginBottom: 14, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <div className="cb-row" style={{ gap: 10 }}>
          <span
            className="stat-icon"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: '#ddf5ec',
              color: '#16a085',
              border: '1px solid #a7f3d0',
            }}
          >
            <Icon name="Sparkles" size={18} />
          </span>
          <div>
            <h4 style={{ color: '#172b4d', margin: 0 }}>{title}</h4>
            <div className="tiny dim">{subtitle || 'Connected to live club data engine'}</div>
          </div>
        </div>

        <div className="cb-row" style={{ gap: 8 }}>
          <Badge tone="active">Connected</Badge>
          <Button size="sm" variant="ghost" icon="RotateCcw" onClick={handleClear} title="Clear conversation">
            Reset
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="cb-stack"
        style={{
          gap: 14,
          flex: 1,
          maxHeight: 460,
          overflowY: 'auto',
          paddingRight: 6,
          marginBottom: 16,
        }}
      >
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.role === 'me' ? 'me' : 'ai'}`}>
            {m.role === 'ai' ? (
              <span
                className="stat-icon"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: '#ddf5ec',
                  color: '#16a085',
                  border: '1px solid #a7f3d0',
                  flex: 'none',
                }}
              >
                <Icon name="Bot" size={14} />
              </span>
            ) : null}
            <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{m.text}</span>
          </div>
        ))}

        {typing ? (
          <div className="chat-bubble ai">
            <span
              className="stat-icon"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: '#ddf5ec',
                color: '#16a085',
                border: '1px solid #a7f3d0',
                flex: 'none',
              }}
            >
              <Icon name="Bot" size={14} />
            </span>
            <div className="cb-row" style={{ gap: 6, color: '#16a085', fontWeight: 600 }}>
              <Icon name="Loader" size={14} className="anim-spin-slow" />
              <span>Checking live club records…</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Suggested Query Chips */}
      <div style={{ marginBottom: 14 }}>
        <div className="tiny dim semibold" style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Suggested Prompts:
        </div>
        <div className="pill-row" style={{ gap: 8 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              onClick={() => send(s)}
              disabled={typing}
              style={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="cb-row" style={{ gap: 10 }}>
        <input
          className="input"
          value={input}
          placeholder="Ask about courts, spend, orders, or plans…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !typing) send();
          }}
          style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            padding: '12px 16px',
            fontSize: '0.92rem',
          }}
        />
        <Button
          variant="primary"
          icon="Send"
          onClick={() => send()}
          disabled={typing || !input.trim()}
          style={{ padding: '12px 20px' }}
        >
          Send
        </Button>
      </div>
    </Card>
  );
}
