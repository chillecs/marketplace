import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Footer } from '../components/Footer'
import { useAuthContext } from '../AuthContext/AuthContext'

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
  "All", 
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
]

export function Home() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('date-newest')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { user, accessToken } = useAuthContext()

  const apiUrl = import.meta.env.VITE_API_URL;

  async function getProducts(): Promise<Product[]> {
    try {
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${apiUrl}/products`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const result = await response.json();
      console.log(result)
      return result;
    } catch (error) {
      console.error('Failed to fetch products', error)
      return [];
    }
  }

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const productsData = await getProducts();
      setProducts(productsData);
      setLoading(false);
    };
    
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.seller.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
         .sort((a, b) => {
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
     })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      {/* Header Section */}
      <div className="bg-[#121212] border-b border-[#27272a] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent">
            Marketplace
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Discover unique products from talented creators
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products, sellers, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#27272a] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent cursor-text"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-[#1a1a1a] border border-[#27272a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent cursor-pointer"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
                         <select
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
               className="px-4 py-3 bg-[#1a1a1a] border border-[#27272a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent cursor-pointer"
             >
               <option value="date-oldest">Date: Oldest First</option>
               <option value="date-newest">Date: Newest First</option>
               <option value="name">Sort by Name</option>
               <option value="price-low">Price: Low to High</option>
               <option value="price-high">Price: High to Low</option>
               <option value="rating">Highest Rated</option>
             </select>
            <div className="text-center">
            <Link className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 cursor-pointer" to={`/your-products/${user?.id}`}>
              Your Products
            </Link>
          </div>
          </div>
        </div>
      </div>

             {/* Products Grid */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {loading ? (
           <div className="text-center py-12">
             <p className="text-gray-400 text-lg">Loading products...</p>
           </div>
         ) : filteredProducts.length === 0 ? (
           <div className="text-center py-12">
             <p className="text-gray-400 text-lg">No products found matching your criteria.</p>
           </div>
         ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#121212] border border-[#27272a] rounded-lg overflow-hidden hover:border-[#8b5cf6] transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group"
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
                       <span className="text-sm text-gray-400 ml-1">{product.rating}</span>
                     </div>
                   </div>
                   
                   {/* Publication Date */}
                   {product.publishedAt && (
                     <div className="text-xs text-gray-500 mb-3">
                       Published: {new Date(product.publishedAt).toLocaleDateString()}
                     </div>
                   )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      by {product.seller}
                    </span>
                                         <Link 
                       to={`/product/${product.id}`}
                       className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 inline-block"
                     >
                       View Details
                     </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

             {/* Stats Section */}
       <div className="bg-[#121212] border-t border-[#27272a] px-4 sm:px-6 lg:px-8 py-8 mt-12">
         <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
             <div>
               <div className="text-3xl font-bold text-[#8b5cf6] mb-2">
                 {products.length}
               </div>
               <div className="text-gray-400">Active Products</div>
             </div>
             <div>
               <div className="text-3xl font-bold text-[#8b5cf6] mb-2">
                 {new Set(products.map((p: Product) => p.seller)).size}
               </div>
               <div className="text-gray-400">Active Sellers</div>
             </div>
             <div>
               <div className="text-3xl font-bold text-[#8b5cf6] mb-2">
                 {categories.length - 1}
               </div>
               <div className="text-gray-400">Categories</div>
             </div>
           </div>
         </div>
       </div>
      <Footer />
    </div>
  );
}
