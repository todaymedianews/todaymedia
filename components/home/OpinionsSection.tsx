import { SectionHeader } from "@/components/shared/SectionHeader";
import { ArticleCardWithAuthor } from "@/components/shared/ArticleCardWithAuthor";
import { cleanAdBanner } from "@/lib/utils/cleanAdBanner";

interface Article {
  id: number;
  title: string;
  image: string;
  date: string;
  author: string;
  authorImage?: string;
  categorySlug?: string;
}

interface OpinionsSectionProps {
  articles: Article[];
  bgColor?: string;
  title?: string;
  color?: string;
  categoryLink?: string;
  sectionNumber?: number;
  adBanner?: string | null;
}

export function OpinionsSection({
  articles,
  bgColor = "bg-muted/20",
  title = "آراء",
  color = "#f97316",
  categoryLink,
  sectionNumber,
  adBanner,
}: OpinionsSectionProps) {
  if (articles.length === 0) return null;

  // Clean ad banner HTML
  const cleanedAdBanner = cleanAdBanner(adBanner);

  return (
    <>
      <div className={`${bgColor} py-12`}>
        <section className="container mx-auto px-4">
          <SectionHeader title={title} color={color} href={categoryLink} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.slice(0, 4).map((article) => (
              <ArticleCardWithAuthor key={article.id} {...article} />
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
