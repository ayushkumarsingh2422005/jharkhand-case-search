import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User } from '../models';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'SuperAdmin' | 'Viewer';
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    ) as { userId: string; email: string; role: string };

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return null;
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as 'SuperAdmin' | 'Viewer',
    };
  } catch (error) {
    return null;
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }
    return handler(request, user);
  };
}

export function requireSuperAdmin(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }
    if (user.role !== 'SuperAdmin') {
      return Response.json(
        { success: false, error: 'Forbidden. SuperAdmin access required.' },
        { status: 403 }
      );
    }
    return handler(request, user);
  };
}

