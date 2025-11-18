import apolloClient from '@/lib/client/ApolloClient';
import { GET_HOME_PAGE } from '@/lib/queries/site/homeQueries';
import { fetchArticlesByCategory, fetchArticles, fetchArticlesByIds } from '@/lib/api/articles';
import { fetchHomePageSliderPostIds } from './sliderActions';

export interface HomeSection {
  enableCta: boolean;
  enableExcerpt: boolean;
  sectionTitle: string | null;
  sectionTitleLink: string | null;
  sectionTitleUndelineColor: string;
  sectionColumnLayout: string | null;
  categories: string[]; // Category slugs
  categoryNames: string[]; // Category names
}

export interface VideoSectionConfig {
  sectionTitleVideos: string | null;
  sectionTitleUndelineColorVideos: string;
  ctaLabelVideos: string | null;
  ctaLinkVideos: string | null;
  hideThisSection: boolean;
}

export interface HomePageData {
  sections: HomeSection[];
  videoSection: VideoSectionConfig | null;
}

/**
 * Fetch home page configuration from WordPress
 */
export async function fetchHomePageConfig(): Promise<HomePageData> {
  try {
    const { data } = await apolloClient.query<{
      page: {
        homePageOptions: {
          homePageContent: Array<{
            enableCta: boolean;
            enableExcerpt: boolean;
            sectionTitle: string | null;
            sectionTitleLink: string | null;
            sectionTitleUndelineColor: string;
            sectionColumnLayout: string | null;
            selectCategory: {
              nodes: Array<{
                slug: string;
                name: string;
              }>;
            };
          }>;
          sectionTitleVideos: string | null;
          sectionTitleUndelineColorVideos: string;
          ctaLabelVideos: string | null;
          ctaLinkVideos: string | null;
          hideThisSection: boolean;
        };
      };
    }>({
      query: GET_HOME_PAGE,
    });

    if (!data?.page?.homePageOptions?.homePageContent) {
      return { sections: [], videoSection: null };
    }

    const content = data.page.homePageOptions.homePageContent;
    const homePageOptions = data.page.homePageOptions;

    // Extract video section config from homePageOptions level
    const videoSection: VideoSectionConfig | null = {
      sectionTitleVideos: homePageOptions.sectionTitleVideos,
      sectionTitleUndelineColorVideos: homePageOptions.sectionTitleUndelineColorVideos,
      ctaLabelVideos: homePageOptions.ctaLabelVideos,
      ctaLinkVideos: homePageOptions.ctaLinkVideos,
      hideThisSection: homePageOptions.hideThisSection || false,
    };

    // Map all sections from WordPress
    const sections = content.map(section => ({
      enableCta: section.enableCta,
      enableExcerpt: section.enableExcerpt,
      sectionTitle: section.sectionTitle,
      sectionTitleLink: section.sectionTitleLink,
      sectionTitleUndelineColor: section.sectionTitleUndelineColor,
      sectionColumnLayout: section.sectionColumnLayout,
      categories: section.selectCategory?.nodes?.map(cat => cat.slug) || [],
      categoryNames: section.selectCategory?.nodes?.map(cat => cat.name) || [],
    }));

    return {
      sections,
      videoSection,
    };
  } catch (error) {
    console.error('Error fetching home page config:', error);
    return { sections: [], videoSection: null };
  }
}

/**
 * Fetch all articles for home page sections
 */
export async function fetchHomePageArticles(config: HomePageData) {
  try {
    // Fetch hero slider post IDs from the slider query
    const heroSliderPostIds = await fetchHomePageSliderPostIds();
    
    // Fetch hero articles - Use slider posts if configured, otherwise latest 5 posts
    let heroArticles;
    if (heroSliderPostIds && heroSliderPostIds.length > 0) {
      // Fetch specific posts by IDs for hero slider
      heroArticles = await fetchArticlesByIds(heroSliderPostIds);
    } else {
      // Fallback to latest 5 posts if no slider posts are configured
      const latestArticles = await fetchArticles(5);
      heroArticles = latestArticles.articles;
    }

    // Get hero post IDs to exclude from sections
    const heroPostIds = new Set(heroArticles.map(article => article.id));

    // Fetch articles for each section in parallel
    const sectionPromises = config.sections.map(async (section) => {
      // For sections with multiple categories, fetch from all and combine
      if (section.categories.length > 1) {
        const articlePromises = section.categories.map(cat => 
          fetchArticlesByCategory(cat, 6) // Fetch more to account for filtered posts
        );
        const results = await Promise.all(articlePromises);
        const allArticles = results.flatMap(r => r.articles);
        // Sort by date, exclude hero posts, and limit to 8
        return allArticles
          .filter(article => !heroPostIds.has(article.id))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8);
      } else if (section.categories.length === 1) {
        // Single category - fetch more to account for filtered posts
        const { articles } = await fetchArticlesByCategory(
          section.categories[0],
          section.enableExcerpt ? 6 : 12
        );
        // Exclude hero posts and limit to required amount
        return articles
          .filter(article => !heroPostIds.has(article.id))
          .slice(0, section.enableExcerpt ? 4 : 8);
      } else {
        return [];
      }
    });

    const sectionArticles = await Promise.all(sectionPromises);

    return {
      heroArticles,
      sectionArticles,
    };
  } catch (error) {
    console.error('Error fetching home page articles:', error);
    return {
      heroArticles: [],
      sectionArticles: [],
    };
  }
}
