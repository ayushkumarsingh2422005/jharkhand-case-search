# Authentication Setup Guide

## Initial Setup

### 1. Set Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-very-secure-random-secret-key-here
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
```

**Important**: 
- Change `JWT_SECRET` to a strong random string in production
- Change `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` to your preferred credentials

### 2. Create First SuperAdmin

Run the following command to create the first SuperAdmin user:

```bash
npm run create-admin
```

This script will:
- Connect to your MongoDB database
- Check if any users exist
- If no users exist, create a default SuperAdmin with:
  - Email: `admin@example.com` (or from `DEFAULT_ADMIN_EMAIL`)
  - Password: `admin123` (or from `DEFAULT_ADMIN_PASSWORD`)
  - Role: SuperAdmin

**⚠️ Important**: Change the default password immediately after first login!

### 3. Login

1. Navigate to `http://localhost:3000/login`
2. Enter the default admin credentials
3. After login, go to Admin Panel > User Management
4. Create additional users or change your password

## User Roles

### SuperAdmin
- Full access to all features
- Can create, edit, and delete cases
- Can manage users (create, edit, delete, change roles)
- Can manage Crime Heads and Reasons for Pendency
- Can add notes to cases

### Viewer
- Can view cases and search/filter
- Can view case details
- Cannot create, edit, or delete cases
- Cannot access admin panel features
- Cannot add notes

## Security Notes

1. **JWT Secret**: Use a strong, random string for `JWT_SECRET` in production
2. **Default Password**: Always change the default admin password after first login
3. **User Management**: Only SuperAdmins can create and manage users
4. **Password Security**: Passwords are hashed using bcrypt before storage
5. **Session**: JWT tokens expire after 7 days

## Troubleshooting

### "Unauthorized" errors
- Make sure you're logged in
- Check if your JWT token is valid (try logging out and back in)
- Verify `JWT_SECRET` is set correctly

### Cannot create admin
- Check MongoDB connection
- Verify no users exist already (script only runs if database is empty)
- Check console for error messages

### Login not working
- Verify user exists in database
- Check email/password are correct
- Ensure `JWT_SECRET` is set in environment variables

