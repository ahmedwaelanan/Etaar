export default function Footer() {
  return (
    <footer
      className="mt-0 border-t"
      style={{
        background: '#F5F2ED',
        borderColor: 'rgba(41,42,40,0.10)',
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-8 sm:py-12 flex flex-col items-center text-center gap-6">
        
        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center transition-all duration-300"
            style={{
              border: '1px solid rgba(180,154,104,0.45)',
              background: 'rgba(180,154,104,0.06)',
            }}
          >
            <span
              className="font-bold text-lg"
              style={{
                color: '#B49A68',
                fontFamily: 'Amiri, serif',
              }}
            >
              إ
            </span>
          </div>
          <div>
            <p
              className="font-bold text-sm"
              style={{
                color: '#292A28',
                fontFamily: 'Tajawal, sans-serif',
              }}
            >
              JIDAAR — إطار
            </p>
            <p
              className="text-xs mt-1"
              style={{
                color: '#9B9388',
                fontFamily: 'Tajawal, sans-serif',
              }}
            >
              كل لحظة تستحق إطار
            </p>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-3">
          {/* Instagram */}
          <a href="#" aria-label="Instagram" className="group w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-black/5" style={{ color: '#91897E' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" className="transition-all duration-300 group-hover:text-[#B49A68] group-hover:-translate-y-0.5">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>

          {/* Facebook */}
          <a href="#" aria-label="Facebook" className="group w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-black/5" style={{ color: '#91897E' }}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="transition-all duration-300 group-hover:text-[#B49A68] group-hover:-translate-y-0.5">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.02 4.388 11.04 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.98h-1.514c-1.491 0-1.956.93-1.956 1.886v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.113 24 18.093 24 12.073Z" />
            </svg>
          </a>

          {/* TikTok */}
          <a href="#" aria-label="TikTok" className="group w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-black/5" style={{ color: '#91897E' }}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="transition-all duration-300 group-hover:text-[#B49A68] group-hover:-translate-y-0.5">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.46.83-2.86 1.84-3.91 1.23-1.32 3.01-2.08 4.83-2.07.02 1.42-.01 2.84.02 4.26-.67-.18-1.39-.13-2.04.1-.76.27-1.4.86-1.75 1.59-.31.62-.29 1.34-.18 2 .21 1.31 1.37 2.42 2.71 2.56 1.21.13 2.47-.5 3.07-1.57.22-.39.33-.83.34-1.28.03-2.61.02-5.22.02-7.84 0-4.63.01-9.27 0-13.9z" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a href="https://wa.me/201000000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="group w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-black/5" style={{ color: '#91897E' }}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="transition-all duration-300 group-hover:text-[#B49A68] group-hover:-translate-y-0.5">
              <path d="M12 0a12 12 0 00-10.35 17.9L0 24l6.3-1.65A12 12 0 1012 0zm0 2a10 10 0 11-5.62 18.33l-.36-.22-3.74.98 1-3.64-.24-.38A10 10 0 0112 2zm5.29 14.5c-.22.6-1.2 1.17-1.66 1.2-.43.04-.97.2-3.13-.64-2.63-1.02-4.3-3.7-4.43-3.88-.13-.17-1.06-1.4-1.06-2.66s.66-1.88.9-2.13c.22-.24.48-.3.64-.3h.46c.15 0 .35-.06.54.42.22.6.75 2.06.82 2.2.06.15.1.32.02.5-.08.17-.12.28-.24.43-.12.15-.25.34-.36.45-.12.12-.24.25-.1.49.14.24.62 1.03 1.33 1.66.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.16 1.18z"/>
            </svg>
          </a>
        </div>

        {/* Divider */}
        <div className="w-full max-w-xs h-px" style={{ background: 'rgba(41,42,40,0.09)' }} />

        {/* Contact & Statement */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-[13px]" style={{ fontFamily: 'Tajawal, sans-serif' }}>
            <a href="https://wa.me/201000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#292A28] hover:text-[#B49A68] transition-colors duration-300">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0a12 12 0 00-10.35 17.9L0 24l6.3-1.65A12 12 0 1012 0zm0 2a10 10 0 11-5.62 18.33l-.36-.22-3.74.98 1-3.64-.24-.38A10 10 0 0112 2zm5.29 14.5c-.22.6-1.2 1.17-1.66 1.2-.43.04-.97.2-3.13-.64-2.63-1.02-4.3-3.7-4.43-3.88-.13-.17-1.06-1.4-1.06-2.66s.66-1.88.9-2.13c.22-.24.48-.3.64-.3h.46c.15 0 .35-.06.54.42.22.6.75 2.06.82 2.2.06.15.1.32.02.5-.08.17-.12.28-.24.43-.12.15-.25.34-.36.45-.12.12-.24.25-.1.49.14.24.62 1.03 1.33 1.66.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.16 1.18z"/>
              </svg>
              واتساب: 100 000 0000
            </a>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-[#9B9388]/50"></span>
            <a href="mailto:info@jidaar.com" className="flex items-center gap-1.5 text-[#292A28] hover:text-[#B49A68] transition-colors duration-300">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path d="M3 8l9 6 9-6M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8M3 8l2-2h14l2 2" />
              </svg>
              info@jidaar.com
            </a>
          </div>

          <div
            className="text-center"
            style={{
              color: '#A39B91',
              fontSize: '10px',
              letterSpacing: '0.28em',
              fontFamily: 'Tajawal, sans-serif',
            }}
          >
            DESIGNED WALLS · INSPIRED SPACES
          </div>
        </div>

        {/* Bottom Row */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p
            className="text-[10px] sm:text-[11px]"
            style={{
              color: '#A39B91',
              fontFamily: 'Tajawal, sans-serif',
            }}
          >
            © {new Date().getFullYear()} JIDAAR — إطار. جميع الحقوق محفوظة
          </p>
          <p
            className="text-[9px] sm:text-[10px]"
            style={{
              color: '#B49A68',
              letterSpacing: '0.12em',
              fontFamily: 'Tajawal, sans-serif',
            }}
          >
            MADE WITH INTENTION
          </p>
        </div>

      </div>
    </footer>
  )
}