import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import GSoCEvidenceRequirement from '@/models/GSoCEvidenceRequirement';

export async function GET() {
  try {
    await clientPromise();
    const evidence = await GSoCEvidenceRequirement.find({});
    
    // Convert to object keyed by requirementId
    const evidenceMap = {};
    evidence.forEach(e => {
      evidenceMap[e.requirementId] = {
        level: e.level,
        description: e.description,
        url: e.url,
        notes: e.notes,
        missingAction: e.missingAction
      };
    });
    
    return NextResponse.json({ success: true, data: evidenceMap });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await clientPromise();
    const body = await request.json();
    
    const evidence = await GSoCEvidenceRequirement.findOneAndUpdate(
      { requirementId: body.requirementId },
      {
        requirementId: body.requirementId,
        level: body.level,
        description: body.description,
        url: body.url,
        notes: body.notes,
        missingAction: body.missingAction,
        lastUpdated: Date.now()
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, data: evidence });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
