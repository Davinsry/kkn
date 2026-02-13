import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "KKN MH - Jadwal & Catatan",
  description: "Sistem Manajemen Jadwal KKN MH",
  icons: {
    icon: '/favicon.png',
  },
  keywords: ['KKN', 'jadwal', 'schedule', 'manajemen', 'kegiatan'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
