// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
];

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح به' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'لم يتم إرسال أي ملف للرفع' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'نوع الملف غير مدعوم. الأنواع المدعومة: PNG, JPG, WEBP, SVG',
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: 'حجم الملف يتجاوز الحد المسموح به (الحد الأقصى: 5 ميغابايت)',
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate base64 Data URL for 100% serverless compatibility
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // Also attempt local filesystem save if possible (optional)
    let publicUrl = dataUrl;
    try {
      let ext = '.png';
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') ext = '.jpg';
      else if (file.type === 'image/webp') ext = '.webp';
      else if (file.type === 'image/svg+xml') ext = '.svg';
      else if (file.name && file.name.includes('.')) ext = path.extname(file.name);

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const filename = `emdad_${Date.now()}_${randomSuffix}${ext}`;
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      publicUrl = `/images/uploads/${filename}`;
    } catch {
      // If filesystem is read-only (Netlify/Vercel), fallback to dataUrl seamlessly
      publicUrl = dataUrl;
    }

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        size: file.size,
        mimeType: file.type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /api/upload error]', error);
    return NextResponse.json(
      { success: false, message: 'فشل حفظ الملف على الخادم' },
      { status: 500 }
    );
  }
}
