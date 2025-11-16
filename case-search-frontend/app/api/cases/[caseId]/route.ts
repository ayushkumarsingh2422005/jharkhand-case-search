import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Case } from '../../../../models';
import mongoose from 'mongoose';

// GET - Fetch a single case by ID (Authenticated users only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
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

    const { caseId } = await params;

    // Check if it's a valid ObjectId or case number
    let caseData;
    if (mongoose.Types.ObjectId.isValid(caseId)) {
      caseData = await Case.findById(caseId).lean();
    } else {
      // Try to find by case number (replace - with /)
      const caseNo = caseId.replace(/-/g, '/');
      caseData = await Case.findOne({ caseNo }).lean();
    }

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: caseData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a case (SuperAdmin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as { userId: string; email: string; role: string };

    await connectDB();
    const User = require('../../../../models').User;
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. SuperAdmin access required.' },
        { status: 403 }
      );
    }

    const { caseId } = await params;
    const body = await request.json();

    // Clean up empty strings for optional enum fields
    if (body.investigationStatus === '') {
      delete body.investigationStatus;
    }
    if (body.priority === '') {
      delete body.priority;
    }

    let caseData;
    if (mongoose.Types.ObjectId.isValid(caseId)) {
      caseData = await Case.findByIdAndUpdate(caseId, body, {
        new: true,
        runValidators: true,
      });
    } else {
      const caseNo = caseId.replace(/-/g, '/');
      caseData = await Case.findOneAndUpdate({ caseNo }, body, {
        new: true,
        runValidators: true,
      });
    }

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: caseData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a case (SuperAdmin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as { userId: string; email: string; role: string };

    await connectDB();
    const User = require('../../../../models').User;
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. SuperAdmin access required.' },
        { status: 403 }
      );
    }

    const { caseId } = await params;

    let caseData;
    if (mongoose.Types.ObjectId.isValid(caseId)) {
      caseData = await Case.findByIdAndDelete(caseId);
    } else {
      const caseNo = caseId.replace(/-/g, '/');
      caseData = await Case.findOneAndDelete({ caseNo });
    }

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Case deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

