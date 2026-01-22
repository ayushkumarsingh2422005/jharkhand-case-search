import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Case } from '../../../models';

// GET - Fetch all cases with optional filters (Authenticated users only)
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    if (searchParams.get('caseNo')) {
      filter.caseNo = { $regex: searchParams.get('caseNo'), $options: 'i' };
    }
    if (searchParams.get('year')) {
      filter.year = parseInt(searchParams.get('year')!);
    }
    if (searchParams.get('yearFrom') && searchParams.get('yearTo')) {
      filter.year = {
        $gte: parseInt(searchParams.get('yearFrom')!),
        $lte: parseInt(searchParams.get('yearTo')!),
      };
    }
    if (searchParams.get('policeStation')) {
      filter.policeStation = { $regex: searchParams.get('policeStation'), $options: 'i' };
    }
    if (searchParams.get('crimeHead')) {
      filter.crimeHead = { $regex: searchParams.get('crimeHead'), $options: 'i' };
    }
    if (searchParams.get('caseStatus')) {
      filter.caseStatus = searchParams.get('caseStatus');
    }

    const cases = await Case.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true });

    const total = await Case.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: cases,
      pagination: {
        page,
        limit,
        total,
        pages: limit === 0 ? 1 : Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new case (SuperAdmin only)
export async function POST(request: NextRequest) {
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
    const User = require('../../../models').User;
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. SuperAdmin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Clean up empty strings for optional enum fields
    if (body.investigationStatus === '') {
      delete body.investigationStatus;
    }
    if (body.priority === '') {
      delete body.priority;
    }
    if (body.caseDecisionStatus === '') {
      delete body.caseDecisionStatus;
    }

    // Check if case already exists
    const existingCase = await Case.findOne({
      caseNo: body.caseNo,
      policeStation: body.policeStation,
      year: body.year
    });
    if (existingCase) {
      return NextResponse.json(
        { success: false, error: 'Case with this number already exists' },
        { status: 400 }
      );
    }

    const newCase = new Case(body);
    await newCase.save();

    return NextResponse.json(
      { success: true, data: newCase },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

