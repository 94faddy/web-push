import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// POST - Upload file
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        error: 'ไม่ได้เข้าสู่ระบบ' 
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'other';

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Max 5MB allowed' 
      }, { status: 400 });
    }

    // Create uploads directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', String(admin.id));
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`;
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const fileUrl = `/uploads/${admin.id}/${filename}`;

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Try to save to database (table might not exist)
    let insertId = 0;
    try {
      const result = await query<ResultSetHeader>(
        `INSERT INTO uploads (admin_id, filename, original_name, file_path, file_size, mime_type, category)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [admin.id, filename, file.name, fileUrl, file.size, file.type, category]
      );
      insertId = result.insertId;
    } catch (dbError) {
      // Table might not exist, continue without database
      console.log('Uploads table not found, skipping database insert');
    }

    return NextResponse.json({
      success: true,
      data: {
        id: insertId,
        filename,
        original_name: file.name,
        url: fileUrl,
        file_url: fileUrl,
        file_size: file.size,
        mime_type: file.type,
        category
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Upload failed' 
    }, { status: 500 });
  }
}

// GET - List uploads
export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        error: 'ไม่ได้เข้าสู่ระบบ' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    try {
      let sql = 'SELECT * FROM uploads WHERE admin_id = ?';
      const params: (number | string)[] = [admin.id];

      if (category) {
        sql += ' AND category = ?';
        params.push(category);
      }

      sql += ' ORDER BY created_at DESC';

      const uploads = await query<RowDataPacket[]>(sql, params);
      return NextResponse.json({
        success: true,
        data: uploads
      });
    } catch {
      // Table might not exist
      return NextResponse.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get uploads' 
    }, { status: 500 });
  }
}

// DELETE - Delete upload
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        error: 'ไม่ได้เข้าสู่ระบบ' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Upload ID required' 
      }, { status: 400 });
    }

    // Get upload info
    const uploads = await query<RowDataPacket[]>(
      'SELECT * FROM uploads WHERE id = ? AND admin_id = ?',
      [id, admin.id]
    );

    if (uploads.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Upload not found' 
      }, { status: 404 });
    }

    const upload = uploads[0];

    // Delete file from disk
    const diskPath = path.join(process.cwd(), 'public', upload.file_path);
    if (existsSync(diskPath)) {
      await unlink(diskPath);
    }

    // Delete from database
    await query('DELETE FROM uploads WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Upload deleted'
    });

  } catch (error) {
    console.error('Delete upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete upload' 
    }, { status: 500 });
  }
}