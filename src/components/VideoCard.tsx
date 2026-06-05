import React from 'react';
import { Download, Clock, Video } from 'lucide-react';
import { VideoMetadata } from '../types';

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

interface VideoCardProps {
  videoData: VideoMetadata;
}

export default function VideoCard({ videoData }: VideoCardProps) {
  const { title, thumbnail, duration, platform, formats } = videoData;

  const getPlatformBadge = () => {
    switch (platform?.toLowerCase()) {
      case 'youtube':
        return { bg: 'bg-red-50 text-red-600 border-red-100', icon: <YouTubeIcon className="w-4 h-4" />, label: 'YouTube' };
      case 'instagram':
        return { bg: 'bg-pink-50 text-pink-600 border-pink-100', icon: <InstagramIcon className="w-4 h-4" />, label: 'Instagram' };
      case 'facebook':
        return { bg: 'bg-blue-50 text-blue-600 border-blue-100', icon: <FacebookIcon className="w-4 h-4" />, label: 'Facebook' };
      default:
        return { bg: 'bg-gray-50 text-gray-600 border-gray-100', icon: <Video className="w-4 h-4" />, label: 'Video' };
    }
  };

  const badge = getPlatformBadge();

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDirectDownload = async (e: React.MouseEvent<HTMLButtonElement>, streamUrl: string, qualityName: string) => {
    e.preventDefault();
    const btn = e.currentTarget;
    const originalContent = btn.innerHTML;
    
    try {
      btn.disabled = true;
      btn.innerHTML = `<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>`;

      const response = await fetch(streamUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${qualityName}.mp4`;
      document.body.appendChild(tempLink);
      tempLink.click();
      
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(streamUrl, '_blank');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
        <div className="relative w-full sm:w-48 aspect-video sm:h-28 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">No Preview</div>
          )}
          {duration && duration !== '00:00' && (
            <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Clock className="w-3 h-3" /> {duration}
            </span>
          )}
        </div>

        <div className="flex flex-col justify-between py-0.5">
          <div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} w-fit mb-3`}>
              {badge.icon} {badge.label}
            </div>
            <h3 className="text-gray-800 font-bold text-base sm:text-lg line-clamp-2 leading-snug">{title}</h3>
          </div>
        </div>
      </div>

      <hr className="border-gray-50 mx-6" />

      <div className="p-5 sm:p-6 bg-gray-50/50">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Available Download Qualities</h4>
        {!formats || formats.length === 0 ? (
          <p className="text-sm text-gray-500 italic p-2">No direct formats found for this link.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formats.map((format, idx) => {
              const sizeStr = formatSize(format.filesize);
              return (
                <button
                  key={idx}
                  onClick={(e) => handleDirectDownload(e, format.url, format.quality)}
                  className="w-full flex items-center justify-between bg-white hover:bg-blue-50 border border-gray-100 hover:border-blue-200 p-3.5 rounded-xl text-gray-700 hover:text-blue-700 font-medium text-sm transition-all shadow-sm group cursor-pointer"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-gray-800 group-hover:text-blue-800 capitalize">{format.quality}</span>
                    {format.ext && <span className="text-[11px] text-gray-400 font-normal uppercase">Format: {format.ext} {sizeStr ? `• ${sizeStr}` : ''}</span>}
                  </div>
                  <div className="bg-gray-50 group-hover:bg-blue-600 text-gray-400 group-hover:text-white p-2 rounded-xl transition-all">
                    <Download className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}