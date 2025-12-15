import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">FreshCart</h3>
                        <p className="text-sm mb-4">
                            Your trusted partner for fresh groceries delivered right to your doorstep. Quality products, fast delivery, and great prices.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-green-500 transition">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-green-500 transition">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-green-500 transition">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-green-500 transition">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-green-500 transition">About Us</Link></li>
                            <li><Link href="/products" className="hover:text-green-500 transition">Shop</Link></li>
                            <li><Link href="/offers" className="hover:text-green-500 transition">Offers</Link></li>
                            <li><Link href="/blog" className="hover:text-green-500 transition">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-green-500 transition">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/faq" className="hover:text-green-500 transition">FAQ</Link></li>
                            <li><Link href="/shipping" className="hover:text-green-500 transition">Shipping Info</Link></li>
                            <li><Link href="/returns" className="hover:text-green-500 transition">Returns</Link></li>
                            <li><Link href="/terms" className="hover:text-green-500 transition">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-green-500 transition">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start space-x-2">
                                <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>123 Market Street, Mumbai, India</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Phone className="w-5 h-5 text-green-500" />
                                <span>+91 1234567890</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Mail className="w-5 h-5 text-green-500" />
                                <span>support@freshcart.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} FreshCart. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
