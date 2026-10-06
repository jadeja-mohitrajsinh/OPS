import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Meeting from '@/models/Meeting';
import Person from '@/models/Person';
import Project from '@/models/Project';
import Note from '@/models/Note';
import Review from '@/models/Review';
import Goal from '@/models/Goal';
import Decision from '@/models/Decision';
import { requireSession } from '@/lib/require-session';

export async function POST(request) {
  const { session, response } = await requireSession(request);
  if (response) return response;

  try {
    await dbConnect();

    // Delete all user data from all collections
    const deleteResult = {
      tasks: await Task.deleteMany({ userId: session.userId }),
      meetings: await Meeting.deleteMany({ userId: session.userId }),
      people: await Person.deleteMany({ userId: session.userId }),
      projects: await Project.deleteMany({ userId: session.userId }),
      notes: await Note.deleteMany({ userId: session.userId }),
      reviews: await Review.deleteMany({ userId: session.userId }),
      goals: await Goal.deleteMany({ userId: session.userId }),
      decisions: await Decision.deleteMany({ userId: session.userId }),
    };

    const totalDeleted = Object.values(deleteResult).reduce((sum, result) => sum + (result.deletedCount || 0), 0);

    return NextResponse.json({
      success: true,
      message: `Database cleaned successfully. Deleted ${totalDeleted} documents.`,
      details: deleteResult,
    });
  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
