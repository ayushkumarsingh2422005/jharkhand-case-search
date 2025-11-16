import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, User } from '../models';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'SuperAdmin' | 'Viewer';
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };

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

/**
 * Require authentication - returns 401 if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser } | { error: Response }> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return {
      error: Response.json(
        { success: false, error: 'Unauthorized. Please login.' },
        { status: 401 }
      ),
    };
  }
  return { user };
}

/**
 * Require SuperAdmin role - returns 403 if not SuperAdmin
 */
export async function requireSuperAdmin(request: NextRequest): Promise<{ user: AuthUser } | { error: Response }> {
  const authResult = await requireAuth(request);
  if ('error' in authResult) {
    return authResult;
  }

  if (authResult.user.role !== 'SuperAdmin') {
    return {
      error: Response.json(
        { success: false, error: 'Forbidden. SuperAdmin access required.' },
        { status: 403 }
      ),
    };
  }

  return { user: authResult.user };
}

