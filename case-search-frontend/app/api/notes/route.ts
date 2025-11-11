import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Note } from '../../../models';

// GET - Fetch notes for a case
export async function GET(request: NextRequest) {
  try {
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

