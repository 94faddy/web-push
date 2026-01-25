import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse, LandingPageTemplate } from '@/types';
import { RowDataPacket } from 'mysql2';

interface TemplateRow extends RowDataPacket {
  id: number;
  name: string;
  category: string;
  preview_image: string | null;
  config: string;
  is_premium: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
}

// Get all landing page templates
export async function GET(): Promise<NextResponse<ApiResponse<LandingPageTemplate[]>>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const templates = await query<TemplateRow[]>(
      'SELECT * FROM landing_page_templates WHERE is_active = TRUE ORDER BY category, sort_order'
    );

    // Parse JSON config for each template
    const parsedTemplates: LandingPageTemplate[] = templates.map(t => ({
      ...t,
      config: typeof t.config === 'string' ? JSON.parse(t.config) : t.config
    }));

    return NextResponse.json({
      success: true,
      data: parsedTemplates
    });

  } catch (error) {
    console.error('Get landing templates error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}
