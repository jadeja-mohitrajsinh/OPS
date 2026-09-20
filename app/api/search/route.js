import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Meeting from '@/models/Meeting';
import Person from '@/models/Person';
import Project from '@/models/Project';
import Note from '@/models/Note';
import Decision from '@/models/Decision';
import GateSubject from '@/models/GateSubject';
import CollegeSubject from '@/models/CollegeSubject';
import ForgeResearch from '@/models/ForgeResearch';
import Book from '@/models/Book';
import Competitor from '@/models/Competitor';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const regex = new RegExp(q, 'i');

    const [tasks, meetings, people, projects, notes, decisions, gate, college, forge, books, competitors] = await Promise.all([
      Task.find({ $or: [{ name: regex }, { notes: regex }, { tags: regex }] }).limit(5).lean(),
      Meeting.find({ $or: [{ title: regex }, { notes: regex }, { purpose: regex }] }).limit(5).lean(),
      Person.find({ $or: [{ name: regex }, { notes: regex }, { organization: regex }] }).limit(5).lean(),
      Project.find({ $or: [{ name: regex }, { objective: regex }] }).limit(5).lean(),
      Note.find({ $or: [{ title: regex }, { content: regex }] }).limit(5).lean(),
      Decision.find({ $or: [{ decision: regex }, { context: regex }] }).limit(5).lean(),
      GateSubject.find({ name: regex }).limit(3).lean(),
      CollegeSubject.find({ name: regex }).limit(3).lean(),
      ForgeResearch.find({ $or: [{ problem: regex }, { finding: regex }, { insight: regex }] }).limit(5).lean(),
      Book.find({ $or: [{ title: regex }, { author: regex }] }).limit(3).lean(),
      Competitor.find({ $or: [{ name: regex }, { tagline: regex }, { ourDifferentiator: regex }] }).limit(5).lean(),
    ]);

    const results = [
      ...tasks.map(t => ({ ...t, _type: 'task' })),
      ...meetings.map(m => ({ ...m, _type: 'meeting' })),
      ...people.map(p => ({ ...p, _type: 'person' })),
      ...projects.map(p => ({ ...p, _type: 'project' })),
      ...notes.map(n => ({ ...n, _type: 'note' })),
      ...decisions.map(d => ({ ...d, _type: 'decision' })),
      ...gate.map(g => ({ ...g, _type: 'gate' })),
      ...college.map(c => ({ ...c, _type: 'college' })),
      ...forge.map(f => ({ ...f, _type: 'forge' })),
      ...books.map(b => ({ ...b, _type: 'book' })),
      ...competitors.map(c => ({ ...c, _type: 'competitor' })),
    ];

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
