import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST - Upload file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
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
    const deleteResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    }) as any;

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

