/* Delivery Partner Profile Page */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DeliveryLayout from '@/components/delivery/DeliveryLayout';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award,
    TrendingUp,
    Package,
    Clock,
    Star,
    Edit,
    Camera,
    CheckCircle,
    Truck,
    IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeliveryProfile() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            if (session.user.role !== 'DELIVERY') {
                router.push('/');
                return;
            }
            // Load fresh profile data from database
            loadProfileData();
            fetchStats();
        }
    }, [status, session, router]);

    const loadProfileData = async () => {
        try {
            const res = await fetch('/api/delivery/profile');
            const data = await res.json();
            if (data.success) {
                if (data.user.image) {
                    setProfileImage(data.user.image);
                }
                setFormData({
                    name: data.user.name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || '',
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    // Upload to Cloudinary
                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ file: reader.result }),
                    });

                    if (!uploadRes.ok) throw new Error('Upload failed');

                    const uploadData = await uploadRes.json();

                    // Update user profile in database
                    const updateRes = await fetch('/api/delivery/profile', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ profileImage: uploadData.url }),
                    });

                    if (!updateRes.ok) throw new Error('Profile update failed');

                    const updateData = await updateRes.json();

                    // Update local state immediately - no reload needed!
                    setProfileImage(updateData.profileImage);
                    setUploading(false);
                    toast.success('Profile picture updated successfully!');
                } catch (error) {
                    console.error('Upload error:', error);
                    toast.error('Failed to upload image');
                    setUploading(false);
                }
            };

            reader.onerror = () => {
                toast.error('Failed to read file');
                setUploading(false);
            };
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to process image');
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Email is required');
            return;
        }

        setSaving(true);

        try {
            const res = await fetch('/api/delivery/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to update profile');
            }

            toast.success('Profile updated successfully!');
            setIsEditing(false);

            // Reload to refresh session
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        loadProfileData(); // Reset form data
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/delivery/orders');
            const data = await res.json();
            setStats(data.stats || {});
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    const joinDate = session?.user?.createdAt ? new Date(session.user.createdAt) : new Date();
    const memberSince = joinDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    return (
        <DeliveryLayout session={session}>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-6xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-500 mt-1">Manage your account and view your performance</p>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        {/* Cover Image */}
                        <div className="h-32 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 relative">
                            <div className="absolute -bottom-16 left-6">
                                <div className="relative">
                                    <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                                        {profileImage ? (
                                            <img
                                                src={profileImage}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-28 h-28 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                                {session?.user?.name?.[0]?.toUpperCase() || 'D'}
                                            </div>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="profile-upload"
                                        className={`absolute bottom-0 right-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition shadow-lg cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {uploading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Camera className="w-5 h-5" />
                                        )}
                                    </label>
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="pt-20 px-6 pb-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{session?.user?.name || 'Delivery Partner'}</h2>
                                    <p className="text-gray-500 flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        Delivery Partner
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                                        <Calendar className="w-4 h-4" />
                                        Member since {memberSince}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            </div>

                            {/* Contact Information / Edit Form */}
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                                            placeholder="+91 XXXXXXXXXX"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={saving}
                                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Email Address</p>
                                            <p className="text-sm font-semibold text-gray-900">{formData.email || 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                                            <p className="text-sm font-semibold text-gray-900">{formData.phone || '+91 XXXXXXXXXX'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.completed || 0}</p>
                            <p className="text-sm text-gray-500">Completed Deliveries</p>
                        </div>

                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.active || 0}</p>
                            <p className="text-sm text-gray-500">Active Deliveries</p>
                        </div>

                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Star className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">4.8</p>
                            <p className="text-sm text-gray-500">Average Rating</p>
                        </div>

                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">98%</p>
                            <p className="text-sm text-gray-500">Success Rate</p>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Account Details */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-green-600" />
                                Account Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">User ID</span>
                                    <span className="text-sm font-semibold text-gray-900">{session?.user?.id || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Account Type</span>
                                    <span className="text-sm font-semibold text-green-600">Delivery Partner</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">Active</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-sm text-gray-600">Verification</span>
                                    <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        Verified
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition flex items-center justify-between group">
                                    <span className="font-semibold text-gray-700">Update Contact Information</span>
                                    <Edit className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                </button>
                                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition flex items-center justify-between group">
                                    <span className="font-semibold text-gray-700">Change Password</span>
                                    <Edit className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                </button>
                                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition flex items-center justify-between group">
                                    <span className="font-semibold text-gray-700">Notification Settings</span>
                                    <Edit className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                </button>
                                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition flex items-center justify-between group">
                                    <span className="font-semibold text-gray-700">Payment Methods</span>
                                    <Edit className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-600" />
                            Achievements & Badges
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <p className="font-bold text-gray-900 text-sm">First Delivery</p>
                                <p className="text-xs text-gray-600">Completed</p>
                            </div>

                            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                                <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Star className="w-8 h-8 text-white" />
                                </div>
                                <p className="font-bold text-gray-900 text-sm">Top Rated</p>
                                <p className="text-xs text-gray-600">4.8+ Rating</p>
                            </div>

                            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-lg border-2 border-green-200">
                                <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <p className="font-bold text-gray-900 text-sm">100 Deliveries</p>
                                <p className="text-xs text-gray-600">Milestone</p>
                            </div>

                            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                                <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </div>
                                <p className="font-bold text-gray-900 text-sm">Fast Delivery</p>
                                <p className="text-xs text-gray-600">Speed Master</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DeliveryLayout>
    );
}
