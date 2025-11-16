import { NextRequest, NextResponse } from 'next/server';
import { connectDB, CrimeHead } from '../../../models';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const jwt = require('jsonwebtoken');
    try {
      jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Invalid token.' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const filter: any = {};
    if (!includeInactive) {
      filter.isActive = true;
    }
    
    const crimeHeads = await CrimeHead.find(filter)
      .sort({ name: 1 })
      .lean();
    
    // If includeInactive is false, return just names (for dropdowns)
    if (!includeInactive) {
      return NextResponse.json({
        success: true,
        data: crimeHeads.map(ch => ch.name),
      });
    }
    
    // Otherwise return full objects (for admin panel)
    return NextResponse.json({
      success: true,
      data: crimeHeads,
    });
  } catch (error: any) {
    console.error('Error fetching crime heads:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch crime heads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, createdBy } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Crime head name is required' },
        { status: 400 }
      );
    }
    
    const crimeHead = new CrimeHead({
      name,
      createdBy: createdBy || 'Admin',
      isActive: true,
    });
    
    await crimeHead.save();
    
    return NextResponse.json({
      success: true,
      data: crimeHead,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Crime head already exists' },
        { status: 400 }
      );
    }
    console.error('Error creating crime head:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create crime head' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, name, isActive } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Crime head ID is required' },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const crimeHead = await CrimeHead.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!crimeHead) {
      return NextResponse.json(
        { success: false, error: 'Crime head not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: crimeHead,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Crime head name already exists' },
        { status: 400 }
      );
    }
    console.error('Error updating crime head:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update crime head' },
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
        { success: false, error: 'Crime head ID is required' },
        { status: 400 }
      );
    }
    
    const crimeHead = await CrimeHead.findByIdAndDelete(id);
    
    if (!crimeHead) {
      return NextResponse.json(
        { success: false, error: 'Crime head not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Crime head deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting crime head:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete crime head' },
      { status: 500 }
    );
  }
}

