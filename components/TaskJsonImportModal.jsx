'use client';

import { useState, useRef } from 'react';
import AppModal from '@/components/AppModal';

export const TASK_IMPORT_TEMPLATE = [
  {
    "name": "Implement user authentication flow",
    "priority": "P0",
    "area": "Entrepreneur",
    "project": "OPS Platform",
    "deadline": "2026-11-01",
    "estimatedDuration": 60,
    "energyLevel": "HIGH",
    "status": "TODO",
    "tags": ["auth", "security", "backend"],
    "notes": "Integrate JWT and session rotation."
  },
  {
    "name": "Review operating systems lecture 4",
    "priority": "P1",
    "area": "Academic",
    "project": "Semester 5",
    "deadline": "2026-10-30",
    "estimatedDuration": 45,
    "energyLevel": "MEDIUM",
    "status": "TODO",
    "tags": ["college", "os"],
    "notes": "Focus on virtual memory and paging algorithms."
  },
  {
    "name": "Prepare GSoC weekly status update",
    "priority": "P2",
    "area": "Forge",
    "project": "GSoC 2027",
    "deadline": "2026-11-03",
    "estimatedDuration": 30,
    "energyLevel": "LOW",
    "status": "TODO",
    "tags": ["gsoc", "community"],
    "notes": "Summarize PR merges and benchmark runs."
  }
];

export const TASK_AI_PROMPT_TEMPLATE = `You are a productivity task structuring assistant.
Convert the user's tasks or schedule into a valid, strict JSON array conforming to this exact schema for OPS.

### JSON Schema Rules:
- Return ONLY a pure JSON array (e.g. \`[ { ... }, { ... } ]\`) with no markdown fences, no conversational preamble, and no postscript.
- Each object represents a task and supports the following fields:
  1. "name": string (REQUIRED) - concise, actionable description of the task.
  2. "priority": "P0" | "P1" | "P2" | "P3" (Optional, default: "P1")
     - P0: Critical / Blocker
     - P1: Important / High
     - P2: Development / Medium
     - P3: Optional / Backlog
  3. "area": string (Optional, default: "")
     Allowed values: "Academic", "Entrepreneur", "Personal", "GATE", "College", "Forge", "Learning", "Health", "Communication", or ""
  4. "project": string (Optional, default: "") - name of parent project or goal.
  5. "deadline": string in YYYY-MM-DD format, or null (Optional).
  6. "estimatedDuration": number (in minutes, default: 30).
  7. "energyLevel": "LOW" | "MEDIUM" | "HIGH" (Optional, default: "MEDIUM").
  8. "status": "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELLED" (Optional, default: "TODO").
  9. "tags": array of strings (Optional, default: []).
  10. "notes": string (Optional, default: "") - additional context, links, or instructions.
  11. "starred": boolean (Optional, default: false).

### Example JSON output:
${JSON.stringify(TASK_IMPORT_TEMPLATE, null, 2)}

Now convert the following raw tasks or request into this exact JSON array:
[INSERT YOUR RAW TASKS / NOTES HERE]`;

export default function TaskJsonImportModal({ open, onClose, onSuccess }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const fileInputRef = useRef(null);

  // Live validation
  let parsedTasks = [];
  let validationError = '';
  if (jsonText.trim()) {
    try {
      const parsed = JSON.parse(jsonText);
      const items = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.tasks) ? parsed.tasks : null);
      if (!items) {
        validationError = 'JSON must be an array of task objects (or an object with a "tasks" array).';
      } else if (items.length === 0) {
        validationError = 'The task array is empty.';
      } else {
        const missingName = items.findIndex(t => !t || typeof t !== 'object' || !(t.name || t.title)?.trim());
        if (missingName !== -1) {
          validationError = `Task #${missingName + 1} is missing a required "name" or "title".`;
        } else {
          parsedTasks = items;
        }
      }
    } catch (err) {
      validationError = `Invalid JSON syntax: ${err.message}`;
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result || '');
      setError('');
    };
    reader.onerror = () => {
      setError('Could not read file.');
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleLoadTemplate() {
    setJsonText(JSON.stringify(TASK_IMPORT_TEMPLATE, null, 2));
    setError('');
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(TASK_AI_PROMPT_TEMPLATE);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      setError('Failed to copy to clipboard.');
    }
  }

  async function handleImport() {
    if (!parsedTasks.length) {
      setError('Please provide valid task JSON before importing.');
      return;
    }

    setImporting(true);
    setError('');
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedTasks),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to import tasks.');
      }
      setJsonText('');
      onSuccess?.(data.count || parsedTasks.length);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred during import.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <AppModal
      open={open}
      onClose={() => !importing && onClose()}
      title="Import Tasks from JSON"
      size="lg"
      closeOnBackdrop={!importing}
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={importing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleImport}
            disabled={importing || !parsedTasks.length || Boolean(validationError)}
          >
            {importing
              ? 'Importing…'
              : `Import ${parsedTasks.length ? `${parsedTasks.length} ` : ''}Tasks`}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
          Quickly bulk-import tasks using a structured JSON array. You can paste JSON below, upload a <code>.json</code> file, or copy the AI prompt to generate tasks with ChatGPT, Claude, or Gemini.
        </p>

        {/* Action Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleLoadTemplate}
            disabled={importing}
          >
            📄 Load Example Template
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopyPrompt}
            title="Copy prompt for external AI (ChatGPT, Claude, Gemini)"
          >
            {copiedPrompt ? '✓ AI Prompt Copied!' : '🤖 Copy AI Prompt Template'}
          </button>
          <label
            className="btn btn-secondary btn-sm"
            style={{ cursor: 'pointer', margin: 0 }}
          >
            📁 Choose .json File
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </label>
          {jsonText && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => { setJsonText(''); setError(''); }}
              style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Text Area */}
        <div style={{ position: 'relative' }}>
          <textarea
            className="input textarea"
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setError(''); }}
            placeholder={`[\n  {\n    "name": "Complete feature X",\n    "priority": "P1",\n    "area": "Forge",\n    "deadline": "2026-11-01",\n    "estimatedDuration": 45,\n    "tags": ["feature", "ui"]\n  }\n]`}
            rows={10}
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 12.5,
              lineHeight: 1.5,
              whiteSpace: 'pre',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Validation Banner */}
        {validationError && (
          <div style={{
            fontSize: 12,
            padding: '8px 12px',
            borderRadius: 8,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--red)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}>
            ⚠️ {validationError}
          </div>
        )}

        {!validationError && parsedTasks.length > 0 && (
          <div style={{
            fontSize: 12,
            padding: '10px 12px',
            borderRadius: 8,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: 'var(--green)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            <div style={{ fontWeight: 600 }}>
              ✓ Ready to import {parsedTasks.length} task{parsedTasks.length > 1 ? 's' : ''}:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 90, overflowY: 'auto' }}>
              {parsedTasks.slice(0, 10).map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <strong style={{ color: 'var(--accent)' }}>[{t.priority || 'P1'}]</strong> {t.name || t.title}
                </span>
              ))}
              {parsedTasks.length > 10 && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>
                  +{parsedTasks.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {error && (
          <div role="alert" style={{ fontSize: 13, color: 'var(--red)', margin: 0 }}>
            {error}
          </div>
        )}
      </div>
    </AppModal>
  );
}
