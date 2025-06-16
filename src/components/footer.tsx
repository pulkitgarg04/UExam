import { GraduationCap, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <div className="flex gap-4 items-center justify-center md:justify-start mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              UExam
            </span>
          </div>
          <h2 className="text-lg font-bold mb-3">About</h2>
          <p className="text-sm">
            Our Test Management System simplifies online assessments with robust tools for students, educators, and administrators.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <a href="#features" className="hover:underline">
                Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:underline">
                Pricing
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:underline">
                Contact Us
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:underline">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">Follow Us</h2>
          <div className="flex justify-center md:justify-start space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Facebook className="w-6 h-6 text-blue-500 hover:text-blue-700" />
            </a>
            <a href="https://x.com/pulkitgarg04" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-6 h-6 text-blue-400 hover:text-blue-600" />
            </a>
            <a href="https://instagram.com/pulkitgxrg" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-6 h-6 text-pink-500 hover:text-pink-700" />
            </a>
            <a href="https://linkedin.com/in/pulkitgarg04" target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-6 h-6 text-blue-600 hover:text-blue-800" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 max-w-6xl mx-auto pt-4 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>© {new Date().getFullYear()} UExam. All rights reserved.</p>
        <p>
          Made with ❤️ by{" "}
          <a href="#" className="font-semibold hover:underline">
            Pulkit Garg
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
