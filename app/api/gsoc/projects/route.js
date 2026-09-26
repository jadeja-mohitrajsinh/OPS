import dbConnect from '@/lib/mongodb';
import GSoCProject from '@/models/GSoCProject';

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
          { problem: { $regex: search, $options: 'i' } },
          { domain: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const projects = await GSoCProject.find(query)
      .populate('relatedSkills')
      .populate('experiments')
      .sort({ status: 1, name: 1 })
      .lean();
    return Response.json({ success: true, data: projects });
  } catch (error) {
    console.error('GSoC Projects API Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const project = await GSoCProject.create({
      ...body,
      currentGate: 'L1',
      timelineGates: [{
        gate: 'L1',
        gateName: 'Project Planning',
        startDate: new Date(),
        status: 'IN_PROGRESS',
        criteria: ['Define problem', 'Choose approach', 'Plan implementation']
      }],
      qualityChecklist: body.qualityChecklist || {
        clearProblemStatement: false,
        datasetDocumented: false,
        baselineImplemented: false,
        modelImplemented: false,
        evaluationMetrics: false,
        experimentComparison: false,
        errorAnalysis: false,
        reproducibleEnvironment: false,
        tests: false,
        readme: false,
        resultsDocumented: false,
        githubRepository: false,
        demo: false
      }
    });

    return Response.json({ success: true, data: project });
  } catch (error) {
    console.error('GSoC Projects Create Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}