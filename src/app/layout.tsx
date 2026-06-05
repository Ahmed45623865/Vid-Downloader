import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Universal Video Downloader',
  description: 'Download your favorite videos & reels effortlessly. No Logins, No Ads, completely free.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}