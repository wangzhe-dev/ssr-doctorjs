import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SSR Doctor Demo',
  description: 'Demonstrating SSR compatibility issues',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
