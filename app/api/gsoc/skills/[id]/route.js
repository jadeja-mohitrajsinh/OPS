import dbConnect from '@/lib/mongodb';
import GSoCSkill from '@/models/GSoCSkill';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = params;

    const skill = await GSoCSkill.findByIdAndUpdate(
      id,
      { 
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!skill) {
      return Response.json({ success: false, error: 'Skill not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: skill });
  } catch (error) {
    console.error('GSoC Skill Update Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const skill = await GSoCSkill.findByIdAndDelete(id);
    if (!skill) {
      return Response.json({ success: false, error: 'Skill not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: skill });
  } catch (error) {
    console.error('GSoC Skill Delete Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}