import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Executable layout framework to build the vector graphic
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: '#0f172a', // Premium charcoal slate base
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '25%', // Smooth rounded look
        }}
      >
        {/* Dynamic Vector Cash Register SVG Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#14b8a6" // Brand Teal Accent
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <path d="M6 14h.01M10 14h.01M14 14h.01M18 14h.01" />
          <path d="M12 17v4M8 21h8" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
