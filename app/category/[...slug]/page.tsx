import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { fetchArticlesByCategory, fetchCategoryBySlug } from '@/lib/api/articles';
import { generateCategoryMetadata, siteConfig } from '@/lib/metadata';
import { generateCollectionPageSchema, generateBreadcrumbSchema } from '@/lib/schemas';

// Dynamically import components for better performance
const NewsCard = dynamic(() => import('@/components/NewsCard'), {
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
  ssr: true,
});

const CategoryArticlesList = dynamic(() => import('./CategoryArticlesList'), {
  ssr: true,
});

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Generate static params - return empty for dynamic rendering
export async function generateStaticParams() {
  return [];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    // The actual category to fetch is the last segment in the slug array
    const categorySlug = slug[slug.length - 1];
    
    // Fetch category info to get the proper name
    const categoryInfo = await fetchCategoryBySlug(categorySlug);
    
    if (!categoryInfo) {
      return {
        title: "القسم غير موجود",
      };
    }

    return generateCategoryMetadata(categoryInfo.name);
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "القسم غير موجود",
    };
  }
}

export default async function DynamicCategoryPage({ params }: PageProps) {
  try {
    const { slug } = await params;
    
    // The actual category to fetch is the last segment
    const categorySlug = slug[slug.length - 1];
    
    // Fetch articles by the last category slug (WordPress handles hierarchical categories)
    const { articles: filteredArticles, pageInfo } = await fetchArticlesByCategory(categorySlug, 12);

    if (filteredArticles.length === 0) {
      notFound();
    }
    
    // Fetch category information for all segments to get proper names
    const categoryNames = await Promise.all(
      slug.map(async (segment) => {
        const categoryInfo = await fetchCategoryBySlug(segment);
        return categoryInfo?.name || decodeURIComponent(segment).replace(/[-_]/g, ' ');
      })
    );
    
    // Fetch the current category full info for count and other details
    const currentCategoryInfo = await fetchCategoryBySlug(categorySlug);
    
    // The current category name (last segment)
    const categoryName = categoryNames[categoryNames.length - 1];
    const categoryCount = currentCategoryInfo?.count || filteredArticles[0]?.categoryCount || filteredArticles.length;
    
    // Build breadcrumb items dynamically based on slug depth
    const breadcrumbItems = [
      { name: 'الرئيسية', url: '/' }
    ];
    
    // Add each level of the category hierarchy with proper names from WordPress
    let cumulativePath = '/category';
    slug.forEach((segment, index) => {
      cumulativePath += `/${segment}`;
      breadcrumbItems.push({
        name: categoryNames[index],
        url: cumulativePath,
      });
    });
    
    const categoryUrl = `${siteConfig.url}${breadcrumbItems[breadcrumbItems.length - 1].url}`;

    // Generate JSON-LD schemas
    const collectionSchema = generateCollectionPageSchema(
      categoryName,
      `تصفح جميع أخبار ومقالات ${categoryName}`,
      categoryUrl,
      filteredArticles.map(article => ({
        title: article.title,
        url: `${siteConfig.url}/article/${article.id}`,
      }))
    );

    // Convert breadcrumb URLs to absolute for schema
    const breadcrumbSchemaItems = breadcrumbItems.map(item => ({
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    }));
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbSchemaItems);

    return (
      <div className="min-h-screen">
        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              {breadcrumbItems.flatMap((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                const items = [
                  <BreadcrumbItem key={`item-${index}`}>
                    {isLast ? (
                      <BreadcrumbPage>{item.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.url}>{item.name}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                ];
                
                if (!isLast) {
                  items.push(<BreadcrumbSeparator key={`sep-${index}`} />);
                }
                
                return items;
              })}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center mb-2 gap-3">
              <h1 className="text-3xl">{categoryName}</h1>
              <span className="ml-4 text-gray-600 dark:text-gray-400">
                {`${categoryCount} ${categoryCount === 1 ? 'مقال' : 'مقالات'}`}
              </span>
            </div>
          </div>

          {/* Articles Grid with Load More */}
          <CategoryArticlesList
            initialArticles={filteredArticles}
            categorySlug={categorySlug}
            hasNextPage={pageInfo.hasNextPage}
            endCursor={pageInfo.endCursor}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading category page:", error);
    notFound();
  }
}

