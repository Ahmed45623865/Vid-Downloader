'use client';

import React, { useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  onClear: () => void; // 🔥 Naya prop add kiya hai parent state clear karne k liye
}

export default function UrlForm({ onSubmit, isLoading, onClear }: UrlFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  // 🔥 Dono state aik sath saaf hongi ab
  const handleReset = () => {
    setUrl('');
    onClear(); // Yeh line niche se video card ko bhi hata degi
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mt-8">
      <div className="relative flex items-center bg-white border border-gray-100 rounded-2xl p-2 shadow-sm hover:shadow-md focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
        
        {/* Search Icon */}
        <div className="pl-3 text-gray-400 pointer-events-none shrink-0">
          <Search className="w-5 h-5" />
        </div>

        {/* Input Field */}
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube, Instagram, or Facebook link here..."
          className="w-full px-3 py-3 text-sm sm:text-base text-gray-800 bg-transparent border-none outline-none placeholder-gray-400"
          disabled={isLoading}
          required
        />

        {/* Reset Button */}
        {url && !isLoading && (
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 mr-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer shrink-0"
            title="Clear input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base px-5 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:bg-blue-600 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Fetch</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </form>
  );
}