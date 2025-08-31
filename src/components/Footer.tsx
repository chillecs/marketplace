import { FaTwitter, FaInstagram, FaPinterest, FaFacebook, FaLinkedin } from 'react-icons/fa'

export function Footer() {
  return (
    <>
      {/* Footer */}
      <footer className="border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] bg-clip-text text-transparent mb-4">
                Marketplace
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Connect with talented creators and discover unique products from around the world. 
                Your trusted platform for authentic, handcrafted goods.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="footer-hover-effects">
                  <FaTwitter className="w-6 h-6" />
                </a>
                <a href="#" className="footer-hover-effects">
                  <FaInstagram className="w-6 h-6" />
                </a>
                <a href="#" className="footer-hover-effects">
                  <FaPinterest className="w-6 h-6" />
                </a>
                <a href="#" className="footer-hover-effects">
                  <FaFacebook className="w-6 h-6" />
                </a>
                <a href="#" className="footer-hover-effects">
                  <FaLinkedin className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="footer-hover-effects">
                    Browse Products
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-hover-effects">
                    Become a Seller
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-hover-effects">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-hover-effects">
                    Success Stories
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="footer-hover-effects">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-hover-effects">
                    Contact Us
                  </a>
                </li>
                <li>
                    <a href="#" className="footer-hover-effects">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-hover-effects">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-[#27272a] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Marketplace. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="footer-hover-effects">
                Privacy
              </a>
              <a href="#" className="footer-hover-effects">
                Terms
              </a>
              <a href="#" className="footer-hover-effects">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
      </>
  )
}