import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agentic Studio | ChatGPT Agent Builder',
  description:
    'Design, simulate, and export tailored conversational agents powered by ChatGPT with a guided workflow.',
  openGraph: {
    title: 'Agentic Studio',
    description:
      'Design, simulate, and export tailored conversational agents powered by ChatGPT.',
    url: 'https://agentic-a2f68112.vercel.app',
    siteName: 'Agentic Studio',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agentic Studio',
    description:
      'Design, simulate, and export tailored conversational agents powered by ChatGPT.'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
