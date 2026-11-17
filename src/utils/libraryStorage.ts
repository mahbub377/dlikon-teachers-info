import { LibraryResource } from '../types/libraryTypes';
import { NCTB_2026_OFFICIAL_BOOKS } from '../data/nctb2026Books';

const DB_NAME = 'dlma_digital_library_db';
const DB_VERSION = 1;
const STORE_RESOURCES = 'resources';
const STORE_BLOBS = 'pdf_blobs';
const FALLBACK_META_KEY = 'dlma_digital_library_meta_v1';
const SEEDED_FLAG_KEY = 'dlma_digital_library_seeded_v1';
const MAX_CLOUD_PDF_BYTES = 25 * 1024 * 1024; // 25 MB limit per direct cloud PDF upload

const DEFAULT_REFERENCE_LINKS: LibraryResource[] = [
  {
    id: 'ref_nctb_books',
    title: 'এনসিটিবি (NCTB) ২০২৬ শিক্ষাবর্ষের সকল স্তরের পাঠ্যপুস্তক পোর্টাল',
    className: 'সকল শ্রেণি',
    subject: 'সকল বিষয় / সাধারণ',
    category: 'reference_link',
    sourceType: 'external_url',
    url: 'https://nctb.gov.bd/pages/static-pages/695b97ffc4774958d7b70329',
    academicYear: '২০২৬',
    termOrChapter: 'প্রাক-প্রাথমিক - ১০ম শ্রেণি',
    authorOrPublisher: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB)',
    description: '২০২৬ শিক্ষাবর্ষের প্রাক-প্রাথমিক, প্রাথমিক ও মাধ্যমিক স্তরের সকল সরকারি পাঠ্যপুস্তকের অফিশিয়াল ওয়েব পাতা।',
    uploadedBy: 'একাডেমি লাইব্রেরি',
    hasCloudFile: false,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'ref_teachers_portal',
    title: 'শিক্ষক বাতায়ন — ডিজিটাল কন্টেন্ট ও লেসন প্ল্যান',
    className: 'সকল শ্রেণি',
    subject: 'সকল বিষয় / সাধারণ',
    category: 'reference_link',
    sourceType: 'external_url',
    url: 'https://www.teachers.gov.bd/',
    academicYear: '২০২৬',
    termOrChapter: 'শিক্ষক সহায়িকা',
    authorOrPublisher: 'এটুআই (a2i) ও মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর',
    description: 'পাঠদান উপযোগী মাল্টিমিডিয়া কন্টেন্ট, সৃজনশীল প্রশ্নব্যাংক ও শিক্ষকদের অভিজ্ঞতা বিনিময় পোর্টাল।',
    uploadedBy: 'একাডেমি লাইব্রেরি',
    hasCloudFile: false,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'ref_muktopaath',
    title: 'মুক্তপাঠ — শিক্ষক প্রশিক্ষণ ও ই-লার্নিং কোর্স',
    className: 'সকল শ্রেণি',
    subject: 'সকল বিষয় / সাধারণ',
    category: 'reference_link',
    sourceType: 'external_url',
    url: 'https://muktopaath.gov.bd/',
    academicYear: '২০২৬',
    termOrChapter: 'প্রশিক্ষণ ও দক্ষতা',
    authorOrPublisher: 'মুক্তপাঠ (a2i)',
    description: 'আধুনিক পাঠদান কৌশল, কারিকুলাম ও ডিজিটাল শিক্ষণ দক্ষতা উন্নয়নের অনলাইন কোর্স ও রেফারেন্স।',
    uploadedBy: 'একাডেমি লাইব্রেরি',
    hasCloudFile: false,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z'
  },
  ...NCTB_2026_OFFICIAL_BOOKS
];

function openLibraryDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_RESOURCES)) {
        db.createObjectStore(STORE_RESOURCES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open library database'));
  });
}

function fileToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error('Failed reading file'));
    reader.readAsDataURL(blob);
  });
}

async function cacheResourcesLocally(items: LibraryResource[]): Promise<void> {
  try {
    const db = await openLibraryDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_RESOURCES, 'readwrite');
      const store = tx.objectStore(STORE_RESOURCES);
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    localStorage.setItem(FALLBACK_META_KEY, JSON.stringify(items));
    localStorage.setItem(SEEDED_FLAG_KEY, '1');
  } catch {
    // ignore offline cache errors
  }
}

export async function getAllLibraryResources(): Promise<LibraryResource[]> {
  // 1. Try Cloud SQL central endpoint first for multi-device sync
  try {
    const res = await fetch('/api/library');
    if (res.ok) {
      const cloudItems = (await res.json()) as LibraryResource[];
      if (Array.isArray(cloudItems)) {
        await cacheResourcesLocally(cloudItems);
        return cloudItems.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    }
  } catch (cloudErr) {
    console.warn('Cloud library fetch failed, falling back to offline cache:', cloudErr);
  }

  // 2. Fallback to IndexedDB / localStorage for offline support
  try {
    const db = await openLibraryDb();
    const items = await new Promise<LibraryResource[]>((resolve, reject) => {
      const tx = db.transaction(STORE_RESOURCES, 'readonly');
      const req = tx.objectStore(STORE_RESOURCES).getAll();
      req.onsuccess = () => resolve((req.result as LibraryResource[]) || []);
      req.onerror = () => reject(req.error);
    });

    const alreadySeeded = localStorage.getItem(SEEDED_FLAG_KEY);
    if (items.length === 0 && !alreadySeeded) {
      await cacheResourcesLocally(DEFAULT_REFERENCE_LINKS);
      return [...DEFAULT_REFERENCE_LINKS];
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    try {
      const raw = localStorage.getItem(FALLBACK_META_KEY);
      if (raw) return JSON.parse(raw);
      return [...DEFAULT_REFERENCE_LINKS];
    } catch {
      return [...DEFAULT_REFERENCE_LINKS];
    }
  }
}

export async function saveLibraryResource(
  resource: LibraryResource,
  pdfFile?: Blob | File,
  authToken?: string | null
): Promise<{ cloudSynced: boolean; oversizedWarning?: boolean }> {
  let cloudSynced = false;
  let oversizedWarning = false;

  // 1. Save locally in IndexedDB immediately (offline & instant read)
  try {
    const db = await openLibraryDb();
    await new Promise<void>((resolve, reject) => {
      const stores = pdfFile ? [STORE_RESOURCES, STORE_BLOBS] : [STORE_RESOURCES];
      const tx = db.transaction(stores, 'readwrite');
      tx.objectStore(STORE_RESOURCES).put(resource);
      if (pdfFile) {
        tx.objectStore(STORE_BLOBS).put({ id: resource.id, blob: pdfFile, updatedAt: resource.updatedAt });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB local cache save skipped:', err);
  }

  // 2. Push to Cloud SQL central database for multi-device access
  try {
    let pdfBase64: string | undefined;
    if (pdfFile) {
      if (pdfFile.size > MAX_CLOUD_PDF_BYTES) {
        oversizedWarning = true;
      } else {
        pdfBase64 = await fileToBase64(pdfFile);
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const payloadResource: LibraryResource = {
      ...resource,
      hasCloudFile: Boolean(pdfBase64) || Boolean(resource.hasCloudFile),
    };

    const res = await fetch('/api/library', {
      method: 'POST',
      headers,
      body: JSON.stringify({ resource: payloadResource, pdfBase64 }),
    });

    if (res.ok) {
      cloudSynced = true;
    }
  } catch (err) {
    console.warn('Cloud sync failed (saved locally):', err);
  }

  return { cloudSynced, oversizedWarning };
}

export async function getLibraryPdfBlob(resourceId: string): Promise<Blob | null> {
  // 1. Check local IndexedDB cache first
  try {
    const db = await openLibraryDb();
    const record = await new Promise<{ id: string; blob: Blob } | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_BLOBS, 'readonly');
      const req = tx.objectStore(STORE_BLOBS).get(resourceId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (record?.blob) {
      return record.blob;
    }
  } catch (err) {
    console.warn('Local IndexedDB blob lookup failed:', err);
  }

  // 2. Fetch from central Cloud SQL PDF endpoint and cache locally
  try {
    const res = await fetch(`/api/library/${encodeURIComponent(resourceId)}/pdf`);
    if (!res.ok) return null;
    const blob = await res.blob();
    try {
      const db = await openLibraryDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_BLOBS, 'readwrite');
        tx.objectStore(STORE_BLOBS).put({ id: resourceId, blob, updatedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // ignore offline cache write failure
    }
    return blob;
  } catch (err) {
    console.error('Failed fetching cloud PDF blob:', err);
    return null;
  }
}

export async function deleteLibraryResource(resourceId: string, authToken?: string | null): Promise<void> {
  try {
    const db = await openLibraryDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_RESOURCES, STORE_BLOBS], 'readwrite');
      tx.objectStore(STORE_RESOURCES).delete(resourceId);
      tx.objectStore(STORE_BLOBS).delete(resourceId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Local IndexedDB delete warning:', err);
  }

  try {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    await fetch(`/api/library/${encodeURIComponent(resourceId)}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.warn('Cloud delete warning:', err);
  }
}

export function formatFileSizeBn(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
