// Premium Inline SVG Templates for Antigravity Installer Dashboard
const Icons = {
  core: `
    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="url(#gradient-cyan)" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 2"/>
      <circle cx="12" cy="12" r="6" stroke="url(#gradient-indigo)" stroke-width="1.5" class="svg-spin-slow"/>
      <circle cx="12" cy="12" r="2" fill="url(#gradient-cyan)"/>
      <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <defs>
        <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00f2fe"/>
          <stop offset="100%" stop-color="#4facfe"/>
        </linearGradient>
        <linearGradient id="gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#667eea"/>
          <stop offset="100%" stop-color="#764ba2"/>
        </linearGradient>
      </defs>
    </svg>
  `,
  ide: `
    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="18" rx="3" stroke="url(#gradient-magenta)" stroke-width="2"/>
      <path d="M7 8L3.5 12L7 16" stroke="url(#gradient-indigo)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 8L20.5 12L17 16" stroke="url(#gradient-indigo)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.5 7L10.5 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="#f00ff0" class="svg-pulse"/>
      <defs>
        <linearGradient id="gradient-magenta" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff007f"/>
          <stop offset="100%" stop-color="#764ba2"/>
        </linearGradient>
      </defs>
    </svg>
  `,
  cli: `
    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="url(#gradient-green)" stroke-width="2"/>
      <path d="M6 9L9 12L6 15" stroke="url(#gradient-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="11" y1="15" x2="17" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="svg-blink"/>
      <defs>
        <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38ef7d"/>
          <stop offset="100%" stop-color="#11998e"/>
        </linearGradient>
      </defs>
    </svg>
  `,
  check: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 13L9 17L19 7" stroke="#38ef7d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  sync: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="svg-spin">
      <path d="M21.5 2V6H17.5M2.5 22V18H6.5M2 12C2 6.47715 6.47715 2 12 2C16.8213 2 20.8427 5.4124 21.7483 10M22 12C22 17.5228 17.5228 22 12 22C7.1787 22 3.15733 18.5876 2.25171 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Icons;
}
