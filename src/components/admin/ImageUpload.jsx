'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function ImageUpload({ images = [], onChange, maxImages = 5 }) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});

    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true);
        const newImages = [];

        for (const file of acceptedFiles) {
            if (images.length + newImages.length >= maxImages) {
                alert(`Maximum ${maxImages} images allowed`);
                break;
            }

            try {
                // Convert file to base64
                const reader = new FileReader();
                const fileData = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });

                // Upload via server-side API
                setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file: fileData }),
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                newImages.push(data.url);
                setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image: ' + file.name);
            }
        }

        onChange([...images, ...newImages]);
        setUploading(false);
        setUploadProgress({});
    }, [images, onChange, maxImages]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: maxImages - images.length,
        disabled: uploading || images.length >= maxImages,
    });

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Upload Zone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${isDragActive
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-500 hover:bg-gray-50'
                    } ${uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                    <p className="text-green-600 font-semibold">Drop images here...</p>
                ) : (
                    <div>
                        <p className="text-gray-700 font-semibold mb-2">
                            Drag & drop images here, or click to select
                        </p>
                        <p className="text-sm text-gray-500">
                            PNG, JPG, JPEG, WEBP up to 10MB ({images.length}/{maxImages} images)
                        </p>
                    </div>
                )}
            </div>

            {/* Upload Progress */}
            {uploading && Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                    {Object.entries(uploadProgress).map(([filename, progress]) => (
                        <div key={filename} className="bg-gray-100 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-700 truncate">{filename}</span>
                                <span className="text-sm text-gray-600">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-300 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                                src={url}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                    Primary
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {images.length === 0 && !uploading && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No images uploaded yet</p>
                </div>
            )}
        </div>
    );
}
