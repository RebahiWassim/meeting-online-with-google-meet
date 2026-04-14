import { useState } from 'react';

interface Props {
  doctorId: string;
  doctorEmail: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateMeetingForm({
  doctorId,
  doctorEmail,
  onSuccess,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientId: '',
    patientEmail: '',
    title: 'Consultation médicale',
    description: '',
    startTime: '',
    endTime: '',
    meetLink: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          doctorId,
          doctorEmail,
          patientId: form.patientId,
          patientEmail: form.patientEmail,
          title: form.title,
          description: form.description,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          meetLink: form.meetLink,
        }),
      });
      if (!res.ok) throw new Error('Erreur création meeting');
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: 'white',
    padding: '10px 14px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#64748b',
    marginBottom: '6px',
  };

  return (
    <div className="rounded-3xl mb-6 overflow-hidden animate-fade-up" style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(14,165,233,0.2)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{
        background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(6,182,212,0.08))',
        borderBottom: '1px solid rgba(14,165,233,0.15)'
      }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(14,165,233,0.2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <h2 className="font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Nouvelle consultation
          </h2>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors text-lg">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="p-3 rounded-xl text-sm" style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444'
          }}>
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>ID du patient</label>
            <input
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="patient-001"
              onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Email du patient</label>
            <input
              name="patientEmail"
              type="email"
              value={form.patientEmail}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="patient@email.com"
              onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Titre</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>

        <div>
          <label style={labelStyle}>Description / Motif</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
            placeholder="Décrivez le motif de la consultation..."
            onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Début</label>
            <input
              name="startTime"
              type="datetime-local"
              value={form.startTime}
              onChange={handleChange}
              required
              style={{ ...inputStyle, colorScheme: 'dark' }}
              onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Fin</label>
            <input
              name="endTime"
              type="datetime-local"
              value={form.endTime}
              onChange={handleChange}
              required
              style={{ ...inputStyle, colorScheme: 'dark' }}
              onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Lien Google Meet</label>
          <div className="flex gap-2">
            <input
              name="meetLink"
              value={form.meetLink}
              onChange={handleChange}
              required
              style={{ ...inputStyle, flex: 1 }}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              onFocus={e => e.target.style.borderColor = 'rgba(14,165,233,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <a
              href="https://meet.google.com/new"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white whitespace-nowrap transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 2px 12px rgba(16,185,129,0.3)'
              }}
            >
              🎥 Créer
            </a>
          </div>
          <p className="text-xs mt-1.5" style={{ color: '#475569' }}>
            Cliquez sur "Créer" pour générer un lien Google Meet, puis collez-le ici.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
            style={{
              background: loading ? 'rgba(14,165,233,0.4)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(14,165,233,0.3)',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Création en cours...
              </span>
            ) : (
              '+ Créer la consultation'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
