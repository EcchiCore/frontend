'use client';

import { useEffect } from 'react';

export default function ChatPage() {
  useEffect(() => {
    // โหลดสคริปต์ tawk.to เมื่อ component mount
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/67f38e4aa1fb1b1908fad00e/1io7m7m1n'; // แทนที่ด้วย Property ID และ Widget ID ของคุณ
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        {/* Header */}
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center text-primary">
            ยินดีต้อนรับสู่แชทของเรา
          </h1>
          <p className="text-center text-base-content mt-2">
            ติดต่อเราผ่านแชทสดได้ทันที ทีมงานพร้อมช่วยเหลือคุณ!
          </p>
        </div>

        {/* Content */}
        <div className="card-body pt-0">
          <div className="flex flex-col items-center gap-4">
            {/* Icon */}
            <div className="avatar">
              <div className="w-24 rounded-full bg-primary/10 p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-16 h-16 text-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 12h8m-4-4v8m9-4A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
            </div>

            {/* Button */}
            <button
              className="btn btn-primary btn-wide"
              onClick={() => window.Tawk_API?.toggle()} // เปิด/ปิดแชทเมื่อกดปุ่ม
            >
              เริ่มแชททันที
            </button>


          </div>
        </div>
      </div>
    </div>
  );
}