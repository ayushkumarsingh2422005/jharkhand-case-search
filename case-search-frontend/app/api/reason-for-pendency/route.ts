import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ReasonForPendency } from '../../../models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const filter: any = {};
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const reasons = await ReasonForPendency.find(filter)
      .sort({ reason: 1 })
      .lean();
    
    // If includeInactive is false, return just reasons (for dropdowns)
    if (!includeInactive) {
      return NextResponse.json({
        success: true,
        data: reasons.map(r => r.reason),
      });
    }
    
    // Otherwise return full objects (for admin panel)
    return NextResponse.json({
      success: true,
      data: reasons,
    });
  } catch (error: any) {
    console.error('Error fetching reasons for pendency:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reasons for pendency' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { reason, createdBy } = body;
    
    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Reason is required' },
        { status: 400 }
      );
    }
    
    const reasonForPendency = new ReasonForPendency({
      reason,
      createdBy: createdBy || 'Admin',
      isActive: true,
    });
    
    await reasonForPendency.save();
    
    return NextResponse.json({
      success: true,
      data: reasonForPendency,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Reason already exists' },
        { status: 400 }
      );
    }
    console.error('Error creating reason for pendency:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create reason for pendency' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, reason, isActive } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Reason ID is required' },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    if (reason !== undefined) updateData.reason = reason;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const reasonForPendency = await ReasonForPendency.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!reasonForPendency) {
      return NextResponse.json(
        { success: false, error: 'Reason not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: reasonForPendency,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Reason already exists' },
        { status: 400 }
      );
    }
    console.error('Error updating reason for pendency:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update reason for pendency' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Reason ID is required' },
        { status: 400 }
      );
    }
    
    const reasonForPendency = await ReasonForPendency.findByIdAndDelete(id);
    
    if (!reasonForPendency) {
      return NextResponse.json(
        { success: false, error: 'Reason not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Reason deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting reason for pendency:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete reason for pendency' },
      { status: 500 }
    );
  }
}

