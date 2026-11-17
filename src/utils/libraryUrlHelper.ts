import { LibraryResource } from '../types/libraryTypes';

export interface ResolvedExternalLink {
  isGoogleDrive: boolean;
  canEmbed: boolean;
  embedUrl: string | null;
  downloadUrl: string | null;
  externalUrl: string;
}

/**
 * Extracts Google Drive file ID from common Drive share/view/open URLs
 * and converts them into an embeddable In-App PDF Reader preview URL.
 */
export function parseExternalLibraryUrl(rawUrl: string): ResolvedExternalLink {
  const trimmed = rawUrl.trim();

  // Match patterns:
  // 1) https://drive.google.com/file/d/<ID>/view...
  // 2) https://drive.google.com/open?id=<ID>
  // 3) https://drive.google.com/uc?id=<ID>&export=download
  // 4) https://docs.google.com/document|presentation|spreadsheets/d/<ID>/...
  const filePathMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  const queryIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([a-zA-Z0-9_-]+)/i);
  const docsMatch = trimmed.match(/docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/i);

  const driveId = filePathMatch?.[1] || queryIdMatch?.[1] || docsMatch?.[1] || null;

  if (driveId) {
    return {
      isGoogleDrive: true,
      canEmbed: true,
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${driveId}`,
      externalUrl: trimmed,
    };
  }

  // Direct PDF links (.pdf)
  const looksLikePdf = /\.pdf(\?|#|$)/i.test(trimmed);

  return {
    isGoogleDrive: false,
    canEmbed: looksLikePdf,
    embedUrl: looksLikePdf ? trimmed : null,
    downloadUrl: looksLikePdf ? trimmed : null,
    externalUrl: trimmed,
  };
}

export function isDirectGoogleDriveLink(url?: string): boolean {
  if (!url) return false;
  return parseExternalLibraryUrl(url).isGoogleDrive;
}

export function getLibraryResourceShareUrl(className: string): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('tab', 'library');
  if (className && className !== 'সকল শ্রেণি') {
    url.searchParams.set('class', className);
  }
  return url.toString();
}

export function resolveLibraryCardActionLabel(resource: LibraryResource): string {
  if (resource.sourceType === 'pdf_upload') return 'পড়ুন (PDF)';
  if (resource.url && parseExternalLibraryUrl(resource.url).canEmbed) {
    return 'প্রিভিউ ও পড়ুন';
  }
  return 'লিংক খুলুন';
}
