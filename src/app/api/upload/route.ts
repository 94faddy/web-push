import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Config for file upload
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName).toLowerCase();
  return `${timestamp}_${random}${ext}`;
}

// POST - Upload file
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'File too large. Maximum size: 5MB'
      }, { status: 400 });
    }

    // Create upload directory if not exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const filename = generateFilename(file.name);
    const filepath = path.join(UPLOAD_DIR, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the URL
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json<ApiResponse<{ url: string; filename: string }>>({
      success: true,
      data: {
        url: fileUrl,
        filename: filename
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to upload file'
    }, { status: 500 });
  }
}

// DELETE - Delete file
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No filename provided'
      }, { status: 400 });
    }

    // Security check - only allow deleting from uploads directory
    const filepath = path.join(UPLOAD_DIR, path.basename(filename));
    
    if (!filepath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid filename'
      }, { status: 400 });
    }

    // Check if file exists and delete
    if (existsSync(filepath)) {
      const { unlink } = await import('fs/promises');
      await unlink(filepath);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'File deleted'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to delete file'
    }, { status: 500 });
  }
}