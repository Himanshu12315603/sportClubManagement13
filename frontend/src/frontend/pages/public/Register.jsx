import { Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';
import RegisterForm from './auth/RegisterForm';

export default function Register() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(at 10% 20%, rgba(221, 245, 236, 0.7) 0px, transparent 50%), radial-gradient(at 90% 80%, rgba(22, 160, 133, 0.08) 0px, transparent 50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          background: '#ffffff',
          borderRadius: 20,
          padding: '36px 34px',
          boxShadow: '0 12px 36px -4px rgba(23, 43, 77, 0.1), 0 4px 12px -2px rgba(23, 43, 77, 0.05)',
          border: '1.5px solid #e2e8f0',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 46,
              height: 46,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #16a085 0%, #10b981 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 20px -4px rgba(22, 160, 133, 0.4)',
              marginBottom: 12,
            }}
          >
            <Icon name="Flower2" size={24} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#172b4d', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Create Your Account
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
            Join ClubBloom to reserve courts, enjoy member discounts and track your progress.
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
