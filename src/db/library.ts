// src/db/library.ts
import { db } from './index.ts';
import { libraryResources, libraryFiles } from './schema.ts';
import { desc, eq, like } from 'drizzle-orm';
import { LibraryResource } from '../types/libraryTypes.ts';
import { NCTB_2026_OFFICIAL_BOOKS } from '../data/nctb2026Books.ts';

const NCTB_2026_PORTAL_URL = 'https://nctb.gov.bd/pages/static-pages/695b97ffc4774958d7b70329';

const DEFAULT_PORTAL_SEED: LibraryResource[] = [
  {
    id: 'ref_nctb_books',
    title: 'এনসিটিবি (NCTB) ২০২৬ শিক্ষাবর্ষের সকল স্তরের পাঠ্যপুস্তক পোর্টাল',
    className: 'সকল শ্রেণি',
    subject: 'সকল বিষয় / সাধারণ',
    category: 'reference_link',
    sourceType: 'external_url',
    url: NCTB_2026_PORTAL_URL,
    academicYear: '২০২৬',
    termOrChapter: 'প্রাক-প্রাথমিক - ১০ম শ্রেণি',
    authorOrPublisher: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB)',
    description: '২০২৬ শিক্ষাবর্ষের প্রাক-প্রাথমিক, প্রাথমিক ও মাধ্যমিক স্তরের সকল সরকারি পাঠ্যপুস্তকের অফিশিয়াল ওয়েব পাতা।',
    uploadedBy: 'একাডেমি লাইব্রেরি',
    hasCloudFile: false,
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-01-15T08:00:00.000Z',
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
    updatedAt: '2026-01-15T08:00:00.000Z',
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
    updatedAt: '2026-01-15T08:00:00.000Z',
  },
];

let nctbSeedChecked = false;

function mapRowToLibraryResource(row: typeof libraryResources.$inferSelect): LibraryResource {
  return {
    id: row.id,
    title: row.title,
    className: row.className,
    subject: row.subject,
    category: row.category as LibraryResource['category'],
    sourceType: row.sourceType as LibraryResource['sourceType'],
    fileName: row.fileName || undefined,
    fileSize: row.fileSize || undefined,
    mimeType: row.mimeType || undefined,
    hasCloudFile: row.hasCloudFile === 1,
    hasLocalBlob: row.hasCloudFile === 1,
    url: row.url || undefined,
    academicYear: row.academicYear || undefined,
    termOrChapter: row.termOrChapter || undefined,
    authorOrPublisher: row.authorOrPublisher || undefined,
    description: row.description || undefined,
    uploadedBy: row.uploadedBy || undefined,
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : new Date().toISOString(),
  };
}

async function ensureOfficialNctbSeeded() {
  if (nctbSeedChecked) return;
  nctbSeedChecked = true;

  try {
    // 1. Replace deprecated nctb.portal.gov.bd SSL-error link if present
    const existingRef = await db
      .select()
      .from(libraryResources)
      .where(eq(libraryResources.id, 'ref_nctb_books'))
      .limit(1);

    if (existingRef.length === 0) {
      for (const seed of DEFAULT_PORTAL_SEED) {
        await db
          .insert(libraryResources)
          .values({
            id: seed.id,
            title: seed.title,
            className: seed.className,
            subject: seed.subject,
            category: seed.category,
            sourceType: seed.sourceType,
            hasCloudFile: 0,
            url: seed.url || null,
            academicYear: seed.academicYear || '২০২৬',
            termOrChapter: seed.termOrChapter || null,
            authorOrPublisher: seed.authorOrPublisher || null,
            description: seed.description || null,
            uploadedBy: seed.uploadedBy || 'একাডেমি লাইব্রেরি',
          })
          .onConflictDoNothing();
      }
    } else if (existingRef[0].url && existingRef[0].url.includes('nctb.portal.gov.bd')) {
      await db
        .update(libraryResources)
        .set({
          title: DEFAULT_PORTAL_SEED[0].title,
          url: NCTB_2026_PORTAL_URL,
          termOrChapter: DEFAULT_PORTAL_SEED[0].termOrChapter,
          description: DEFAULT_PORTAL_SEED[0].description,
          updatedAt: new Date(),
        })
        .where(eq(libraryResources.id, 'ref_nctb_books'));
    }

    // 2. Seed all 2026 official NCTB Google Drive textbooks if not seeded yet
    const existingNctbBooks = await db
      .select({ id: libraryResources.id })
      .from(libraryResources)
      .where(like(libraryResources.id, 'nctb26_%'))
      .limit(1);

    if (existingNctbBooks.length === 0) {
      const valuesToInsert = NCTB_2026_OFFICIAL_BOOKS.map((book) => ({
        id: book.id,
        title: book.title,
        className: book.className,
        subject: book.subject,
        category: book.category,
        sourceType: book.sourceType,
        hasCloudFile: 0,
        url: book.url || null,
        academicYear: book.academicYear || '২০২৬',
        termOrChapter: book.termOrChapter || null,
        authorOrPublisher: book.authorOrPublisher || null,
        description: book.description || null,
        uploadedBy: book.uploadedBy || 'NCTB অফিসিয়াল ক্যাটালগ',
        createdAt: new Date(book.createdAt),
        updatedAt: new Date(book.updatedAt),
      }));

      // Batch insert in chunks of 50
      for (let i = 0; i < valuesToInsert.length; i += 50) {
        await db
          .insert(libraryResources)
          .values(valuesToInsert.slice(i, i + 50))
          .onConflictDoNothing();
      }
    }
  } catch (err) {
    console.warn('NCTB 2026 seed check warning:', err);
    nctbSeedChecked = false;
  }
}

export async function getAllLibraryResourcesDb(): Promise<LibraryResource[]> {
  try {
    await ensureOfficialNctbSeeded();

    const rows = await db
      .select()
      .from(libraryResources)
      .orderBy(desc(libraryResources.createdAt));

    return rows.map(mapRowToLibraryResource);
  } catch (error) {
    console.error('Cloud SQL library query failed:', error);
    throw new Error('Failed to load library resources from database.', { cause: error });
  }
}

export async function upsertLibraryResourceDb(
  resource: LibraryResource,
  pdfBase64?: string,
  userId?: number
): Promise<LibraryResource> {
  try {
    const now = new Date();
    const hasFile = Boolean(pdfBase64) || Boolean(resource.hasCloudFile);

    const [saved] = await db
      .insert(libraryResources)
      .values({
        id: resource.id,
        userId: userId || null,
        title: resource.title,
        className: resource.className,
        subject: resource.subject,
        category: resource.category,
        sourceType: resource.sourceType,
        fileName: resource.fileName || null,
        fileSize: resource.fileSize || null,
        mimeType: resource.mimeType || null,
        hasCloudFile: hasFile ? 1 : 0,
        url: resource.url || null,
        academicYear: resource.academicYear || '২০২৬',
        termOrChapter: resource.termOrChapter || null,
        authorOrPublisher: resource.authorOrPublisher || null,
        description: resource.description || null,
        uploadedBy: resource.uploadedBy || 'শিক্ষক / এডমিন',
        createdAt: resource.createdAt ? new Date(resource.createdAt) : now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: libraryResources.id,
        set: {
          title: resource.title,
          className: resource.className,
          subject: resource.subject,
          category: resource.category,
          sourceType: resource.sourceType,
          fileName: resource.fileName || null,
          fileSize: resource.fileSize || null,
          mimeType: resource.mimeType || null,
          hasCloudFile: hasFile ? 1 : 0,
          url: resource.url || null,
          academicYear: resource.academicYear || '২০২৬',
          termOrChapter: resource.termOrChapter || null,
          authorOrPublisher: resource.authorOrPublisher || null,
          description: resource.description || null,
          uploadedBy: resource.uploadedBy || 'শিক্ষক / এডমিন',
          updatedAt: now,
        },
      })
      .returning();

    if (pdfBase64) {
      await db
        .insert(libraryFiles)
        .values({
          resourceId: resource.id,
          fileDataBase64: pdfBase64,
          mimeType: resource.mimeType || 'application/pdf',
          fileSize: resource.fileSize || Buffer.byteLength(pdfBase64, 'base64'),
          createdAt: now,
        })
        .onConflictDoUpdate({
          target: libraryFiles.resourceId,
          set: {
            fileDataBase64: pdfBase64,
            mimeType: resource.mimeType || 'application/pdf',
            fileSize: resource.fileSize || Buffer.byteLength(pdfBase64, 'base64'),
          },
        });
    }

    return mapRowToLibraryResource(saved);
  } catch (error) {
    console.error('Cloud SQL library upsert failed:', error);
    throw new Error('Failed to save library resource.', { cause: error });
  }
}

export async function getLibraryFileDb(resourceId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  fileName: string;
} | null> {
  try {
    const [meta] = await db
      .select()
      .from(libraryResources)
      .where(eq(libraryResources.id, resourceId))
      .limit(1);

    const [fileRow] = await db
      .select()
      .from(libraryFiles)
      .where(eq(libraryFiles.resourceId, resourceId))
      .limit(1);

    if (!fileRow) return null;

    const cleanBase64 = fileRow.fileDataBase64.includes(',')
      ? fileRow.fileDataBase64.split(',')[1]
      : fileRow.fileDataBase64;

    return {
      buffer: Buffer.from(cleanBase64, 'base64'),
      mimeType: fileRow.mimeType || meta?.mimeType || 'application/pdf',
      fileName: meta?.fileName || `${meta?.title || resourceId}.pdf`,
    };
  } catch (error) {
    console.error(`Failed loading library file ${resourceId}:`, error);
    throw new Error('Failed to load PDF file.', { cause: error });
  }
}

export async function deleteLibraryResourceDb(resourceId: string): Promise<boolean> {
  try {
    await db.delete(libraryResources).where(eq(libraryResources.id, resourceId));
    return true;
  } catch (error) {
    console.error(`Failed deleting library resource ${resourceId}:`, error);
    throw new Error('Failed to delete library resource.', { cause: error });
  }
}
