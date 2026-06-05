'use client';

import React, { useState } from 'react';
import { DownloadCloud, Sparkles, Shield, Zap, Info } from 'lucide-react';
import UrlForm from '../components/UrlForm';
import VideoCard from '../components/VideoCard';
import ErrorMessage from '../components/ErrorMessage';
import { VideoMetadata, APIResponse } from '../types';

// Custom Pure SVG Icons to completely avoid Lucide library export issues
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  const handleFetchVideo = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setVideoData(null);
    setCurrentUrl(url);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result: APIResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Something went wrong while fetching the video.');
      }

      if (result.data) {
        setVideoData(result.data);
      } else {
        throw new Error('No metadata returned from server.');
      }
    } catch (err: any) {
      console.error('Frontend Fetch Error:', err);
      setError(err.message || 'Failed to connect to the extraction engine.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (currentUrl) {
      handleFetchVideo(currentUrl);
    }
  };

  // 🔥 RESET FUNCTION: Jo search bar clear hone par baki UI ko bhi clean karega
  const handleClearAll = () => {
    setVideoData(null);
    setError(null);
    setCurrentUrl('');
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 via-white to-slate-50 text-gray-900 selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-xl mb-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-200 transform hover:rotate-12 transition-all duration-300">
            <DownloadCloud className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
            Universal Video Downloader
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium">
            Download your favorite videos & reels effortlessly. No Logins, No Ads, completely free.
          </p>
        </div>

        {/* Input Form Box with onClear connection */}
        <UrlForm onSubmit={handleFetchVideo} isLoading={isLoading} onClear={handleClearAll} />

        {/* Interactive Supported Platforms Badge Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs sm:text-sm font-semibold text-gray-600">
          <span className="text-gray-400 font-normal">Supported:</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100 hover:scale-105 transition-transform">
            <YoutubeIcon className="w-4 h-4" /> YouTube
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-full border border-pink-100 hover:scale-105 transition-transform">
            <InstagramIcon className="w-4 h-4" /> Instagram
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 hover:scale-105 transition-transform">
            <FacebookIcon className="w-4 h-4" /> Facebook
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="w-full max-w-2xl mx-auto mt-12 p-6 border border-gray-100 rounded-3xl bg-white flex flex-col items-center justify-center space-y-4 shadow-xs animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-500">Analyzing video stream... Please wait.</p>
          </div>
        )}

        {/* Error Render Block */}
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}

        {/* Success Render Block */}
        {videoData && !isLoading && <VideoCard videoData={videoData} />}

        {/* Description / Features Grid Block */}
        <div className="w-full max-w-3xl mt-20 border-t border-gray-100 pt-12">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Info className="w-5 h-5 text-blue-500" /> Why Choose Universal Downloader?
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">High-speed serverless infrastructure for lightning fast downloads.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Blazing Fast Speed</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Direct MP4 stream source links without full-server side buffering reroutes.
              </p>
            </div>

            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">Secure & Clean</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                No tracking cookies, no sneaky browser extensions, and absolutely zero malicious scripts.
              </p>
            </div>

            <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-md transition-shadow group">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">HD Quality Retention</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Fetches original uploaded file resolution dimensions directly from content delivery networks.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}