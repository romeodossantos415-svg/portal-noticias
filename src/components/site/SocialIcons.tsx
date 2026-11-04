type P = { className?: string };
const Instagram = (p: P) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const Facebook = (p: P) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="currentColor" aria-hidden>
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
  </svg>
);
const X = (p: P) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="currentColor" aria-hidden>
    <path d="M18.9 2H22l-7.3 8.3L23.2 22h-6.8l-5.3-6.9L5 22H1.9l7.8-8.9L.8 2h6.9l4.8 6.3L18.9 2zm-1.2 18h1.9L7.4 3.9H5.4L17.7 20z" />
  </svg>
);
const Youtube = (p: P) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="currentColor" aria-hidden>
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
  </svg>
);
const TikTok = (p: P) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="currentColor" aria-hidden>
    <path d="M16.5 2c.3 2.4 1.7 3.9 4 4.1v3.3c-1.5 0-2.9-.5-4-1.3v6.6c0 3.6-2.9 6.3-6.4 6.3S3.7 18.3 3.7 14.7c0-3.5 2.8-6.2 6.3-6.3v3.4c-1.6.1-2.9 1.3-2.9 2.9 0 1.6 1.3 2.9 2.9 2.9 1.7 0 3-1.3 3-3V2h3.5z" />
  </svg>
);
const WhatsApp = (p: P) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
  </svg>
);
const Linkedin = (p: P) => (
  <svg viewBox="0 0 24 24" className={p.className} fill="currentColor" aria-hidden>
    <path d="M20.4 2H3.6A1.6 1.6 0 0 0 2 3.6v16.8A1.6 1.6 0 0 0 3.6 22h16.8a1.6 1.6 0 0 0 1.6-1.6V3.6A1.6 1.6 0 0 0 20.4 2zM8 19H5V9h3v10zM6.5 7.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM19 19h-3v-4.9c0-1.2 0-2.7-1.6-2.7s-1.9 1.3-1.9 2.6V19h-3V9h2.9v1.4a3.2 3.2 0 0 1 2.9-1.6c3 0 3.6 2 3.6 4.6V19z" />
  </svg>
);

export const SOCIAL_ICONS: Record<string, { Icon: React.ComponentType<P>; label: string }> = {
  instagram: { Icon: Instagram, label: "Instagram" },
  facebook: { Icon: Facebook, label: "Facebook" },
  x: { Icon: X, label: "X" },
  youtube: { Icon: Youtube, label: "YouTube" },
  tiktok: { Icon: TikTok, label: "TikTok" },
  whatsapp: { Icon: WhatsApp, label: "WhatsApp" },
  linkedin: { Icon: Linkedin, label: "LinkedIn" },
};

export function SocialIcons({ links, className = "", size = "h-4 w-4" }: { links: Record<string, string>; className?: string; size?: string }) {
  const entries = Object.entries(links ?? {}).filter(([k, v]) => v && SOCIAL_ICONS[k]);
  if (!entries.length) return null;
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {entries.map(([k, v]) => {
        const { Icon, label } = SOCIAL_ICONS[k];
        const href = k === "whatsapp" && !v.startsWith("http") ? `https://wa.me/${v.replace(/\D/g, "")}` : v;
        return (
          <a key={k} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="p-2 rounded-full hover:bg-black/5 transition">
            <Icon className={size} />
          </a>
        );
      })}
    </div>
  );
}
