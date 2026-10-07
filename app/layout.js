import './globals.css';
import WidgetSyncLifecycle from '@/components/WidgetSyncLifecycle';

export const metadata = {
  title: 'OPS — Personal Operating System',
  description: 'Your second brain. Personal OS for college, GATE, startup, and life.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="512x512" href="/ops.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/ops.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <WidgetSyncLifecycle />
        {children}
      </body>
    </html>
  );
}
