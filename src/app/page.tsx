'use client';

import Link from 'next/link';

// Icons
const Icons = {
  notFound: (
    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  back: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
};

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center text-green-500">
              {Icons.notFound}
            </div>
          </div>

          {/* 404 Text */}
          <div className="mb-4">
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-600">
              404
            </h1>
          </div>

          {/* Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ไม่พบหน้าที่ต้องการ
            </h2>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Web Push Notification System v2.0</p>
        </div>
      </div>
    </main>
  );
}