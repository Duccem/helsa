import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="p-6">
      <div className="bg-primary py-12 rounded-2xl text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <Link href={"/" as any} aria-label="Helsa home" className="flex items-center gap-2">
                {/* Logo uses a subtle dark background so the white mark is visible on light theme */}
                <Image
                  src="/images/helsa-logo-all-white.png"
                  alt="Helsa"
                  width={90}
                  height={24}
                  priority
                />
              </Link>

              <p className="text-sm ">
                Empowering mental health through AI and professional care.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm ">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm ">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm ">
                <li><Link href={"/privacy" as any} className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href={"/terms" as any} className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm ">
            <p className="flex items-center justify-center gap-2">
              Made with <Heart className="w-4 h-4 text-primary fill-primary" /> for better mental health
            </p>
            <p className="mt-2">© 2024 Helsa Healthcare. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
