import dbConnect from '@/lib/mongodb';
import GSoCOrganization from '@/models/GSoCOrganization';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = params;

    const organization = await GSoCOrganization.findByIdAndUpdate(
      id,
      { 
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!organization) {
      return Response.json({ success: false, error: 'Organization not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: organization });
  } catch (error) {
    console.error('GSoC Organization Update Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const organization = await GSoCOrganization.findByIdAndDelete(id);
    if (!organization) {
      return Response.json({ success: false, error: 'Organization not found' }, { status: 404 });
    }

    return Response.json({ success: true, data: organization });
  } catch (error) {
    console.error('GSoC Organization Delete Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}