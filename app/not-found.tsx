'use client';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#8B4513] mb-4">404</h1>
        <p className="text-[#333333] mb-4">Page not found</p>
        <a href="/" className="text-[#8B4513] hover:underline">
          Go back home
        </a>
      </div>
    </div>
  );
}
