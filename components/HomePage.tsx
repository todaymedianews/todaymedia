import dynamic from "next/dynamic";
import { fetchHomePageConfig, fetchHomePageArticles } from "@/lib/actions/site/homeActions";
import { fetchLatestVideos } from "@/lib/api/videos";
import { fetchHomePageAdBanners } from "@/lib/actions/site/themeSettingsAction";

// Dynamically import heavy client components to reduce initial JS bundle
// This improves TBT (Total Blocking Time) significantly on mobile
const BreakingNewsBar = dynamic(() => import("@/components/home/BreakingNewsBar").then(mod => ({ default: mod.BreakingNewsBar })), {
  ssr: true,
});

const HeroSlider = dynamic(() => import("@/components/home/HeroSlider").then(mod => ({ default: mod.HeroSlider })), {
  ssr: true,
  loading: () => <div className="h-[600px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
});

const GridSection = dynamic(() => import("@/components/home/GridSection").then(mod => ({ default: mod.GridSection })), {
  ssr: true,
});

const HorizontalSection = dynamic(() => import("@/components/home/HorizontalSection").then(mod => ({ default: mod.HorizontalSection })), {
  ssr: true,
});

const OpinionsSection = dynamic(() => import("@/components/home/OpinionsSection").then(mod => ({ default: mod.OpinionsSection })), {
  ssr: true,
});

const VideoSection = dynamic(() => import("@/components/home/VideoSection").then(mod => ({ default: mod.VideoSection })), {
  ssr: true,
});

export default async function Home() {
  // Fetch home page configuration from WordPress
  const config = await fetchHomePageConfig();
  
  // Fetch latest videos from WordPress
  const videos = await fetchLatestVideos(4);
  
  // Fetch all articles based on configuration
  const { heroArticles, sectionArticles } = await fetchHomePageArticles(config);

  // Fetch ad banners
  const adBanners = await fetchHomePageAdBanners();
  

  // Get section configurations
  const sections = config.sections;

  // Helper function to determine number of columns
  const getColumns = (layout: string | null): 2 | 3 | 4 => {
    if (!layout) return 4;
    
    // Extract number from formats like 'three-columns', 'four-columns', '3', '4'
    const layoutStr = String(layout).toLowerCase();
    if (layoutStr.includes('three') || layoutStr === '3') return 3;
    if (layoutStr.includes('four') || layoutStr === '4') return 4;
    if (layoutStr.includes('two') || layoutStr === '2') return 2;
    return 4; // Default to 4 columns
  };

  // Helper function to get category link for a section
  const getCategoryLink = (section: typeof sections[0]): string | undefined => {
    // Use sectionTitleLink if available
    if (section?.sectionTitleLink) {
      return section.sectionTitleLink;
    }
    // Otherwise, use the first category slug
    if (section?.categories && section.categories.length > 0) {
      return `/category/${section.categories[0]}`;
    }
    return undefined;
  };

  // Helper function to get background color based on index
  const getBgColor = (index: number): string => {
    // Alternate between bg-background and bg-muted/20
    return index % 2 === 0 ? 'bg-background' : 'bg-muted/20';
  };

  // Helper function to get ad banner for section
  const getAdBanner = (sectionNumber: number) => {
    const bannerKey = `homePageAdBanner${sectionNumber}` as keyof typeof adBanners;
    return adBanners?.[bannerKey];
  };

  // Helper function to render section based on configuration
  const renderSection = (section: typeof sections[0], articles: typeof sectionArticles[0], index: number) => {
    const sectionNumber = index + 1;
    const bgColor = getBgColor(index);
    const color = section.sectionTitleUndelineColor || "#ea580c";
    const categoryLink = getCategoryLink(section);
    const title = section.sectionTitle || "";
    const adBanner = getAdBanner(sectionNumber);

    // Don't render if no articles
    if (!articles || articles.length === 0) {
      return null;
    }

    // Render based on section type
    if (section.enableCta) {
      return (
        <OpinionsSection 
          key={`section-${index}`}
          articles={articles} 
          bgColor={bgColor}
          title={title || undefined}
          color={color}
          categoryLink={categoryLink}
          sectionNumber={sectionNumber}
          adBanner={adBanner}
        />
      );
    } else if (section.enableExcerpt) {
      return (
        <HorizontalSection
          key={`section-${index}`}
          title={title}
          articles={articles}
          color={color}
          bgColor={bgColor}
          categoryLink={categoryLink}
          sectionNumber={sectionNumber}
          adBanner={adBanner}
        />
      );
    } else {
      return (
        <GridSection
          key={`section-${index}`}
          title={title}
          articles={articles}
          color={color}
          columns={getColumns(section.sectionColumnLayout)}
          showExcerpt={section.enableExcerpt}
          bgColor={bgColor}
          sectionNumber={sectionNumber}
          adBanner={adBanner}
          categoryLink={categoryLink}
        />
      );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Breaking News Bar - Client Component */}
      <BreakingNewsBar 
        articles={heroArticles.slice(0, 10).map(article => ({
          id: article.id,
          title: article.title,
          slug: article.categorySlug,
          category: article.categorySlug
        }))} 
      />

      <main>
        {/* Hero Slider - Client Component */}
        <HeroSlider articles={heroArticles} />

        <div className="gridholder mx-auto px-4 py-8">
          {/* Dynamic Sections - Render all sections from WordPress */}
          {sections.map((section, index) => {
            const articles = sectionArticles[index] || [];
            return renderSection(section, articles, index);
          })}

          {/* Videos Section */}
          {!config.videoSection?.hideThisSection && (
            <VideoSection 
              videos={videos} 
              bgColor="bg-muted/20"
              title={config.videoSection?.sectionTitleVideos}
              color={config.videoSection?.sectionTitleUndelineColorVideos || "#c90000"}
              ctaLabel={config.videoSection?.ctaLabelVideos}
              ctaLink={config.videoSection?.ctaLinkVideos}
            />
          )}
        </div>
      </main>
    </div>
  );
}
