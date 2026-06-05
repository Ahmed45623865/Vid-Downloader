export interface VideoFormat {
  url: string;
  quality: string;
  ext?: string;
  filesize?: number | null;
}

export interface VideoMetadata {
  title: string;
  thumbnail?: string;
  duration?: string;
  platform: string;
  formats: VideoFormat[];
}

export interface APIResponse {
  success: boolean;
  data?: VideoMetadata;
  error?: string;
}