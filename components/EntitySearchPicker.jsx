'use client';
import { useState, useEffect } from 'react';

const ENTITY_TYPES = {
  SKILL: { label: 'Skill', color: 'var(--blue)', endpoint: 'skills' },
  PROJECT: { label: 'Project', color: 'var(--green)', endpoint: 'projects' },
  EXPERIMENT: { label: 'Experiment', color: 'var(--purple)', endpoint: 'experiments' },
  CONTRIBUTION: { label: 'Contribution', color: 'var(--orange)', endpoint: 'contributions' },
  COMMUNITY: { label: 'Community', color: 'var(--yellow)', endpoint: 'community' },
  DATASET: { label: 'Dataset', color: 'var(--red)', endpoint: 'datasets' }
};

const EVIDENCE_LEVELS = {
  NONE: { color: 'var(--text-muted)', label: 'None' },
  WEAK: { color: 'var(--red)', label: 'Weak' },
  BASIC: { color: 'var(--orange)', label: 'Basic' },
  GOOD: { color: 'var(--yellow)', label: 'Good' },
  STRONG: { color: 'var(--green)', label: 'Strong' },
  EXCELLENT: { color: 'var(--blue)', label: 'Excellent' }
};

export default function EntitySearchPicker({ 
  label, 
  value = [], 
  onChange, 
  allowedTypes = ['SKILL', 'PROJECT', 'EXPERIMENT', 'CONTRIBUTION', 'COMMUNITY', 'DATASET'],
  placeholder = "Search and select entities...",
  excludeIds = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState([]);

  // Load selected entities on mount and when value changes
  useEffect(() => {
    if (value && value.length > 0) {
      loadSelectedEntities(value);
    } else {
      setSelectedEntities([]);
    }
  }, [value]);

  async function loadSelectedEntities(ids) {
    try {
      const entities = await Promise.all(
        ids.map(async (id) => {
          // Try each endpoint to find the entity
          for (const type of allowedTypes) {
            try {
              const res = await fetch(`/api/gsoc/${ENTITY_TYPES[type].endpoint}/${id}`);
              if (res.ok) {
                const json = await res.json();
                if (json.data) {
                  return { ...json.data, entityType: type };
                }
              }
            } catch (e) {
              // Continue to next endpoint
            }
          }
          return null;
        })
      );
      setSelectedEntities(entities.filter(e => e !== null));
    } catch (e) {
      console.error('Failed to load selected entities:', e);
    }
  }

  async function searchEntities(query) {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.all(
        allowedTypes.map(async (type) => {
          try {
            const res = await fetch(`/api/gsoc/${ENTITY_TYPES[type].endpoint}?search=${encodeURIComponent(query)}`);
            if (res.ok) {
              const json = await res.json();
              return (json.data || []).map(entity => ({ ...entity, entityType: type }));
            }
          } catch (e) {
            console.error(`Failed to search ${type}:`, e);
          }
          return [];
        })
      );
      
      const allResults = results.flat().filter(entity => 
        !excludeIds.includes(entity._id) && 
        !selectedEntities.some(s => s._id === entity._id)
      );
      
      setSearchResults(allResults);
    } catch (e) {
      console.error('Failed to search entities:', e);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchEntities(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  function handleSelect(entity) {
    const newSelected = [...selectedEntities, entity];
    setSelectedEntities(newSelected);
    onChange(newSelected.map(e => e._id));
    setSearchQuery('');
    setSearchResults([]);
  }

  function handleRemove(entityId) {
    const newSelected = selectedEntities.filter(e => e._id !== entityId);
    setSelectedEntities(newSelected);
    onChange(newSelected.map(e => e._id));
  }

  function getDisplayValue(entity) {
    switch (entity.entityType) {
      case 'SKILL':
        return entity.name;
      case 'PROJECT':
        return entity.name;
      case 'EXPERIMENT':
        return entity.experimentId || entity.hypothesis?.substring(0, 30);
      case 'CONTRIBUTION':
        return entity.title;
      case 'COMMUNITY':
        return entity.topic;
      case 'DATASET':
        return entity.name;
      default:
        return entity.name || entity.title || entity.topic;
    }
  }

  function getEvidenceLevel(entity) {
    if (entity.evidenceLevel?.level) {
      return EVIDENCE_LEVELS[entity.evidenceLevel.level];
    }
    if (entity.evidenceLevel) {
      return EVIDENCE_LEVELS[entity.evidenceLevel];
    }
    return EVIDENCE_LEVELS.NONE;
  }

  function getStatus(entity) {
    if (entity.status) return entity.status;
    return 'N/A';
  }

  return (
    <div className="form-group">
      <label className="label">{label}</label>
      
      {/* Selected Entities */}
      {selectedEntities.length > 0 && (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 8, 
          marginBottom: 12,
          padding: 8,
          backgroundColor: 'var(--surface-2)',
          borderRadius: 6
        }}>
          {selectedEntities.map(entity => (
            <div
              key={entity._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                backgroundColor: 'var(--surface-3)',
                borderRadius: 4,
                fontSize: 12
              }}
            >
              <span style={{ 
                color: ENTITY_TYPES[entity.entityType].color,
                fontWeight: 600
              }}>
                {ENTITY_TYPES[entity.entityType].label}
              </span>
              <span style={{ color: 'var(--text)' }}>
                {getDisplayValue(entity)}
              </span>
              <span 
                style={{ 
                  color: getEvidenceLevel(entity).color,
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 3,
                  backgroundColor: 'var(--surface-4)'
                }}
              >
                {getEvidenceLevel(entity).label}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(entity._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
        
        {/* Dropdown */}
        {isOpen && (searchResults.length > 0 || loading) && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            marginTop: 4,
            maxHeight: 300,
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {loading ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
                No results found
              </div>
            ) : (
              searchResults.map(entity => (
                <div
                  key={entity._id}
                  onClick={() => handleSelect(entity)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    ':hover': {
                      backgroundColor: 'var(--surface-3)'
                    }
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ 
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    backgroundColor: ENTITY_TYPES[entity.entityType].color + '20',
                    color: ENTITY_TYPES[entity.entityType].color
                  }}>
                    {ENTITY_TYPES[entity.entityType].label}
                  </span>
                  <span style={{ flex: 1, color: 'var(--text)', fontSize: 13 }}>
                    {getDisplayValue(entity)}
                  </span>
                  <span style={{ 
                    color: getEvidenceLevel(entity).color,
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 3,
                    backgroundColor: 'var(--surface-4)'
                  }}>
                    {getEvidenceLevel(entity).label}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
