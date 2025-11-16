import { MobileMenu } from "./header/MobileMenu";
import { MobileSearch } from "./header/MobileSearch";
import { SearchBar } from "./header/SearchBar";
import { ThemeToggle } from "./header/ThemeToggle";
import { StickyNav } from "./header/StickyNav";
import { CurrentDate } from "./header/CurrentDate";
import { LogoLink } from "./header/LogoLink";
import { LogoData } from "@/lib/actions/site/logoAction";
import { HeaderMenuData } from "@/lib/actions/site/headerMenuAction";
import { fetchSocialLinksData } from "@/lib/actions/site/themeSettingsAction";

export default async function Header() {
  let logoUrl = "/logo.webp";
  let categories: any[] = [];
  let socialData: any = null;

  try {
    const logoData = await LogoData();
    // Ensure logo URL is properly encoded and doesn't contain invalid characters
    if (logoData?.siteLogoUrl) {
      logoUrl = encodeURI(logoData.siteLogoUrl);
    }
  } catch (error) {
    console.error("Error loading logo:", error);
  }

  try {
    categories = await HeaderMenuData();
  } catch (error) {
    console.error("Error loading menu:", error);
  }

  try {
    socialData = await fetchSocialLinksData();
  } catch (error) {
    console.error("Error loading social links:", error);
  }

  return (
    <header className="bg-background shadow-sm border-b border-border lg:static sticky top-0 z-50">
      <div className="bg-[#c90000] text-white py-2 lg:block hidden">
        <div className="container mx-auto px-4 flex justify-between items-center text-right">
          <div className="flex gap-4">
            <CurrentDate />
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2 lg:py-4">
        <div className="flex items-center justify-between relative">
          {/* Mobile: Search on left */}
          <div className="lg:hidden flex-1 flex justify-start">
            <MobileMenu categories={categories} socialLinks={socialData?.links} />
          </div>

          {/* Logo centered */}
          <LogoLink 
            logoUrl={logoUrl}
            className="desktop-logo flex items-center gap-3 absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0 lg:flex-1 lg:justify-start"
          />

          {/* Desktop: SearchBar on right, Mobile: Menu on right */}
          <div className="flex items-center lg:flex-1 lg:justify-end">
            <div className="hidden lg:block">
              <SearchBar />
            </div>
            <div className="lg:hidden flex-1 flex justify-end">
              <MobileSearch />
            </div>
          </div>
        </div>
      </div>

      <StickyNav categories={categories} logoUrl={logoUrl} />
    </header>
  );
}
