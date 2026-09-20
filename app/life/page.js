'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

export default function LifePage() {
  // Voice training log state (stored locally or combined with notes/reviews)
  const [voiceLogs, setVoiceLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('life_voice_logs');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      { id: '1', date: '2026-09-19', topic: 'Startup Pitch Delivery & Tone Control', duration: '5 min', rating: 8, notes: 'Good pacing, reduced filler words. Need slower cadence on key value propositions.' },
      { id: '2', date: '2026-09-17', topic: 'Technical Explanation of Attention Mechanism', duration: '8 min', rating: 7, notes: 'Clear technical breakdown. Work on vocal projection and ending sentences firmly.' },
    ];
  });

  // Gym / Fitness log state
  const [workoutLogs, setWorkoutLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('life_workout_logs');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      { id: '1', date: '2026-09-19', type: 'Upper Body & Core', duration: '45m', energy: 'High', completed: true },
      { id: '2', date: '2026-09-18', type: 'Legs & Mobility', duration: '50m', energy: 'Medium', completed: true },
      { id: '3', date: '2026-09-16', type: 'Push (Chest/Shoulders/Triceps)', duration: '50m', energy: 'High', completed: true },
    ];
  });

  // Daily Habits check-in for today
  const [todayHabits, setTodayHabits] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('life_today_habits_2026_09_20');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      morningRoutine: true,
      voicePractice: false,
      gymSession: false,
      gateStudy3h: false,
      reading20m: false,
      noLateScreen: false,
    };
  });

  const [activeTab, setActiveTab] = useState('habits'); // 'habits', 'voice', 'fitness'
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  const [voiceForm, setVoiceForm] = useState({
    topic: '',
    duration: '',
    rating: 8,
    notes: '',
  });

  const [workoutForm, setWorkoutForm] = useState({
    type: 'Push / Upper',
    duration: '45m',
    energy: 'High',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('life_voice_logs', JSON.stringify(voiceLogs));
    }
  }, [voiceLogs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('life_workout_logs', JSON.stringify(workoutLogs));
    }
  }, [workoutLogs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('life_today_habits_2026_09_20', JSON.stringify(todayHabits));
    }
  }, [todayHabits]);

  function toggleHabit(key) {
    setTodayHabits(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleAddVoice(e) {
    e.preventDefault();
    if (!voiceForm.topic.trim()) return;
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      ...voiceForm,
    };
    setVoiceLogs([newEntry, ...voiceLogs]);
    setShowVoiceModal(false);
    setVoiceForm({ topic: '', duration: '', rating: 8, notes: '' });
  }

  function handleAddWorkout(e) {
    e.preventDefault();
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      completed: true,
      ...workoutForm,
    };
    setWorkoutLogs([newEntry, ...workoutLogs]);
    setShowWorkoutModal(false);
    setWorkoutForm({ type: 'Push / Upper', duration: '45m', energy: 'High' });
  }

  const completedHabitsCount = Object.values(todayHabits).filter(Boolean).length;
  const totalHabitsCount = Object.keys(todayHabits).length;
  const habitPct = Math.round((completedHabitsCount / totalHabitsCount) * 100);

  return (
    <AppShell>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>Life, Voice & Fitness OS</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Voice articulation, physical peak state, sleep consistency & daily rituals
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'habits', label: '⚡ Daily Rituals & Energy' },
          { key: 'voice', label: '🎙️ Voice & Communication' },
          { key: 'fitness', label: '🏋️ Gym & Fitness' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === t.key ? 'var(--text)' : 'var(--surface-2)',
              color: activeTab === t.key ? 'var(--bg)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DAILY HABITS & RITUALS */}
      {activeTab === 'habits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Daily Progress Card */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800 }}>Today&apos;s Core Non-Negotiables</h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  20 September 2026 · {completedHabitsCount}/{totalHabitsCount} Completed
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: habitPct === 100 ? 'var(--green)' : 'var(--text)' }}>
                {habitPct}%
              </div>
            </div>

            <div style={{ width: '100%', height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ width: `${habitPct}%`, height: '100%', background: habitPct === 100 ? 'var(--green)' : 'var(--blue)', transition: 'width 0.3s ease' }} />
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { key: 'morningRoutine', label: 'Morning Startup Routine (Hydrate, sunlight, plan review)', icon: '☀️' },
                { key: 'gateStudy3h', label: 'GATE Deep Work Block (Min 2.5 - 3 hours focused)', icon: '🎯' },
                { key: 'voicePractice', label: 'Voice & Articulation Practice (5-10 min recording)', icon: '🎙️' },
                { key: 'gymSession', label: 'Gym / Physical Workout Session', icon: '🏋️' },
                { key: 'reading20m', label: 'Active Book Reading (20 min + extract 1 insight)', icon: '📚' },
                { key: 'noLateScreen', label: 'Evening Wind-Down & No Late High-Stimulation Screens', icon: '🌙' },
              ].map(h => (
                <div
                  key={h.key}
                  onClick={() => toggleHabit(h.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: todayHabits[h.key] ? 'var(--green-bg)' : 'var(--surface-2)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: todayHabits[h.key] ? 'none' : '1.5px solid var(--border)',
                      background: todayHabits[h.key] ? 'var(--green)' : 'transparent',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {todayHabits[h.key] ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: todayHabits[h.key] ? 'var(--text)' : 'var(--text-secondary)', textDecoration: todayHabits[h.key] ? 'line-through' : 'none' }}>
                    {h.icon} {h.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Philosophy / Mindset Guidelines */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--yellow)' }}>⚡ Personal Operating Principles</h3>
            <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li><strong>Clarity over Rush:</strong> Do the single most important academic/startup MIT first before checking feeds.</li>
              <li><strong>Physical Readiness:</strong> Gym consistency directly fuels cognitive stamina for complex coding and math.</li>
              <li><strong>Deliberate Articulation:</strong> Speak with intention, clear cadence, and structured thought in all meetings.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: VOICE & COMMUNICATION */}
      {activeTab === 'voice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Voice Practice & Speech Log</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Daily deliberate practice of tone, cadence, and conciseness</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowVoiceModal(true)}>+ Log Session</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {voiceLogs.map(log => (
              <div key={log.id} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.date} · {log.duration}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{log.topic}</h3>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 10, background: 'var(--purple-bg)', color: 'var(--purple)' }}>
                    Rating: {log.rating}/10
                  </span>
                </div>
                {log.notes && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '8px 10px', borderRadius: 6 }}>
                    💬 {log.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FITNESS */}
      {activeTab === 'fitness' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Gym & Workout Tracker</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Physical consistency, workout splits & recovery</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowWorkoutModal(true)}>+ Log Workout</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {workoutLogs.map(log => (
              <div key={log.id} className="card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--green)', fontWeight: 800 }}>✓</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{log.type}</h3>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {log.date} · Duration: {log.duration}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: 'var(--green-bg)', color: 'var(--green)' }}>
                  Energy: {log.energy}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Modal */}
      {showVoiceModal && (
        <div className="modal-backdrop" onClick={() => setShowVoiceModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Log Voice Session</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowVoiceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddVoice} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Topic / Speech Practiced *</label>
                <input
                  className="input"
                  required
                  placeholder="e.g. 3-Minute Elevator Pitch / Viva Explanation"
                  value={voiceForm.topic}
                  onChange={e => setVoiceForm({ ...voiceForm, topic: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Duration</label>
                  <input
                    className="input"
                    placeholder="e.g. 5 min"
                    value={voiceForm.duration}
                    onChange={e => setVoiceForm({ ...voiceForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Self Rating (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="input"
                    value={voiceForm.rating}
                    onChange={e => setVoiceForm({ ...voiceForm, rating: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Observations & Feedback</label>
                <textarea
                  className="input textarea"
                  rows={3}
                  placeholder="What went well? Where was hesitation? Vocal pace and clarity..."
                  value={voiceForm.notes}
                  onChange={e => setVoiceForm({ ...voiceForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowVoiceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workout Modal */}
      {showWorkoutModal && (
        <div className="modal-backdrop" onClick={() => setShowWorkoutModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Log Workout</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowWorkoutModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddWorkout} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Workout Type / Split *</label>
                <select
                  className="input select"
                  value={workoutForm.type}
                  onChange={e => setWorkoutForm({ ...workoutForm, type: e.target.value })}
                >
                  <option value="Push (Chest / Shoulders / Triceps)">Push (Chest / Shoulders / Triceps)</option>
                  <option value="Pull (Back / Biceps / Rear Delts)">Pull (Back / Biceps / Rear Delts)</option>
                  <option value="Legs & Core">Legs & Core</option>
                  <option value="Upper Body Hypertrophy">Upper Body Hypertrophy</option>
                  <option value="Full Body & Conditioning">Full Body & Conditioning</option>
                  <option value="Cardio & Mobility">Cardio & Mobility</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Duration</label>
                  <input
                    className="input"
                    placeholder="e.g. 50m"
                    value={workoutForm.duration}
                    onChange={e => setWorkoutForm({ ...workoutForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Energy Level</label>
                  <select
                    className="input select"
                    value={workoutForm.energy}
                    onChange={e => setWorkoutForm({ ...workoutForm, energy: e.target.value })}
                  >
                    <option value="High">⚡ High</option>
                    <option value="Medium">⚡ Medium</option>
                    <option value="Low">💤 Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWorkoutModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Workout</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
