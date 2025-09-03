import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const headers: HeadersInit = {};
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        const response = await fetch(`${apiUrl}/products/${id}`, { headers });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Product not found");
          } else {
            setError("Failed to load product");
          }
          return;
        }

        const productData = await response.json();
        setProduct(productData);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, accessToken]);

  const handleContactSeller = () => {
    // For now, just show an alert. In a real app, this would open a contact form or messaging system
    alert(`Contact ${product?.seller} about ${product?.name}`);
  };

  const handleAddToCart = () => {
    // For now, just show an alert. In a real app, this would add to cart
    alert(`${product?.name} added to cart!`);
  };

  const handleEditProduct = () => {
    navigate(`/edit-product/${product?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">
              {error || "Product not found"}
            </p>
            <Link
              to="/"
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      {/* Breadcrumb */}
      <div className="bg-[#121212] border-b border-[#27272a] px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              to="/"
              className="text-gray-400 hover:text-[#8b5cf6] transition-colors"
            >
              Marketplace
            </Link>
            <span className="text-gray-600">/</span>
            <Link
              to={`/?category=${product.category || "All"}`}
              className="text-gray-400 hover:text-[#8b5cf6] transition-colors"
            >
              {product.category || "All"}
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-white">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden">
              <img
                src={product.images?.[0] || "https://via.placeholder.com/600x400?text=Image+Not+Available"}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/600x400?text=Image+Not+Available";
                }}
              />
            </div>

            {/* Image Gallery Placeholder */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-[#121212] border border-[#27272a] rounded-lg h-20 cursor-pointer hover:border-[#8b5cf6] transition-colors">
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/600x400?text=Image+Not+Available"}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              {/* Additional image placeholders */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#1a1a1a] border border-[#27272a] rounded-lg h-20 flex items-center justify-center text-gray-500 text-xs"
                >
                  +{i}
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-[#8b5cf6] text-white px-3 py-1 rounded-full text-xs font-medium">
                  {product.category || "Uncategorized"}
                </span>
                {product.publishedAt && (
                  <span className="text-xs text-gray-500">
                    Published{" "}
                    {new Date(product.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="text-gray-400 ml-1">{product.rating || "0"}</span>
                </div>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">by {product.seller || "Unknown Seller"}</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-[#8b5cf6]">
                  ${product.price}
                </span>
                <span className="text-gray-400 text-sm">USD</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Free shipping • 30-day returns
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02]"
              >
                Add to Cart
              </button>
              <button
                onClick={handleContactSeller}
                className="w-full bg-transparent border border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white py-4 rounded-lg font-medium transition-all duration-300"
              >
                Contact Seller
              </button>
              {user?.id && product.ownerId && user.id === product.ownerId && (
                <button
                  onClick={handleEditProduct}
                  className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Edit Product
                </button>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
              <h3 className="font-semibold mb-3">About the Seller</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#8b5cf6] rounded-full flex items-center justify-center text-white font-semibold">
                  {product.seller
                    ? product.seller
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "?"}
                </div>
                <div>
                  <p className="font-medium">{product.seller || "Unknown Seller"}</p>
                  <p className="text-gray-400 text-sm">Verified Seller</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Product Description</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed">
                {product.description || "No description available"}
              </p>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="mt-8">
          <div className="bg-[#121212] border border-[#27272a] rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between py-2 border-b border-[#27272a]">
                <span className="text-gray-400">Category</span>
                <span className="text-white">{product.category || "Uncategorized"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#27272a]">
                <span className="text-gray-400">Rating</span>
                <span className="text-white">{product.rating || "0"} / 5</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#27272a]">
                <span className="text-gray-400">Seller</span>
                <span className="text-white">{product.seller || "Unknown Seller"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#27272a]">
                <span className="text-gray-400">Product ID</span>
                <span className="text-white">#{product.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Placeholder */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#121212] border border-[#27272a] rounded-lg p-4 text-center"
              >
                <div className="bg-[#1a1a1a] h-32 rounded-lg mb-3 flex items-center justify-center text-gray-500">
                  Related Product {i}
                </div>
                <p className="text-gray-400 text-sm">Coming soon...</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
