import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { VideoMetadata, VideoFormat } from '../types';

export function detectPlatform(url: string): 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'unknown' {
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/instagram\.com/i.test(url)) return 'instagram';
  if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
  return 'unknown';
}

function formatDuration(seconds: number): string {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export async function extractVideoMetadata(url: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const platform = detectPlatform(url);
    if (platform === 'unknown') return reject(new Error('Unsupported platform URL provided.'));

    // Vercel fix: Ensure absolute path
    const binaryPath = path.resolve(process.cwd(), 'bin', 'yt-dlp');

    // Vercel/Linux fix: Ensure binary is executable
    if (process.env.NODE_ENV === 'production' && fs.existsSync(binaryPath)) {
      try {
        fs.chmodSync(binaryPath, '755');
      } catch (e) {
        console.error("Chmod error:", e);
      }
    }

    const args = [
      '--dump-json', '--no-playlist', '--no-warnings', '--no-check-certificate',
      '--prefer-free-formats', '--youtube-skip-dash-manifest',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      url
    ];

    execFile(binaryPath, args, { timeout: 25000, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error('yt-dlp error:', stderr || error.message);
        return reject(new Error('Extraction failed. The video might be private or geo-restricted.'));
      }

      try {
        const rawData = JSON.parse(stdout);
        let extractedFormats: VideoFormat[] = [];

        if (rawData.formats) {
          if (platform === 'youtube') {
            const combined = rawData.formats.filter((f: any) => f.url && f.vcodec !== 'none' && f.acodec !== 'none').map((f: any) => ({
              quality: `${f.height || 'SD'}p (With Audio)`, url: f.url, ext: 'mp4', height: f.height || 0
            }));
            const videoOnly = rawData.formats.filter((f: any) => f.url && f.vcodec !== 'none' && f.acodec === 'none' && f.height >= 720).map((f: any) => ({
              quality: `${f.height}p Ultra HD (Video Only)`, url: f.url, ext: f.ext || 'mp4', height: f.height
            }));
            extractedFormats = [...combined.sort((a: any, b: any) => b.height - a.height), ...videoOnly.sort((a: any, b: any) => b.height - a.height)];
          } else {
            extractedFormats = rawData.formats.filter((f: any) => f.url && (f.vcodec !== 'none' || platform === 'instagram')).map((f: any) => ({
              quality: f.format_note || 'HD Quality', url: f.url, ext: f.ext || 'mp4'
            }));
          }
        }

        if (extractedFormats.length === 0 && rawData.url) {
          extractedFormats.push({ quality: 'Best Quality', url: rawData.url, ext: rawData.ext || 'mp4' });
        }

        resolve({
          platform,
          title: rawData.title || 'Untitled Video',
          thumbnail: rawData.thumbnail || rawData.thumbnails?.[0]?.url || '',
          duration: formatDuration(rawData.duration),
          formats: extractedFormats.slice(0, 5)
        });
      } catch (e) {
        reject(new Error('Failed to process metadata.'));
      }
    });
  });
}