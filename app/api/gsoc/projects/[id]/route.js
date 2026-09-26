import dbConnect from '@/lib/mongodb';
import GSoCProject from '@/models/GSoCProject';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = params;

    const project = await GSoCProject.findByIdAndUpdate(
      id,
      { 
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return Response.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: project });
  } catch (error) {
    console.error('GSoC Project Update Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const project = await GSoCProject.findByIdAndDelete(id);
    if (!project) {
      return Response.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: project });
  } catch (error) {
    console.error('GSoC Project Delete Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}