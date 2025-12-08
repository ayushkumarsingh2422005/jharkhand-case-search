import { NextRequest, NextResponse } from 'next/server';
// import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

// Configure Cloudinary
/*
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
*/

// POST - Upload file to Cloudinary (Authenticated users only)
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

    // Check if Cloudinary is configured
    /*
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.' 
        },
        { status: 500 }
      );
    }
    */

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (images only for now)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images and PDFs are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64 data URL
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Get optional folder and resource_type from form data
    const folder = formData.get('folder') as string || 'case-reports';
    const resourceTypeInput = formData.get('resource_type') as string | null;
    /*
    const validResourceTypes = ['raw', 'auto', 'image', 'video'] as const;
    const resourceType = (resourceTypeInput && validResourceTypes.includes(resourceTypeInput as any))
      ? (resourceTypeInput as typeof validResourceTypes[number])
      : 'auto';

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    }) as any;
    */

    // LOCAL SYSTEM UPLOAD IMPLEMENTATION
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure directory exists
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (e) {
      console.error('Error creating upload directory:', e);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedFilename}`;
    const filepath = path.join(uploadDir, filename);

    // Write file
    await fs.writeFile(filepath, buffer);

    // Create mock Cloudinary response object
    const fileUrl = `/uploads/${filename}`;
    const uploadResult = {
      public_id: filename,
      url: fileUrl,
      secure_url: fileUrl,
      format: file.name.split('.').pop() || '',
      width: 0,
      height: 0,
      bytes: file.size,
      resource_type: 'auto',
      created_at: new Date().toISOString(),
      version: 1,
      signature: 'local-sig',
      etag: 'local-etag',
      original_filename: file.name,
      folder: 'uploads'
    };

    // Return the necessary data for future CRUD operations
    return NextResponse.json({
      success: true,
      data: {
        // Essential for CRUD operations
        public_id: uploadResult.public_id,
        url: uploadResult.url,
        secure_url: uploadResult.secure_url,

        // Additional metadata
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        resource_type: uploadResult.resource_type,
        created_at: uploadResult.created_at,

        // For deletion/updates
        version: uploadResult.version,
        signature: uploadResult.signature,
        etag: uploadResult.etag,

        // Original filename
        original_filename: uploadResult.original_filename,

        // Folder path
        folder: uploadResult.folder,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload file'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete file from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    /*
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.' 
        },
        { status: 500 }
      );
    }
    */

    // Get public_id from query parameters or request body
    const searchParams = request.nextUrl.searchParams;
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'public_id is required' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    /*
    const deleteResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    }) as any;
    */

    // LOCAL SYSTEM DELETE IMPLEMENTATION
    const deleteResult = { result: 'ok' };
    try {
      // Assuming publicId is the filename we returned earlier
      const filepath = path.join(process.cwd(), 'public', 'uploads', publicId);
      await fs.unlink(filepath);
    } catch (error: any) {
      console.error('Local File Delete Error:', error);
      // Continue even if file not found to be idempotent, or return error?
      // Cloudinary returns 'not found' sometimes but usually 'ok'.
      // Closely mimicking cloudinary success even if file missing might be safer for frontend logic
      if (error.code !== 'ENOENT') {
        throw error;
      }
      deleteResult.result = 'not found';
    }

    return NextResponse.json({
      success: true,
      data: {
        result: deleteResult.result,
        public_id: publicId,
      },
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete file'
      },
      { status: 500 }
    );
  }
}

