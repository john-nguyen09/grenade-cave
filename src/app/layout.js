import { Inter } from 'next/font/google';
import './globals.css';

export const metadata = {
  title: 'Grenade Cave',
  description: 'Written for movie nights',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <div id="modal-root"></div>
      </body>
    </html>
  );
}