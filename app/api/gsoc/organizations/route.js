import dbConnect from '@/lib/mongodb';
import GSoCOrganization from '@/models/GSoCOrganization';

export async function GET() {
  try {
    await dbConnect();
    const organizations = await GSoCOrganization.find()
      .populate('repositories')
      .populate('contributions')
      .populate('communityInteractions')
      .sort({ status: 1, name: 1 })
      .lean();
    return Response.json({ success: true, data: organizations });
  } catch (error) {
    console.error('GSoC Organizations API Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const organization = await GSoCOrganization.create({
      ...body,
      currentGate: 'L1',
      timelineGates: [{
        gate: 'L1',
        gateName: 'Organization Research',
        startDate: new Date(),
        status: 'IN_PROGRESS',
        criteria: ['Research organization', 'Read documentation', 'Explore repositories']
      }],
      readinessChecklist: body.readinessChecklist || {
        readOrganizationWebsite: false,
        readContributionGuide: false,
        readPreviousGSoCProjects: false,
        readProjectIdeas: false,
        cloneRepository: false,
        runRepositoryLocally: false,
        understandArchitecture: false,
        readDocumentation: false,
        findBeginnerIssues: false,
        investigateIssue: false,
        participateInDiscussion: false,
        makeFirstContribution: false,
        makeMeaningfulContribution: false,
        understandPotentialGSoCProject: false,
        discussProjectWithCommunity: false
      }
    });

    return Response.json({ success: true, data: organization });
  } catch (error) {
    console.error('GSoC Organizations Create Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}