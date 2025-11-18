import { SectionHeader } from "@/components/shared/SectionHeader";
import { HorizontalArticleCard } from "@/components/shared/HorizontalArticleCard";
import { cleanAdBanner } from "@/lib/utils/cleanAdBanner";

interface Article {
  id: number;
  title: string;
  image: string;
  date: string;
  excerpt: string;
}

interface HorizontalSectionProps {
  title: string;
  articles: Article[];
  color: string;
  bgColor?: string;
  categoryLink?: string;
  sectionNumber?: number;
  adBanner?: string | null;
}

export function HorizontalSection({
  title,
  articles,
  color,
  bgColor = "bg-background",
  categoryLink,
  sectionNumber,
  adBanner,
}: HorizontalSectionProps) {
  if (articles.length === 0) return null;

  // Clean ad banner HTML
  const cleanedAdBanner = cleanAdBanner(adBanner);

  return (
    <>
      <div className={`${bgColor} py-12`}>
        <section className="container mx-auto px-4">
          <SectionHeader title={title} color={color} href={categoryLink} />
          <div className="grid sm:grid-cols-2 gap-6">
            {articles.slice(0, 2).map((article) => (
              <HorizontalArticleCard key={article.id} {...article} />
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
