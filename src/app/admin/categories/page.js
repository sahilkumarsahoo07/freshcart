'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Grid, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '🛍️',
        description: '',
        order: 0,
    });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (data.categories) {
                setCategories(data.categories);
            }
        } catch (err) {
            console.error('Failed to load categories:', err);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                icon: category.icon || '🛍️',
                description: category.description || '',
                order: category.order || 0,
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                slug: '',
                icon: '🛍️',
                description: '',
                order: categories.length + 1,
            });
        }
        setModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingCategory
                ? `/api/categories/${editingCategory._id}`
                : '/api/categories';
            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Operation failed');
            }

            toast.success(editingCategory ? 'Category updated!' : 'Category created!');
            setModalOpen(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.message || 'Error saving category');
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete category');

            toast.success('Category deleted successfully!');
            fetchCategories();
        } catch (err) {
            toast.error(err.message || 'Error deleting category');
        }
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Grid className="w-6 h-6 text-emerald-600" />
                        Category Management
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Organize products into categories for easy browsing</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow flex items-center gap-2 self-start md:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Add New Category
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 font-semibold text-sm">
                        Loading category list...
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-extrabold tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="py-3.5 px-4">Icon</th>
                                    <th className="py-3.5 px-4">Category Name</th>
                                    <th className="py-3.5 px-4">Slug</th>
                                    <th className="py-3.5 px-4">Products</th>
                                    <th className="py-3.5 px-4">Display Order</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-gray-50/80 transition">
                                        <td className="py-3 px-4">
                                            <span className="text-2xl">{cat.icon || '🛍️'}</span>
                                        </td>
                                        <td className="py-3 px-4 font-bold text-gray-900">
                                            {cat.name}
                                            {cat.description && (
                                                <p className="text-[11px] text-gray-400 font-normal line-clamp-1">{cat.description}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-xs font-mono text-gray-500">
                                            {cat.slug}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-2.5 py-1 rounded-full">
                                                {cat.productCount || 0} items
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-bold text-gray-700">
                                            #{cat.order || 0}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit category"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat._id, cat.name)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    title="Delete category"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="text-sm font-bold text-gray-700">No categories found</p>
                    </div>
                )}
            </div>

            {/* Category Form Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="font-extrabold text-lg text-gray-900">
                                {editingCategory ? 'Edit Category' : 'Create New Category'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Fresh Dairy"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Emoji Icon</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="🥦"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-center text-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">URL Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="dairy (leave blank to auto-generate)"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Short description for this category..."
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                ></textarea>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
                                >
                                    {editingCategory ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
