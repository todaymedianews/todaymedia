'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface LogoLinkProps {
  logoUrl: string;
  className?: string;
}

export function LogoLink({ logoUrl, className }: LogoLinkProps) {
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      e.stopPropagation(); // Prevent GlobalLoader from triggering
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link 
      href="/" 
      onClick={handleLogoClick}
      className={className}
    >
      <Image 
        src={logoUrl} 
        width={100} 
        height={100} 
        alt="اليوم ميديا" 
        className="h-12 lg:h-16 w-auto object-contain" 
        priority
        fetchPriority="high"
        quality={90}
      />
    </Link>
  );
}

