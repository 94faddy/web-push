import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse, LandingPageConfig, defaultLandingPageConfig } from '@/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Get landing page config for current admin
export async function GET(): Promise<NextResponse<ApiResponse<LandingPageConfig>>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const configs = await query<(LandingPageConfig & RowDataPacket)[]>(
      'SELECT * FROM landing_page_config WHERE admin_id = ? AND is_active = TRUE LIMIT 1',
      [admin.id]
    );

    if (configs.length === 0) {
      // Return default config if no config exists
      return NextResponse.json({
        success: true,
        data: {
          ...defaultLandingPageConfig,
          id: 0,
          admin_id: admin.id,
          created_at: new Date(),
          updated_at: new Date()
        } as LandingPageConfig
      });
    }

    return NextResponse.json({
      success: true,
      data: configs[0]
    });

  } catch (error) {
    console.error('Get landing config error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}

// Create or update landing page config
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if config exists
    const existingConfigs = await query<(LandingPageConfig & RowDataPacket)[]>(
      'SELECT id FROM landing_page_config WHERE admin_id = ?',
      [admin.id]
    );

    const fields = [
      'page_title', 'page_subtitle',
      'bg_type', 'bg_color', 'bg_gradient_start', 'bg_gradient_end', 'bg_gradient_direction',
      'bg_image_url', 'bg_overlay_color',
      'card_bg_color', 'card_border_radius', 'card_shadow',
      'main_icon_type', 'main_icon_emoji', 'main_icon_image_url', 'main_icon_size',
      'success_icon_type', 'success_icon_emoji', 'success_icon_image_url', 'success_icon_color',
      'subscribe_title', 'subscribe_description',
      'subscribed_title', 'subscribed_description', 'subscribed_message',
      'success_button_text', 'success_button_url',
      'button_text', 'button_loading_text', 'button_bg_color', 'button_text_color',
      'button_hover_color', 'button_border_radius', 'button_shadow',
      'show_features', 'features_title',
      'feature_1_icon', 'feature_1_text', 'feature_1_image_url',
      'feature_2_icon', 'feature_2_text', 'feature_2_image_url',
      'feature_3_icon', 'feature_3_text', 'feature_3_image_url',
      'show_hero_image', 'hero_image_url', 'hero_image_link', 'hero_image_radius',
      'show_logo', 'logo_url', 'logo_width', 'logo_height',
      'show_footer', 'footer_text', 'footer_link', 'footer_text_color',
      'template_id', 'custom_css'
    ];

    if (existingConfigs.length > 0) {
      // Update existing config
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => body[f] ?? null);
      
      await query(
        `UPDATE landing_page_config SET ${setClause}, updated_at = NOW() WHERE admin_id = ?`,
        [...values, admin.id]
      );

      return NextResponse.json({
        success: true,
        message: 'อัพเดทการตั้งค่าสำเร็จ'
      });
    } else {
      // Create new config
      const insertFields = ['admin_id', ...fields];
      const placeholders = insertFields.map(() => '?').join(', ');
      const values = [admin.id, ...fields.map(f => body[f] ?? null)];

      const result = await query<ResultSetHeader>(
        `INSERT INTO landing_page_config (${insertFields.join(', ')}) VALUES (${placeholders})`,
        values
      );

      return NextResponse.json({
        success: true,
        message: 'สร้างการตั้งค่าสำเร็จ',
        data: { id: result.insertId }
      });
    }

  } catch (error) {
    console.error('Save landing config error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}

// Delete landing page config (reset to default)
export async function DELETE(): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    await query(
      'DELETE FROM landing_page_config WHERE admin_id = ?',
      [admin.id]
    );

    return NextResponse.json({
      success: true,
      message: 'รีเซ็ตการตั้งค่าเรียบร้อย'
    });

  } catch (error) {
    console.error('Delete landing config error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}