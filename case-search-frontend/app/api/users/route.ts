import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User } from '../../../models';
import jwt from 'jsonwebtoken';

// Helper function to verify authentication and get user
async function getAuthenticatedUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as { userId: string; email: string; role: string };

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    return user;
  } catch (error) {
    return null;
  }
}

// GET - Fetch all users (SuperAdmin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. SuperAdmin access required.' },
        { status: 403 }
      );
    }

    await connectDB();
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create a new user (SuperAdmin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. SuperAdmin access required.' },
        { status: 403 }
      );
    }

    await connectDB();
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Validate role
    if (role && !['SuperAdmin', 'Viewer'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be SuperAdmin or Viewer' },
        { status: 400 }
      );
    }

    const newUser = new User({
      email: email.toLowerCase(),
      password,
      role: role || 'Viewer',
      createdBy: user.email,
    });

    await newUser.save();

    // Return user without password
    const userResponse = await User.findById(newUser._id).select('-password');

    return NextResponse.json(
      { success: true, data: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT - Update user (SuperAdmin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. SuperAdmin access required.' },
        { status: 403 }
      );
    }

    await connectDB();
    const { id, email, password, role } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 400 }
        );
      }
      userToUpdate.email = email.toLowerCase();
    }

    if (password) {
      userToUpdate.password = password; // Will be hashed by pre-save hook
    }

    if (role && ['SuperAdmin', 'Viewer'].includes(role)) {
      userToUpdate.role = role;
    }

    await userToUpdate.save();

    // Return updated user without password
    const updatedUser = await User.findById(id).select('-password');

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (SuperAdmin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user || user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. SuperAdmin access required.' },
        { status: 403 }
      );
    }

    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent deleting yourself
    if (id === user._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

