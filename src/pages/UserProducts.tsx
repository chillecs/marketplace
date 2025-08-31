import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Footer } from "../components/Footer";
import { useAuthContext } from "../AuthContext/AuthContext";

// Define Product type
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

const categories = [
  "Electronics", 
  "Furniture", 
  "Home & Garden", 
  "Clothing", 
  "Books & Media", 
  "Sports & Outdoors", 
  "Beauty & Health", 
  "Toys & Games", 
  "Automotive", 
  "Art & Collectibles", 
  "Food & Beverages", 
  "Pet Supplies", 
  "Tools & Hardware", 
  "Jewelry & Accessories"
];

export function UserProducts() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState('date-newest');

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Electronics",
    description: "",
    rating: "4.5",
  });
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch user's products
  async function getUserProducts(): Promise<Product[]> {
    try {
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      // Fetch all products and filter by ownerId on the client side
      const response = await fetch(`${apiUrl}/products`, { headers });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();
      console.log("All products:", result);
      
      // Filter products by ownerId (user's products)
      const userProducts = result.filter((product: any) => product.ownerId === user?.id);
      console.log("User products:", userProducts);
      return userProducts;
    } catch (error) {
      console.error("Failed to fetch user products", error);
      return [];
    }
  }

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const productsData = await getUserProducts();
      setProducts(productsData);
      setLoading(false);
    };

    fetchProducts();
  }, [user]);

  // Sort products
  const sortedProducts = products.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'date-oldest':
        return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime()
      case 'date-newest':
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      default:
        return a.name.localeCompare(b.name)
    }
  });

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file selection for multiple images
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // Check if adding these files would exceed 8 images
    if (productImages.length + files.length > 8) {
      alert("Maximum 8 images allowed. Please remove some images first.");
      return;
    }
    
    files.forEach(file => {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Must be less than 5MB`);
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image file`);
        return;
      }

      // Compress and resize image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set maximum dimensions
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        setProductImages(prev => [...prev, compressedDataUrl]);
        setImageFiles(prev => [...prev, file]);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };



  // Remove image from product images
  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one image is provided
    if (productImages.length === 0) {
      alert("Please add at least one image for the product");
      return;
    }

    const newProduct = {
      ...formData,
      price: parseFloat(formData.price),
      rating: parseFloat(formData.rating),
      seller: `${user?.firstName} ${user?.lastName}`,
      ownerId: user?.id, // Required by json-server-auth for ownership
      publishedAt: new Date().toISOString(), // Track when product is published
      images: productImages,
      // Don't include id - let json-server assign it automatically
    };

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      console.log("Sending product data:", newProduct);
      console.log("Headers:", headers);
      
      const response = await fetch(`${apiUrl}/products`, {
        method: "POST",
        headers,
        body: JSON.stringify(newProduct),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const createdProduct = await response.json();
        console.log("Created product:", createdProduct);
        
        // Refresh products list
        const updatedProducts = await getUserProducts();
        setProducts(updatedProducts);
        setShowAddForm(false);
        setFormData({
          name: "",
          price: "",
          category: "Electronics",
          description: "",
          rating: "4.5",
        });
        setProductImages([]);
        setImageFiles([]);
      } else {
        const errorText = await response.text();
        console.error("Failed to add product. Status:", response.status, "Error:", errorText);
      }
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  // Handle product deletion
  const handleDelete = async (productId: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const headers: HeadersInit = {};
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${apiUrl}/products/${productId}`, {
          method: "DELETE",
          headers,
        });

        if (response.ok) {
          // Refresh products list
          const updatedProducts = await getUserProducts();
          setProducts(updatedProducts);
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      {/* Header Section */}
      <div className="bg-[#121212] border-b border-[#27272a] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
                     <div className="flex justify-between items-center mb-6">
             <div>
               <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent">
                 Your Products
               </h1>
               <p className="text-gray-400 mt-2">
                 Manage your marketplace listings
               </p>
             </div>
             <div className="flex items-center space-x-4">
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="px-4 py-2 bg-[#1a1a1a] border border-[#27272a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent cursor-pointer"
               >
                 <option value="date-oldest">Date: Oldest First</option>
                 <option value="date-newest">Date: Newest First</option>
                 <option value="name">Sort by Name</option>
                 <option value="price-low">Price: Low to High</option>
                 <option value="price-high">Price: High to Low</option>
                 <option value="rating">Highest Rated</option>
               </select>
               <button
                 onClick={() => setShowAddForm(true)}
                 className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
               >
                 Add New Product
               </button>
             </div>
           </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1a1a1a] border border-[#27272a] rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-[#8b5cf6] mb-2">
                {products.length}
              </div>
              <div className="text-gray-400">Total Products</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#27272a] rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-[#8b5cf6] mb-2">
                {products.filter((p) => p.rating >= 4.5).length}
              </div>
              <div className="text-gray-400">High Rated (4.5+)</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#27272a] rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-[#8b5cf6] mb-2">
                ${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
              </div>
              <div className="text-gray-400">Total Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[#000000c2] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#27272a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#27272a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#27272a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Image
                </label>

                

                                 {/* Device Upload */}
                 <div className="space-y-3">
                     <div className="border-2 border-dashed border-[#27272a] rounded-lg p-4 text-center hover:border-[#8b5cf6] transition-colors duration-300">
                       <input
                         type="file"
                         accept="image/*"
                         multiple
                         onChange={handleFileChange}
                         className="hidden"
                         id="image-upload"
                                                   required={productImages.length === 0}
                       />
                       <label htmlFor="image-upload" className="cursor-pointer">
                         <div className="text-gray-400 mb-2">
                           <svg
                             className="w-8 h-8 mx-auto mb-2"
                             fill="none"
                             stroke="currentColor"
                             viewBox="0 0 24 24"
                           >
                             <path
                               strokeLinecap="round"
                               strokeLinejoin="round"
                               strokeWidth={2}
                               d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                             />
                           </svg>
                         </div>
                         <p className="text-sm text-gray-400">
                           Click to upload images ({productImages.length}/8)
                         </p>
                         <p className="text-xs text-gray-500 mt-1">
                           PNG, JPG, GIF up to 5MB each (will be compressed)
                         </p>
                       </label>
                     </div>

                     {/* Multiple Images Preview */}
                     {productImages.length > 0 && (
                       <div className="grid grid-cols-2 gap-3">
                         {productImages.map((image, index) => (
                           <div key={index} className="relative">
                             <img
                               src={image}
                               alt={`Preview ${index + 1}`}
                               className="w-full h-32 object-cover rounded-lg border border-[#27272a]"
                             />
                             <button
                               type="button"
                               onClick={() => removeImage(index)}
                               className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                             >
                               ×
                             </button>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 

                
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#27272a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-2 rounded-lg font-medium transition-all duration-300"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    
                    setFormData({
                      name: "",
                      price: "",
                      category: "Electronics",
                      description: "",
                      rating: "4.5",
                    });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Loading your products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              You haven't added any products yet.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Add Your First Product
            </button>
          </div>
                 ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden hover:border-[#8b5cf6] transition-all duration-300 group"
              >
                                 <div className="relative">
                   <img
                     src={product.images[0]}
                     alt={product.name}
                     className="w-full h-48 object-cover group-hover:brightness-110 transition-all duration-300"
                   />
                  <div className="absolute top-2 right-2 bg-[#8b5cf6] text-white px-2 py-1 rounded-full text-xs font-medium">
                    {product.category}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-[#8b5cf6] transition-colors duration-300">
                    {product.name}
                  </h3>

                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                                     <div className="flex items-center justify-between mb-3">
                     <span className="text-2xl font-bold text-[#8b5cf6]">
                       ${product.price}
                     </span>
                     <div className="flex items-center">
                       <span className="text-yellow-400">★</span>
                       <span className="text-sm text-gray-400 ml-1">
                         {product.rating}
                       </span>
                     </div>
                   </div>
                   
                   {/* Publication Date */}
                   {product.publishedAt && (
                     <div className="text-xs text-gray-500 mb-3">
                       Published: {new Date(product.publishedAt).toLocaleDateString()}
                     </div>
                   )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
