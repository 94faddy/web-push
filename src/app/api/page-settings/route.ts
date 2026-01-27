import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { PageSettings, ApiResponse } from '@/types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ป้องกัน Next.js caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get page settings (by admin session or by token)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    let adminId: number | null = null;

    // ถ้ามี token ให้ใช้ token (สำหรับหน้า public)
    if (token && token.trim() !== '') {
      const admins = await query<RowDataPacket[]>(
        'SELECT id FROM admins WHERE token = ? AND is_active = 1',
        [token]
      );
      
      if (admins.length === 0) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Invalid token'
        }, { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
      }
      
      adminId = admins[0].id;
    } else {
      // ถ้าไม่มี token ให้ใช้ session (สำหรับหน้า admin)
      const admin = await getCurrentAdmin();
      if (!admin) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Unauthorized'
        }, { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
      }
      adminId = admin.id;
    }

    // ดึง settings
    let settings = await query<RowDataPacket[]>(
      'SELECT * FROM page_settings WHERE admin_id = ?',
      [adminId]
    );

    // ถ้าไม่มี settings ให้สร้างใหม่
    if (settings.length === 0) {
      await query<ResultSetHeader>(
        'INSERT INTO page_settings (admin_id) VALUES (?)',
        [adminId]
      );
      
      settings = await query<RowDataPacket[]>(
        'SELECT * FROM page_settings WHERE admin_id = ?',
        [adminId]
      );
    }

    return NextResponse.json<ApiResponse<PageSettings>>({
      success: true,
      data: settings[0] as PageSettings
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Get page settings error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to get page settings'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  }
}

// PUT - Update page settings
export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }

    const body = await request.json();
    
    const allowedFields = [
      'button_hue', 'button_saturation', 'button_lightness',
      'bg_type', 'bg_hue', 'bg_saturation', 'bg_lightness',
      'bg_gradient_hue2', 'bg_gradient_saturation2', 'bg_gradient_lightness2', 'bg_gradient_angle',
      'bg_image_url', 'bg_image_overlay', 'bg_image_overlay_opacity',
      'logo_url', 'logo_width',
      'page_title', 'page_subtitle',
      // Subscribe Form
      'subscribe_icon', 'subscribe_icon_bg', 'subscribe_icon_color', 'subscribe_title', 'subscribe_subtitle',
      'subscribe_button_text', 'subscribe_loading_text',
      // Success Page
      'success_icon', 'success_icon_bg', 'success_icon_color', 'success_title', 'success_title_existing',
      'success_subtitle', 'success_box_icon', 'success_box_icon_color', 'success_box_title', 'success_box_subtitle',
      // Blocked Page
      'blocked_icon', 'blocked_icon_bg', 'blocked_icon_color', 'blocked_title', 'blocked_subtitle',
      'blocked_button_text', 'blocked_tip_icon', 'blocked_tip_icon_color', 'blocked_tip_text',
      // iOS Safari
      'ios_safari_icon', 'ios_safari_icon_bg', 'ios_safari_icon_color', 'ios_safari_title', 'ios_safari_subtitle',
      'ios_safari_button_text',
      // iOS Chrome
      'ios_chrome_icon', 'ios_chrome_icon_bg', 'ios_chrome_icon_color', 'ios_chrome_title', 'ios_chrome_subtitle',
      'ios_chrome_button_text',
      // iOS Unsupported
      'ios_unsupported_icon', 'ios_unsupported_icon_bg', 'ios_unsupported_icon_color', 'ios_unsupported_title',
      'ios_unsupported_subtitle', 'ios_unsupported_button_text', 'ios_unsupported_button_telegram',
      'ios_unsupported_button_copy', 'ios_unsupported_copy_success', 'ios_unsupported_copy_hint',
      // Android Unsupported
      'android_unsupported_icon', 'android_unsupported_icon_bg', 'android_unsupported_icon_color', 'android_unsupported_title',
      'android_unsupported_subtitle', 'android_unsupported_button_text', 'android_unsupported_loading_text',
      'android_unsupported_copy_success', 'android_unsupported_copy_hint',
      // Footer
      'footer_title', 'footer_item1_icon', 'footer_item1_icon_color', 'footer_item1_text',
      'footer_item2_icon', 'footer_item2_icon_color', 'footer_item2_text',
      'footer_item3_icon', 'footer_item3_icon_color', 'footer_item3_text'
    ];

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No fields to update'
      }, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
    }

    const existing = await query<RowDataPacket[]>(
      'SELECT id FROM page_settings WHERE admin_id = ?',
      [admin.id]
    );

    if (existing.length === 0) {
      await query<ResultSetHeader>(
        'INSERT INTO page_settings (admin_id) VALUES (?)',
        [admin.id]
      );
    }

    values.push(admin.id);
    await query<ResultSetHeader>(
      `UPDATE page_settings SET ${updates.join(', ')} WHERE admin_id = ?`,
      values
    );

    const settings = await query<RowDataPacket[]>(
      'SELECT * FROM page_settings WHERE admin_id = ?',
      [admin.id]
    );

    return NextResponse.json<ApiResponse<PageSettings>>({
      success: true,
      data: settings[0] as PageSettings
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Update page settings error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update page settings'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  }
}