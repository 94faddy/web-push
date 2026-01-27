import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Config for file upload
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ICON_SIZE = 192; // Recommended icon size for push notifications

// Generate unique filename
function generateFilename(originalName: string, suffix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName).toLowerCase();
  const baseName = suffix ? `${timestamp}_${random}_${suffix}` : `${timestamp}_${random}`;
  return `${baseName}${ext === '.svg' ? '.png' : ext}`;
}

// Resize image for icon
async function resizeIcon(buffer: Buffer, mimeType: string): Promise<Buffer> {
  // Don't resize SVG
  if (mimeType === 'image/svg+xml') {
    // Convert SVG to PNG with fixed size
    return await sharp(buffer)
      .resize(ICON_SIZE, ICON_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
  }

  // Resize other image types
  const image = sharp(buffer);
  const metadata = await image.metadata();
  
  // Only resize if larger than target size
  if (metadata.width && metadata.height) {
    if (metadata.width > ICON_SIZE || metadata.height > ICON_SIZE) {
      return await image
        .resize(ICON_SIZE, ICON_SIZE, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
    }
  }
  
  return buffer;
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
    const type = formData.get('type') as string | null; // 'icon' | 'image' | 'logo' | 'pwa_icon'

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
        error: 'File too large. Maximum size: 10MB'
      }, { status: 400 });
    }

    // Create upload directory if not exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // Process based on type
    let filename = generateFilename(file.name, type || undefined);
    
    if (type === 'icon' || type === 'pwa_icon') {
      // Resize icon to 192x192
      try {
        buffer = await resizeIcon(buffer, file.type);
        // Change extension to .png if was SVG
        if (file.type === 'image/svg+xml') {
          filename = filename.replace(/\.[^.]+$/, '.png');
        }
      } catch (resizeError) {
        console.error('Failed to resize icon:', resizeError);
        // Continue with original buffer if resize fails
      }
    }

    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return the URL
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json<ApiResponse<{ url: string; filename: string; type: string | null }>>({
      success: true,
      data: {
        url: fileUrl,
        filename: filename,
        type: type
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