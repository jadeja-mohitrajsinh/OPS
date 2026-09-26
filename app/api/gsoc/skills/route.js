import dbConnect from '@/lib/mongodb';
import GSoCSkill from '@/models/GSoCSkill';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const skills = await GSoCSkill.find(query).sort({ priority: 1, name: 1 }).lean();
    return Response.json({ success: true, data: skills });
  } catch (error) {
    console.error('GSoC Skills API Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const skill = await GSoCSkill.create({
      ...body,
      currentGate: 'L1',
      timelineGates: [{
        gate: 'L1',
        gateName: 'Foundation & Learning',
        startDate: new Date(),
        status: 'IN_PROGRESS',
        criteria: ['Complete basic learning', 'Start building evidence']
      }]
    });

    return Response.json({ success: true, data: skill });
  } catch (error) {
    console.error('GSoC Skills Create Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}