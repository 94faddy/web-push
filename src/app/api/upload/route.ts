import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { uploadAndShare } from '@/lib/nexzcloud';
import sharp from 'sharp';

// Config for file upload
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ICON_SIZE = 192; // Recommended icon size for push notifications
const BIG_IMAGE_WIDTH = 720; // Recommended width for push notification big image
const BIG_IMAGE_HEIGHT = 360; // Recommended height for push notification big image (2:1 ratio)

// Generate unique filename
function generateFilename(originalName: string, suffix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = getExtension(originalName);
  const baseName = suffix ? `${timestamp}_${random}_${suffix}` : `${timestamp}_${random}`;
  return `${baseName}${ext}`;
}

// Get file extension
function getExtension(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const extMap: Record<string, string> = {
    'jpg': '.jpg',
    'jpeg': '.jpg',
    'png': '.png',
    'gif': '.gif',
    'webp': '.webp',
    'svg': '.png' // SVG จะถูกแปลงเป็น PNG
  };
  return extMap[ext] || '.png';
}

// Resize image for icon
async function resizeIcon(buffer: Buffer, mimeType: string): Promise<Buffer> {
  // Don't resize SVG
  if (mimeType === 'image/svg+xml') {
    // Convert SVG to PNG with fixed size
    const result = await sharp(buffer)
      .resize(ICON_SIZE, ICON_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
    return Buffer.from(result);
  }

  // Resize other image types
  const image = sharp(buffer);
  const metadata = await image.metadata();
  
  // Only resize if larger than target size
  if (metadata.width && metadata.height) {
    if (metadata.width > ICON_SIZE || metadata.height > ICON_SIZE) {
      const result = await image
        .resize(ICON_SIZE, ICON_SIZE, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toBuffer();
      return Buffer.from(result);
    }
  }
  
  return buffer;
}

// Resize big image for push notification
async function resizeBigImage(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; width: number; height: number }> {
  // Convert SVG to PNG first
  if (mimeType === 'image/svg+xml') {
    const resizedBuffer = await sharp(buffer)
      .resize(BIG_IMAGE_WIDTH, BIG_IMAGE_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toBuffer();
    return { buffer: Buffer.from(resizedBuffer), width: BIG_IMAGE_WIDTH, height: BIG_IMAGE_HEIGHT };
  }

  const image = sharp(buffer);
  const metadata = await image.metadata();
  
  // Resize if larger than target size
  if (metadata.width && metadata.height) {
    if (metadata.width > BIG_IMAGE_WIDTH || metadata.height > BIG_IMAGE_HEIGHT) {
      // Determine output format based on input
      let outputImage = image.resize(BIG_IMAGE_WIDTH, BIG_IMAGE_HEIGHT, {
        fit: 'cover',
        position: 'center'
      });
      
      // Keep original format for jpg/png, convert others to png
      if (mimeType === 'image/jpeg') {
        outputImage = outputImage.jpeg({ quality: 85 });
      } else {
        outputImage = outputImage.png();
      }
      
      const resizedBuffer = await outputImage.toBuffer();
      return { buffer: Buffer.from(resizedBuffer), width: BIG_IMAGE_WIDTH, height: BIG_IMAGE_HEIGHT };
    }
  }
  
  return { buffer, width: metadata.width || 0, height: metadata.height || 0 };
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
    const type = formData.get('type') as string | null; // 'icon' | 'image' | 'logo' | 'bg' | 'pwa_icon'

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes) as Buffer;

    // Process based on type
    let filename = generateFilename(file.name, type || undefined);
    let imageWidth: number | null = null;
    let imageHeight: number | null = null;
    let wasResized = false;
    let mimeType = file.type;
    
    if (type === 'icon' || type === 'pwa_icon') {
      // Resize icon to 192x192
      try {
        buffer = await resizeIcon(buffer, file.type) as Buffer;
        wasResized = true;
        imageWidth = ICON_SIZE;
        imageHeight = ICON_SIZE;
        mimeType = 'image/png';
        // Change extension to .png if was SVG
        if (file.type === 'image/svg+xml') {
          filename = filename.replace(/\.[^.]+$/, '.png');
        }
      } catch (resizeError) {
        console.error('Failed to resize icon:', resizeError);
        // Continue with original buffer if resize fails
      }
    } else if (type === 'image') {
      // Resize big image for push notification
      try {
        const result = await resizeBigImage(buffer, file.type);
        buffer = result.buffer as Buffer;
        imageWidth = result.width;
        imageHeight = result.height;
        wasResized = result.width === BIG_IMAGE_WIDTH && result.height === BIG_IMAGE_HEIGHT;
        // Change extension to .png if was SVG
        if (file.type === 'image/svg+xml') {
          filename = filename.replace(/\.[^.]+$/, '.png');
          mimeType = 'image/png';
        }
      } catch (resizeError) {
        console.error('Failed to resize big image:', resizeError);
        // Continue with original buffer if resize fails
      }
    }

    // กำหนด upload type สำหรับ NexzCloud
    const uploadType = (type as 'icon' | 'image' | 'logo' | 'bg' | 'pwa_icon') || 'image';

    // อัพโหลดไปยัง NexzCloud และรับ CDN URL
    const uploadResult = await uploadAndShare(
      buffer,
      filename,
      mimeType,
      uploadType,
      admin.id
    );

    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: uploadResult.error || 'Failed to upload to cloud storage'
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<{ url: string; filename: string; type: string | null; width?: number; height?: number; resized?: boolean }>>({
      success: true,
      data: {
        url: uploadResult.url,
        filename: filename,
        type: type,
        width: imageWidth || undefined,
        height: imageHeight || undefined,
        resized: wasResized
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

// DELETE - ไม่จำเป็นต้องใช้แล้วเพราะไฟล์อยู่บน cloud
// แต่เก็บไว้เพื่อ backward compatibility
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

    // Note: การลบไฟล์บน NexzCloud ยังไม่มี API
    // แต่ไฟล์บน cloud จะไม่มีผลกระทบมากนัก
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'File deletion noted (files on cloud storage are managed separately)'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to process delete request'
    }, { status: 500 });
  }
}