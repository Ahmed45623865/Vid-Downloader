export const maxDuration = 30; // Yeh Vercel ko batata hai ke is function ko 30s tak chalne do
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required.' }, { status: 400 });
    }

    const validDomains = ['youtube.com', 'youtu.be', 'instagram.com', 'facebook.com'];
    const platformMatch = validDomains.find(domain => url.toLowerCase().includes(domain));

    if (!platformMatch) {
      return NextResponse.json({ success: false, error: 'Provided URL is not supported.' }, { status: 400 });
    }

    let detectedPlatform = 'video';
    if (url.includes('youtube') || url.includes('youtu.be')) detectedPlatform = 'youtube';
    else if (url.includes('instagram')) detectedPlatform = 'instagram';
    else if (url.includes('facebook')) detectedPlatform = 'facebook';

    const binDir = path.join(process.cwd(), 'bin');
    const path1 = path.join(binDir, 'yt-dlp.exe');
    const path2 = path.join(binDir, 'yt-dlp.exe.exe');
    const path3 = path.join(binDir, 'yt-dlp');

    let finalPath = '';
    if (fs.existsSync(path1)) finalPath = path1;
    else if (fs.existsSync(path2)) finalPath = path2;
    else if (fs.existsSync(path3)) finalPath = path3;

    if (!finalPath) {
      return NextResponse.json({ success: false, error: 'yt-dlp file nahi mili.' }, { status: 500 });
    }

    let bypassFlags = [
      '--no-warnings',
      '--no-check-certificate',
      '--no-cache-dir',
      '--prefer-free-formats',
      '--youtube-skip-dash-manifest',
      '--user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"'
    ];

    const finalFlagsString = bypassFlags.join(' ');
    const command = `"${finalPath}" ${finalFlagsString} --dump-json "${url}"`;
    
    const { stdout, stderr } = await execPromise(command);

    if (stderr && !stdout) {
      return NextResponse.json({ success: false, error: 'Engine failed to parse link.' }, { status: 500 });
    }

    const metadata = JSON.parse(stdout);
    let uiFormats: any[] = [];

    if (metadata.formats && metadata.formats.length > 0) {
      if (detectedPlatform === 'youtube') {
        
        // 1. 🔊 VIDEO + VOICE (Pre-combined formats like 360p or 720p)
        const combinedFormats = metadata.formats
          .filter((f: any) => f.url && f.vcodec !== 'none' && f.acodec !== 'none')
          .map((f: any) => ({
            url: f.url,
            quality: `${f.height ? f.height + 'p' : 'Standard Quality'} (With Voice/Audio)`,
            ext: 'mp4',
            filesize: f.filesize || f.filesize_approx || null,
            height: f.height || 0
          }));

        // 2. 🎬 HIGH QUALITY HD (Video Only formats like 1080p, 1440p)
        const highQualities = metadata.formats
          .filter((f: any) => f.url && f.vcodec !== 'none' && f.acodec === 'none' && f.height && f.height >= 720)
          .map((f: any) => ({
            url: f.url,
            quality: `${f.height}p Ultra HD (Video Only)`,
            ext: f.ext || 'mp4',
            filesize: f.filesize || f.filesize_approx || null,
            height: f.height
          }));

        // 3. 🎵 AUDIO ONLY (MP3/M4A Stream)
        const audioOnly = metadata.formats
          .filter((f: any) => f.url && f.vcodec === 'none' && f.acodec !== 'none')
          .map((f: any) => ({
            url: f.url,
            quality: `Audio Only / MP3 (${f.abr ? Math.round(f.abr) + 'kbps' : 'HQ'})`,
            ext: 'mp3',
            filesize: f.filesize || f.filesize_approx || null,
            height: 0
          }));

        // Sorting separate categories by resolution
        highQualities.sort((a: any, b: any) => b.height - a.height);
        combinedFormats.sort((a: any, b: any) => b.height - a.height);

        // Sabko merge kar rahe hain: Pehle high qualities, phir "With Voice" waale aur end mein audio option
        uiFormats = [...combinedFormats, ...highQualities, ...audioOnly.slice(0, 1)];

      } else {
        // Instagram and Facebook default full quality layout
        uiFormats = metadata.formats
          .filter((f: any) => f.url && (f.vcodec !== 'none' || detectedPlatform === 'instagram'))
          .map((f: any) => ({
            url: f.url,
            quality: f.format_note || f.resolution || 'HD Quality',
            ext: f.ext || 'mp4',
            filesize: f.filesize || f.filesize_approx || null
          }));
      }
    }

    if (uiFormats.length === 0 && (metadata.url || metadata.requested_downloads)) {
      const fallbackUrl = metadata.url || (metadata.requested_downloads && metadata.requested_downloads[0]?.url);
      if (fallbackUrl) {
        uiFormats.push({
          url: fallbackUrl,
          quality: 'Normal Quality (With Audio)',
          ext: 'mp4',
          filesize: metadata.filesize || null
        });
      }
    }

    // Safe duplicate url filtering
    const uniqueFormats = uiFormats.filter((value: any, index: number, self: any[]) =>
      self.findIndex((t: any) => t.url === value.url) === index
    ).slice(0, 5); // Increased slice to 5 so user gets all clean variations

    const responseData = {
      title: metadata.title || 'Extracted Video Stream',
      thumbnail: metadata.thumbnail || null,
      duration: metadata.duration ? `${Math.floor(metadata.duration / 60)}:${String(Math.floor(metadata.duration % 60)).padStart(2, '0')}` : '00:15',
      platform: detectedPlatform,
      formats: uniqueFormats
    };

    return NextResponse.json({ success: true, data: responseData });

  } catch (error: any) {
    console.error('Crash log:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to extract video details. Please ensure the link is public.` 
    }, { status: 500 });
  }
}