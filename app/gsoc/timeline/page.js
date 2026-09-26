'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';

export default function TimelinePage() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadTimeline() {
    try {
      // Fetch all relevant data to build timeline
      const [skillsRes, projectsRes, contributionsRes, experimentsRes, interactionsRes] = await Promise.all([
        fetch('/api/gsoc/skills'),
        fetch('/api/gsoc/projects'),
        fetch('/api/gsoc/contributions'),
        fetch('/api/gsoc/experiments'),
        fetch('/api/gsoc/community')
      ]);

      const [skills, projects, contributions, experiments, interactions] = await Promise.all([
        skillsRes.json(),
        projectsRes.json(),
        contributionsRes.json(),
        experimentsRes.json(),
        interactionsRes.json()
      ]);

      // Build timeline events
      const events = [];

      // Skills
      if (skills.success) {
        skills.data.forEach(skill => {
          if (skill.evidenceLevel?.dateAchieved) {
            events.push({
              type: 'skill',
              date: new Date(skill.evidenceLevel.dateAchieved),
              title: `Achieved ${skill.name}`,
              description: skill.evidenceLevel.evidence,
              level: skill.evidenceLevel.level,
              url: skill.evidenceLevel.url
            });
          }
        });
      }

      // Projects
      if (projects.success) {
        projects.data.forEach(project => {
          if (project.startDate) {
            events.push({
              type: 'project_start',
              date: new Date(project.startDate),
              title: `Started ${project.name}`,
              description: project.problem,
              domain: project.domain
            });
          }
          if (project.endDate) {
            events.push({
              type: 'project_complete',
              date: new Date(project.endDate),
              title: `Completed ${project.name}`,
              description: `${project.domain} project`,
              url: project.repository
            });
          }
        });
      }

      // Contributions
      if (contributions.success) {
        contributions.data.forEach(contribution => {
          if (contribution.date) {
            events.push({
              type: 'contribution',
              date: new Date(contribution.date),
              title: contribution.status === 'MERGED' ? `Merged PR: ${contribution.issueTitle}` : `Contribution: ${contribution.issueTitle}`,
              description: `${contribution.contributionType} for ${contribution.organization || 'organization'}`,
              status: contribution.status,
              url: contribution.prUrl || contribution.issueUrl
            });
          }
        });
      }

      // Experiments
      if (experiments.success) {
        experiments.data.forEach(experiment => {
          if (experiment.startDate) {
            events.push({
              type: 'experiment_start',
              date: new Date(experiment.startDate),
              title: `Experiment: ${experiment.experimentId}`,
              description: experiment.hypothesis,
              status: experiment.status
            });
          }
          if (experiment.endDate) {
            events.push({
              type: 'experiment_complete',
              date: new Date(experiment.endDate),
              title: `Completed ${experiment.experimentId}`,
              description: experiment.conclusion || 'Experiment completed',
              url: experiment.notebook
            });
          }
        });
      }

      // Community Interactions
      if (interactions.success) {
        interactions.data.forEach(interaction => {
          if (interaction.date) {
            events.push({
              type: 'community',
              date: new Date(interaction.date),
              title: `${interaction.platform} Interaction`,
              description: interaction.topic,
              platform: interaction.platform,
              url: interaction.url
            });
          }
        });
      }

      // Sort by date
      events.sort((a, b) => b.date - a.date);

      setTimeline(events);
    } catch (e) {
      console.error('Failed to load timeline:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadTimeline(); }, []);

  // Group events by month
  const groupedTimeline = timeline.reduce((acc, event) => {
    const monthKey = event.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(event);
    return acc;
  }, {});

  const getEventIcon = (type) => {
    const icons = {
      skill: '🎯',
      project_start: '🚀',
      project_complete: '✅',
      contribution: '🔧',
      experiment_start: '🧪',
      experiment_complete: '📊',
      community: '💬'
    };
    return icons[type] || '📌';
  };

  const getEventColor = (type) => {
    const colors = {
      skill: 'var(--blue)',
      project_start: 'var(--orange)',
      project_complete: 'var(--green)',
      contribution: 'var(--purple)',
      experiment_start: 'var(--yellow)',
      experiment_complete: 'var(--green)',
      community: 'var(--cyan)'
    };
    return colors[type] || 'var(--text)';
  };

  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Evidence Timeline</h1>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Chronological view of your GSoC preparation journey
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner" /></div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{timeline.length}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Events</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>
                  {timeline.filter(e => e.type === 'project_complete').length}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Projects Completed</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--blue)' }}>
                  {timeline.filter(e => e.type === 'contribution' && e.status === 'MERGED').length}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Merged PRs</div>
              </div>
              <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--yellow)' }}>
                  {timeline.filter(e => e.type === 'experiment_complete').length}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Experiments</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {timeline.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">No timeline events yet</div>
              <div className="empty-state-desc">Start adding skills, projects, and contributions to build your timeline</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {Object.entries(groupedTimeline).map(([month, events]) => (
                <div key={month}>
                  <div className="section-label">{month.toUpperCase()}</div>
                  <div style={{ 
                    position: 'relative',
                    paddingLeft: 24,
                    borderLeft: '2px solid var(--border-subtle)'
                  }}>
                    {events.map((event, index) => (
                      <div key={index} style={{ 
                        position: 'relative',
                        marginBottom: 16,
                        paddingBottom: 16,
                        borderBottom: index < events.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                      }}>
                        {/* Timeline dot */}
                        <div style={{
                          position: 'absolute',
                          left: -29,
                          top: 4,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: getEventColor(event.type),
                          border: '3px solid var(--surface-1)'
                        }} />

                        <div className="card" style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 18 }}>{getEventIcon(event.type)}</span>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{event.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  {event.date.toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            {event.url && (
                              <a 
                                href={event.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ fontSize: 12, color: 'var(--blue)' }}
                              >
                                🔗
                              </a>
                            )}
                          </div>
                          {event.description && (
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                              {event.description}
                            </div>
                          )}
                          {event.level && (
                            <div style={{ marginTop: 8 }}>
                              <span style={{ 
                                fontSize: 11, 
                                fontWeight: 600, 
                                padding: '2px 8px', 
                                borderRadius: 'var(--r-full)', 
                                background: 'var(--surface-2)',
                                color: 'var(--text-muted)'
                              }}>
                                Level: {event.level}
                              </span>
                            </div>
                          )}
                          {event.status && (
                            <div style={{ marginTop: 8 }}>
                              <span style={{ 
                                fontSize: 11, 
                                fontWeight: 600, 
                                padding: '2px 8px', 
                                borderRadius: 'var(--r-full)', 
                                background: event.status === 'MERGED' ? 'var(--green-bg)' : 'var(--surface-2)',
                                color: event.status === 'MERGED' ? 'var(--green)' : 'var(--text-muted)'
                              }}>
                                {event.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
