export type FileType =
	| 'image'
	| 'audio'
	| 'video'
	| 'document'
	| 'other';

export interface FileInfo {
	type: FileType;
	icon: string;
	mimeType: string;
	extension: string;
}

const MIME_TYPE_MAP: Record<string, FileInfo> = {
	// Images
	'image/jpeg': {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/jpeg',
		extension: 'jpg'
	},
	'image/jpg': {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/jpg',
		extension: 'jpg'
	},
	'image/png': {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/png',
		extension: 'png'
	},
	'image/gif': {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/gif',
		extension: 'gif'
	},
	'image/webp': {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/webp',
		extension: 'webp'
	},
	'image/svg+xml': {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/svg+xml',
		extension: 'svg'
	},

	// Audio
	'audio/mpeg': {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/mpeg',
		extension: 'mp3'
	},
	'audio/mp3': {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/mp3',
		extension: 'mp3'
	},
	'audio/wav': {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/wav',
		extension: 'wav'
	},
	'audio/ogg': {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/ogg',
		extension: 'ogg'
	},
	'audio/aac': {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/aac',
		extension: 'aac'
	},
	'audio/flac': {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/flac',
		extension: 'flac'
	},

	// Video
	'video/mp4': {
		type: 'video',
		icon: 'fa-file-video',
		mimeType: 'video/mp4',
		extension: 'mp4'
	},
	'video/avi': {
		type: 'video',
		icon: 'fa-file-video',
		mimeType: 'video/avi',
		extension: 'avi'
	},
	'video/mov': {
		type: 'video',
		icon: 'fa-file-video',
		mimeType: 'video/mov',
		extension: 'mov'
	},
	'video/wmv': {
		type: 'video',
		icon: 'fa-file-video',
		mimeType: 'video/wmv',
		extension: 'wmv'
	},
	'video/webm': {
		type: 'video',
		icon: 'fa-file-video',
		mimeType: 'video/webm',
		extension: 'webm'
	},

	// Documents
	'application/pdf': {
		type: 'document',
		icon: 'fa-file-pdf',
		mimeType: 'application/pdf',
		extension: 'pdf'
	},
	'application/msword': {
		type: 'document',
		icon: 'fa-file-word',
		mimeType: 'application/msword',
		extension: 'doc'
	},
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
		{
			type: 'document',
			icon: 'fa-file-word',
			mimeType:
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			extension: 'docx'
		},
	'application/vnd.ms-excel': {
		type: 'document',
		icon: 'fa-file-excel',
		mimeType: 'application/vnd.ms-excel',
		extension: 'xls'
	},
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
		{
			type: 'document',
			icon: 'fa-file-excel',
			mimeType:
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			extension: 'xlsx'
		},
	'application/vnd.ms-powerpoint': {
		type: 'document',
		icon: 'fa-file-powerpoint',
		mimeType: 'application/vnd.ms-powerpoint',
		extension: 'ppt'
	},
	'application/vnd.openxmlformats-officedocument.presentationml.presentation':
		{
			type: 'document',
			icon: 'fa-file-powerpoint',
			mimeType:
				'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			extension: 'pptx'
		},
	'text/plain': {
		type: 'document',
		icon: 'fa-file-text',
		mimeType: 'text/plain',
		extension: 'txt'
	},
	'text/csv': {
		type: 'document',
		icon: 'fa-file-csv',
		mimeType: 'text/csv',
		extension: 'csv'
	},
	'application/zip': {
		type: 'document',
		icon: 'fa-file-archive',
		mimeType: 'application/zip',
		extension: 'zip'
	}
};

const EXTENSION_MAP: Record<string, FileInfo> = {
	// Images
	jpg: {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/jpeg',
		extension: 'jpg'
	},
	jpeg: {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/jpeg',
		extension: 'jpeg'
	},
	png: {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/png',
		extension: 'png'
	},
	gif: {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/gif',
		extension: 'gif'
	},
	webp: {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/webp',
		extension: 'webp'
	},
	svg: {
		type: 'image',
		icon: 'fa-file-image',
		mimeType: 'image/svg+xml',
		extension: 'svg'
	},

	// Audio
	mp3: {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/mpeg',
		extension: 'mp3'
	},
	wav: {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/wav',
		extension: 'wav'
	},
	ogg: {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/ogg',
		extension: 'ogg'
	},
	aac: {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/aac',
		extension: 'aac'
	},
	flac: {
		type: 'audio',
		icon: 'fa-file-audio',
		mimeType: 'audio/flac',
		extension: 'flac'
	},

	// Video
	mp4: {
		type: 'video',
		icon: 'fa-file-video',
		mimeType: 'video/mp4',
		extension: 'mp4'
	},
	avi: {
		type: 'video',
		icon: 'fa-file-video',
		mimeType: 'video/avi',
		extension: 'avi'
	},
	mov: {
		type: 'video',
		icon: 'fa-file-video',
		mimeType: 'video/mov',
		extension: 'mov'
	},
	wmv: {
		type: 'video',
		icon: 'fa-file-video',
		mimeType: 'video/wmv',
		extension: 'wmv'
	},
	webm: {
		type: 'video',
		icon: 'fa-file-video',
		mimeType: 'video/webm',
		extension: 'webm'
	},

	// Documents
	pdf: {
		type: 'document',
		icon: 'fa-file-pdf',
		mimeType: 'application/pdf',
		extension: 'pdf'
	},
	doc: {
		type: 'document',
		icon: 'fa-file-word',
		mimeType: 'application/msword',
		extension: 'doc'
	},
	docx: {
		type: 'document',
		icon: 'fa-file-word',
		mimeType:
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		extension: 'docx'
	},
	xls: {
		type: 'document',
		icon: 'fa-file-excel',
		mimeType: 'application/vnd.ms-excel',
		extension: 'xls'
	},
	xlsx: {
		type: 'document',
		icon: 'fa-file-excel',
		mimeType:
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		extension: 'xlsx'
	},
	ppt: {
		type: 'document',
		icon: 'fa-file-powerpoint',
		mimeType: 'application/vnd.ms-powerpoint',
		extension: 'ppt'
	},
	pptx: {
		type: 'document',
		icon: 'fa-file-powerpoint',
		mimeType:
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		extension: 'pptx'
	},
	txt: {
		type: 'document',
		icon: 'fa-file-text',
		mimeType: 'text/plain',
		extension: 'txt'
	},
	csv: {
		type: 'document',
		icon: 'fa-file-csv',
		mimeType: 'text/csv',
		extension: 'csv'
	},
	zip: {
		type: 'document',
		icon: 'fa-file-archive',
		mimeType: 'application/zip',
		extension: 'zip'
	}
};

/**
 * Get file information from URL or filename
 */
export function getFileInfo(
	urlOrFilename: string,
	mimeType?: string
): FileInfo {
	// Try MIME type first if provided
	if (mimeType && MIME_TYPE_MAP[mimeType]) {
		return MIME_TYPE_MAP[mimeType];
	}

	// Extract extension from URL or filename
	const extension =
		getFileExtension(urlOrFilename).toLowerCase();

	if (EXTENSION_MAP[extension]) {
		return EXTENSION_MAP[extension];
	}

	// Default fallback
	return {
		type: 'other',
		icon: 'fa-file',
		mimeType: 'application/octet-stream',
		extension: extension || 'unknown'
	};
}

/**
 * Extract filename from URL
 */
export function getFilenameFromUrl(
	url: string
): string {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		return pathname.split('/').pop() || 'unknown';
	} catch {
		return url.split('/').pop() || 'unknown';
	}
}

/**
 * Extract file extension from filename or URL
 */
export function getFileExtension(
	filenameOrUrl: string
): string {
	const filename = getFilenameFromUrl(filenameOrUrl);
	const parts = filename.split('.');
	return parts.length > 1 ? parts.pop() || '' : '';
}

/**
 * Check if file is an image
 */
export function isImage(
	urlOrFilename: string,
	mimeType?: string
): boolean {
	return (
		getFileInfo(urlOrFilename, mimeType).type ===
		'image'
	);
}

/**
 * Check if file is audio
 */
export function isAudio(
	urlOrFilename: string,
	mimeType?: string
): boolean {
	return (
		getFileInfo(urlOrFilename, mimeType).type ===
		'audio'
	);
}

/**
 * Check if file is video
 */
export function isVideo(
	urlOrFilename: string,
	mimeType?: string
): boolean {
	return (
		getFileInfo(urlOrFilename, mimeType).type ===
		'video'
	);
}

/**
 * Format file size for display
 */
export function formatFileSize(
	bytes: number
): string {
	if (bytes === 0) return '0 B';

	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return (
		parseFloat((bytes / Math.pow(k, i)).toFixed(1)) +
		' ' +
		sizes[i]
	);
}
