import { SectionHeader } from "@/components/shared/SectionHeader";
import { ArticleCard } from "@/components/shared/ArticleCard";
import { cleanAdBanner } from "@/lib/utils/cleanAdBanner";

interface Article {
  id: number;
  title: string;
  image: string;
  date: string;
  excerpt?: string;
}

interface GridSectionProps {
  title: string;
  articles: Article[];
  color: string;
  columns?: 2 | 3 | 4;
  showExcerpt?: boolean;
  bgColor?: string;
  sectionNumber?: number;
  adBanner?: string | null;
  categoryLink?: string;
}

export function GridSection({
  title,
  articles,
  color,
  columns = 4,
  showExcerpt = false,
  bgColor = "bg-muted/20",
  sectionNumber,
  adBanner,
  categoryLink,
}: GridSectionProps) {
  if (articles.length === 0) return null;

  const gridCols = 
    columns === 2 ? "sm:grid-cols-2" :
    columns === 3 ? "md:grid-cols-3" : 
    "sm:grid-cols-2 lg:grid-cols-4";

  // Clean ad banner HTML
  const cleanedAdBanner = cleanAdBanner(adBanner);

  return (
    <>
      <div className={`${bgColor} py-12 category-container`}>
        <section className="container mx-auto px-4">
          <SectionHeader title={title} color={color} href={categoryLink} />
          <div className={`grid ${gridCols} gap-6`}>
            {articles.slice(0, columns).map((article) => (
              <ArticleCard
                key={article.id}
                {...article}
                showExcerpt={showExcerpt}
              />
            ))}
          </div>
        </section>
      </div>
      {cleanedAdBanner && (
        <div 
          className="container mx-auto px-4 py-4 flex justify-center items-center"
          style={{ minHeight: 'auto' }}
        >
          <div 
            className="ad-banner-wrapper w-full flex justify-center"
            dangerouslySetInnerHTML={{ __html: cleanedAdBanner }}
            style={{ 
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          />
        </div>
      )}
    </>
  );
}
