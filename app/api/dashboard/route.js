import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Meeting from '@/models/Meeting';
import Person from '@/models/Person';
import { getMITs, getDeadlineCategory, daysUntil } from '@/lib/priority';

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // All active tasks
    const allTasks = await Task.find({ status: { $in: ['TODO', 'IN_PROGRESS', 'BLOCKED'] } }).lean();

    // MITs — top 3 priority tasks
    const mits = getMITs(allTasks, 3);

    // Today's tasks (due today)
    const todayTasks = allTasks.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d >= todayStart && d <= todayEnd;
    });

    // Overdue tasks
    const overdueTasks = allTasks.filter(t => {
      if (!t.deadline) return false;
      return new Date(t.deadline) < todayStart;
    });

    // Upcoming deadlines (next 7 days)
    const upcomingDeadlines = allTasks.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d > todayEnd && d <= in7days;
    }).map(t => ({
      ...t,
      deadlineCategory: getDeadlineCategory(t.deadline),
      daysLeft: daysUntil(t.deadline),
    }));

    // Upcoming meetings
    const upcomingMeetings = await Meeting.find({
      date: { $gte: todayStart },
      status: 'SCHEDULED',
    }).sort({ date: 1 }).limit(5).lean();

    // Next meeting
    const nextMeeting = upcomingMeetings[0] || null;

    // People needing follow-up
    const followUpPeople = await Person.find({
      nextInteraction: { $lte: now },
    }).sort({ nextInteraction: 1 }).limit(5).lean();

    // Blocked tasks
    const blockedTasks = allTasks.filter(t => t.status === 'BLOCKED');

    // Waiting commitments
    const allPeople = await Person.find({}).lean();
    const waitingFor = allPeople.flatMap(p =>
      (p.commitments || [])
        .filter(c => c.type === 'THEY_OWE' && c.status === 'OPEN')
        .map(c => ({ ...c, personName: p.name, personId: p._id }))
    );

    // Stats
    const completedToday = await Task.countDocuments({
      status: 'DONE',
      completedAt: { $gte: todayStart, $lte: todayEnd }
    });

    return NextResponse.json({
      success: true,
      data: {
        mits,
        todayTasks,
        overdueTasks,
        upcomingDeadlines,
        upcomingMeetings,
        nextMeeting,
        followUpPeople,
        blockedTasks,
        waitingFor,
        stats: {
          totalActive: allTasks.length,
          completedToday,
          overdue: overdueTasks.length,
          blocked: blockedTasks.length,
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
