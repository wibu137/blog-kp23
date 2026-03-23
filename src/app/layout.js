import { Be_Vietnam_Pro, Merriweather } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import { ThemeProvider } from 'next-themes';
import ThemeCom from './components/ThemeCom';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeModeScript } from 'flowbite-react';
import Footer from './components/Footer';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const merriweather = Merriweather({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  weight: ['400', '700'],
});

export const metadata = {
  title: "KP23's Blog",
  description: "KP23's Blog shares stories, ideas, and perspectives inspired by nature, people, and everyday life.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <head>
          <ThemeModeScript />
        </head>
        <body
          className={`${beVietnamPro.variable} ${merriweather.variable} antialiased`}
        >
          <ThemeProvider>
            <ThemeCom>
              <Header />
              {children}
              <Footer />
            </ThemeCom>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
