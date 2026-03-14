import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QRON — Living QR Art',
  description: 'Blockchain-authenticated QR code platform with AI stories and QRON token rewards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold tracking-tight text-white">
            QRON<span className="text-purple-400">.</span>space
          </a>
          <div className="flex gap-6 text-sm text-white/70">
            <a href="/services" className="hover:text-white transition-colors">Services</a>
            <a href="/orders" className="hover:text-white transition-colors">My Orders</a>
            <a href="/admin/orders" className="hover:text-white transition-colors text-yellow-400/80">Admin</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
