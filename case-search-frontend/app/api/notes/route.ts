import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Note } from '../../../models';

// GET - Fetch notes for a case
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
    const caseId = searchParams.get('caseId');
    const caseNo = searchParams.get('caseNo');

    if (!caseId && !caseNo) {
      return NextResponse.json(
        { success: false, error: 'caseId or caseNo is required' },
        { status: 400 }
      );
    }

    const filter: any = {};
    if (caseId) filter.caseId = caseId;
    if (caseNo) filter.caseNo = caseNo;

    const notes = await Note.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: notes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new note
export async function POST(request: NextRequest) {
  try {
    // Check authentication (SuperAdmin only for creating notes)
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
    const User = require('../../../models').User;
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. SuperAdmin access required.' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    const newNote = new Note(body);
    await newNote.save();

    return NextResponse.json(
      { success: true, data: newNote },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

