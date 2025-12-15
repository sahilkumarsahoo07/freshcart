import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/providers/AuthProvider';
import RoleRedirect from '@/components/auth/RoleRedirect';
import ActiveOrderPopup from '@/components/orders/ActiveOrderTracker';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FreshCart - Your Online Grocery Store',
  description: 'Get fresh groceries delivered to your doorstep',
  keywords: 'grocery delivery, online grocery, fresh vegetables, fruits, dairy products',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <RoleRedirect>
            {children}
            {/* Global Active Orders Popup */}
            <ActiveOrderPopup />
          </RoleRedirect>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
