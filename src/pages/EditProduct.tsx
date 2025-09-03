import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit3, FiSave, FiX, FiImage, FiTrash2 } from 'react-icons/fi';
import { Footer } from '../components/Footer';
import { useAuthContext } from '../AuthContext/AuthContext';

// Define Product type (same as in ProductDetails)
interface Product {
  id: number;
  name: string;
  price: number;
  seller: string;
  images: string[];
  category: string;
  rating: number;
  description: string;
  ownerId?: string | number;
  publishedAt?: string;
}

export function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthContext();
  

  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    images: [] as string[]
  });
  
  // Store the original product data to preserve fields not in the form
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch existing product data when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const headers: HeadersInit = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${apiUrl}/products/${id}`, { headers });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found');
          } else {
            setError('Failed to load product');
          }
          return;
        }

        const productData: Product = await response.json();
        
        // Check if user owns this product
        if (productData.ownerId !== user?.id) {
          setError('You can only edit your own products');
          return;
        }

        // Store the original product data to preserve fields not in the form
        setOriginalProduct(productData);

        // Populate form with existing data
        setFormData({
          name: productData.name,
          price: productData.price.toString(),
          category: productData.category,
          description: productData.description,
          images: productData.images
        });
        

      } catch (error) {
        console.error('Failed to fetch product:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, accessToken, user]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image URL input
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Add new image field
  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  // Remove image field
  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      setError('You must be logged in to edit products');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        images: formData.images.filter(img => img.trim() !== ''), // Remove empty image URLs
        // Preserve original fields that are not in the form
        seller: originalProduct?.seller || '',
        rating: originalProduct?.rating || 0,
        ownerId: originalProduct?.ownerId || user?.id,
        publishedAt: originalProduct?.publishedAt || new Date().toISOString()
      };



      const response = await fetch(`${apiUrl}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/product/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Failed to update product:', error);
      setError('Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FiEdit3 className="text-[#8b5cf6]" />
            Edit Product
          </h1>
          <p className="text-gray-400">Update your product information</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400">Product updated successfully! Redirecting...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent text-white placeholder-gray-400"
              placeholder="Enter product name"
            />
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent text-white placeholder-gray-400"
                  placeholder="0.00"
                />
              </div>
            </div>

                         <div>
               <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                 Category *
               </label>
                               <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent text-white"
                >
                                   <option value="">Select category</option>
                 <option value="Electronics">Electronics</option>
                 <option value="Furniture">Furniture</option>
                 <option value="Home & Garden">Home & Garden</option>
                 <option value="Clothing">Clothing</option>
                 <option value="Books">Books</option>
                 <option value="Sports & Outdoors">Sports & Outdoors</option>
                 <option value="Beauty & Health">Beauty & Health</option>
                 <option value="Toys & Games">Toys & Games</option>
                 <option value="Automotive">Automotive</option>
                 <option value="Art & Collectibles">Art & Collectibles</option>
                 <option value="Food & Beverages">Food & Beverages</option>
                 <option value="Pet Supplies">Pet Supplies</option>
                 <option value="Tools & Hardware">Tools & Hardware</option>
                 <option value="Jewelry & Accessories">Jewelry & Accessories</option>
                 <option value="Other">Other</option>
                </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent text-white placeholder-gray-400 resize-vertical"
              placeholder="Describe your product in detail..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product Images
            </label>
            <div className="space-y-3">
              {formData.images.map((image, index) => (
                <div key={index} className="flex items-center gap-3">
                  <FiImage className="text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent text-white placeholder-gray-400"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="flex items-center gap-2 text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
              >
                <FiImage />
                Add Image URL
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  Save Changes
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(`/product/${id}`)}
              className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FiX />
              Cancel
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}