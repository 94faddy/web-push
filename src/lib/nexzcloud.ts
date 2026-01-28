/**
 * NexzCloud Storage API Library
 * สำหรับอัพโหลดและจัดการไฟล์บน NexzCloud
 */

const NEXZCLOUD_API_URL = process.env.NEXZCLOUD_API_URL || 'https://apiv1.nexzcloud.lol';
const NEXZCLOUD_API_KEY = process.env.NEXZCLOUD_API_KEY || '';
const NEXZCLOUD_BASE_FOLDER = process.env.NEXZCLOUD_BASE_FOLDER || 'n0tify';

interface NexzCloudFolder {
  id: number;
  name: string;
  path: string;
  parent_id: number | null;
  is_public: boolean;
}

interface NexzCloudFile {
  id: number;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  path: string;
  url: string;
  folderId: number;
  relativePath?: string;
}

interface NexzCloudUploadResponse {
  success: boolean;
  data?: {
    uploaded: NexzCloudFile[];
    errors: string[];
  };
  message?: string;
  error?: string;
}

interface NexzCloudShareResponse {
  success: boolean;
  data?: {
    type: string;
    id: number;
    name: string;
    isPublic: boolean;
    cdnPrefix: string;
    cdnUrl: string;
    shareUrl: string;
    urls: {
      cdn: string;
      cdnDownload: string;
      share: string;
      shareDownload: string;
    };
  };
  message?: string;
  error?: string;
}

interface NexzCloudListResponse {
  success: boolean;
  data?: {
    files: Array<{
      id: number;
      name: string;
      original_name: string;
      mime_type: string;
      size: number;
      is_public: boolean;
      public_url: string | null;
    }>;
    folders: NexzCloudFolder[];
  };
  error?: string;
}

interface NexzCloudCreateFolderResponse {
  success: boolean;
  data?: NexzCloudFolder;
  message?: string;
  error?: string;
}

// Cache สำหรับเก็บ folder ID ที่สร้างแล้ว
const folderCache: Map<string, number> = new Map();

/**
 * ดึงรายการไฟล์และโฟลเดอร์
 */
export async function listFiles(folderId?: number): Promise<NexzCloudListResponse> {
  const url = new URL(`${NEXZCLOUD_API_URL}/api/public/list`);
  if (folderId) {
    url.searchParams.set('folderId', folderId.toString());
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-API-Key': NEXZCLOUD_API_KEY
    }
  });

  return response.json();
}

/**
 * สร้างโฟลเดอร์ใหม่
 */
export async function createFolder(name: string, parentId?: number): Promise<NexzCloudCreateFolderResponse> {
  const response = await fetch(`${NEXZCLOUD_API_URL}/api/public/folders/create`, {
    method: 'POST',
    headers: {
      'X-API-Key': NEXZCLOUD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      parentId: parentId || null
    })
  });

  return response.json();
}

/**
 * ค้นหาหรือสร้างโฟลเดอร์ตาม path
 * path format: ["n0tify", "push", "icon", "id2"]
 */
export async function getOrCreateFolderPath(pathParts: string[]): Promise<number | null> {
  const fullPath = pathParts.join('/');
  
  // ตรวจสอบ cache ก่อน
  if (folderCache.has(fullPath)) {
    return folderCache.get(fullPath)!;
  }

  let currentParentId: number | null = null;
  let currentPath = '';

  for (const part of pathParts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    
    // ตรวจสอบ cache สำหรับ partial path
    if (folderCache.has(currentPath)) {
      currentParentId = folderCache.get(currentPath)!;
      continue;
    }

    // ค้นหาโฟลเดอร์ใน parent ปัจจุบัน
    const listResult = await listFiles(currentParentId || undefined);
    
    if (listResult.success && listResult.data) {
      const existingFolder = listResult.data.folders.find(f => f.name === part);
      
      if (existingFolder) {
        currentParentId = existingFolder.id;
        folderCache.set(currentPath, existingFolder.id);
      } else {
        // สร้างโฟลเดอร์ใหม่
        const createResult = await createFolder(part, currentParentId || undefined);
        
        if (createResult.success && createResult.data) {
          currentParentId = createResult.data.id;
          folderCache.set(currentPath, createResult.data.id);
        } else {
          console.error(`Failed to create folder: ${part}`, createResult.error);
          return null;
        }
      }
    } else {
      console.error('Failed to list files:', listResult.error);
      return null;
    }
  }

  return currentParentId;
}

/**
 * สร้าง multipart form data boundary
 */
function generateBoundary(): string {
  return '----FormBoundary' + Math.random().toString(36).substring(2);
}

/**
 * สร้าง multipart form body manually
 */
function createMultipartBody(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  folderId: number | undefined,
  boundary: string
): Buffer {
  const CRLF = '\r\n';
  const parts: Buffer[] = [];

  // File part
  parts.push(Buffer.from(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="files"; filename="${filename}"${CRLF}` +
    `Content-Type: ${mimeType}${CRLF}${CRLF}`
  ));
  parts.push(fileBuffer);
  parts.push(Buffer.from(CRLF));

  // FolderId part (if exists)
  if (folderId) {
    parts.push(Buffer.from(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="folderId"${CRLF}${CRLF}` +
      `${folderId}${CRLF}`
    ));
  }

  // End boundary
  parts.push(Buffer.from(`--${boundary}--${CRLF}`));

  return Buffer.concat(parts);
}

/**
 * อัพโหลดไฟล์ไปยัง NexzCloud
 */
export async function uploadFile(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  folderId?: number
): Promise<NexzCloudUploadResponse> {
  const boundary = generateBoundary();
  const body = createMultipartBody(fileBuffer, filename, mimeType, folderId, boundary);

  const response = await fetch(`${NEXZCLOUD_API_URL}/api/public/upload`, {
    method: 'POST',
    headers: {
      'X-API-Key': NEXZCLOUD_API_KEY,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length.toString()
    },
    body: body
  });

  return response.json();
}

/**
 * Share ไฟล์เพื่อรับ CDN URL
 */
export async function shareFile(fileId: number, isPublic: boolean = true): Promise<NexzCloudShareResponse> {
  const response = await fetch(`${NEXZCLOUD_API_URL}/api/public/share`, {
    method: 'POST',
    headers: {
      'X-API-Key': NEXZCLOUD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'file',
      id: fileId,
      isPublic
    })
  });

  return response.json();
}

/**
 * อัพโหลดไฟล์พร้อม share และคืน CDN URL
 * @param fileBuffer - Buffer ของไฟล์
 * @param filename - ชื่อไฟล์
 * @param mimeType - MIME type ของไฟล์
 * @param uploadType - ประเภทการอัพโหลด (icon, image, logo, bg)
 * @param adminId - ID ของ admin
 */
export async function uploadAndShare(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  uploadType: 'icon' | 'image' | 'logo' | 'bg' | 'pwa_icon',
  adminId: number
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // กำหนด folder path ตาม type
    // format: n0tify/{category}/{type}/id{adminId}
    const folderMap: Record<string, string[]> = {
      'icon': ['push', 'icon'],
      'image': ['push', 'image'], 
      'logo': ['page', 'logo'],
      'bg': ['page', 'bg'],
      'pwa_icon': ['pwa', 'icon']
    };

    const subPathParts = folderMap[uploadType] || ['misc'];
    const pathParts = [NEXZCLOUD_BASE_FOLDER, ...subPathParts, `id${adminId}`];

    console.log('Creating folder path:', pathParts.join('/'));

    // สร้าง/ค้นหา folder
    const folderId = await getOrCreateFolderPath(pathParts);
    
    if (!folderId) {
      return { success: false, error: 'Failed to create upload folder' };
    }

    console.log('Uploading to folder ID:', folderId);

    // อัพโหลดไฟล์
    const uploadResult = await uploadFile(fileBuffer, filename, mimeType, folderId);
    
    console.log('Upload result:', JSON.stringify(uploadResult));

    if (!uploadResult.success || !uploadResult.data?.uploaded?.[0]) {
      return { success: false, error: uploadResult.error || 'Upload failed' };
    }

    const uploadedFile = uploadResult.data.uploaded[0];

    console.log('Sharing file ID:', uploadedFile.id);

    // Share ไฟล์เพื่อรับ CDN URL
    const shareResult = await shareFile(uploadedFile.id, true);
    
    console.log('Share result:', JSON.stringify(shareResult));

    if (!shareResult.success || !shareResult.data?.cdnUrl) {
      return { success: false, error: shareResult.error || 'Failed to share file' };
    }

    return { success: true, url: shareResult.data.cdnUrl };
  } catch (error) {
    console.error('NexzCloud upload error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * สำหรับ clear folder cache (ใช้ตอน test หรือ debug)
 */
export function clearFolderCache(): void {
  folderCache.clear();
}