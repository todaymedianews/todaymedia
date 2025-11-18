import apolloClient from "@/lib/client/ApolloClient";
import {
  GET_ARTICLE,
  GET_ARTICLES,
  GET_ARTICLES_BY_CATEGORY,
  GET_ARTICLES_BY_TAG,
  GET_ARTICLES_BY_AUTHOR,
  GET_ARTICLES_BY_AUTHOR_ID,
  GET_AUTHOR_POST_COUNT,
  GET_CATEGORY_BY_SLUG,
  GET_POSTS_BY_IDS,
} from "@/lib/queries/article/articleQuires";
import {
  transformPostToArticle,
  transformPostsToArticles,
  WordPressPostResponse,
  WordPressPostsResponse,
} from "@/lib/transforms/articleTransform";
import { Article } from "@/types/articles";

/**
 * Fetch a single article by database ID
 */
export async function fetchArticleById(id: string | number): Promise<Article | null> {
  try {
    const { data } = await apolloClient.query<WordPressPostResponse>({
      query: GET_ARTICLE,
      variables: { id: id.toString() },
      fetchPolicy: 'network-only',
    });

    if (!data?.post) {
      return null;
    }

    return transformPostToArticle(data.post);
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

/**
 * Fetch a single article by slug (alias for backward compatibility)
 */
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  return fetchArticleById(slug);
}

/**
 * Fetch multiple articles with pagination
 */
export async function fetchArticles(
  first: number = 10,
  after?: string
): Promise<{
  articles: Article[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}> {
  try {
    const { data } = await apolloClient.query<WordPressPostsResponse>({
      query: GET_ARTICLES,
      variables: { first, after },
      fetchPolicy: 'network-only',
    });

    if (!data?.posts) {
      return {
        articles: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      };
    }

    return {
      articles: transformPostsToArticles(data.posts.nodes),
      pageInfo: data.posts.pageInfo,
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      articles: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

/**
 * Fetch articles by category
 */
export async function fetchArticlesByCategory(
  categorySlug: string,
  first: number = 10,
  after?: string
): Promise<{
  articles: Article[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}> {
  try {
    // Decode the category slug in case it's URL encoded (Arabic slugs)
    const decodedSlug = decodeURIComponent(categorySlug);
    
    const { data } = await apolloClient.query<WordPressPostsResponse>({
      query: GET_ARTICLES_BY_CATEGORY,
      variables: { categorySlug: decodedSlug, first, after },
      fetchPolicy: 'network-only',
    });

    if (!data?.posts) {
      return {
        articles: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      };
    }

    return {
      articles: transformPostsToArticles(data.posts.nodes),
      pageInfo: data.posts.pageInfo,
    };
  } catch (error) {
    console.error("Error fetching articles by category:", error);
    console.error("Category slug was:", categorySlug);
    return {
      articles: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

/**
 * Fetch articles by tag
 */
export async function fetchArticlesByTag(
  tagSlug: string,
  first: number = 10,
  after?: string
): Promise<{
  articles: Article[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}> {
  try {
    // Decode the tag slug in case it's URL encoded (Arabic slugs)
    const decodedSlug = decodeURIComponent(tagSlug);
    
    const { data } = await apolloClient.query<WordPressPostsResponse>({
      query: GET_ARTICLES_BY_TAG,
      variables: { tagSlug: decodedSlug, first, after },
      fetchPolicy: 'network-only',
    });

    if (!data?.posts) {
      return {
        articles: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      };
    }

    return {
      articles: transformPostsToArticles(data.posts.nodes),
      pageInfo: data.posts.pageInfo,
    };
  } catch (error) {
    console.error("Error fetching articles by tag:", error);
    return {
      articles: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

/**
 * Fetch articles by author
 */
export async function fetchArticlesByAuthor(
  authorSlug: string,
  first: number = 10,
  after?: string
): Promise<{
  articles: Article[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}> {
  try {
        const { data } = await apolloClient.query<WordPressPostsResponse>({
      query: GET_ARTICLES_BY_AUTHOR,
      variables: { authorSlug, first, after },
      fetchPolicy: 'network-only',
    });

    if (!data?.posts) {
      return {
        articles: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      };
    }

    return {
      articles: transformPostsToArticles(data.posts.nodes),
      pageInfo: data.posts.pageInfo,
    };
  } catch (error) {
    console.error("Error fetching articles by author:", error);
    return {
      articles: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

/**
 * Fetch articles by author ID
 */
export async function fetchArticlesByAuthorId(
  authorId: number,
  first: number = 10,
  after?: string
): Promise<{
  articles: Article[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}> {
  try {
    const { data } = await apolloClient.query<WordPressPostsResponse>({
      query: GET_ARTICLES_BY_AUTHOR_ID,
      variables: { authorId, first, after },
      fetchPolicy: 'network-only',
    });

    if (!data?.posts) {
      return {
        articles: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      };
    }

    return {
      articles: transformPostsToArticles(data.posts.nodes),
      pageInfo: data.posts.pageInfo,
    };
  } catch (error) {
    console.error("Error fetching articles by author ID:", error);
    return {
      articles: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
}

/**
 * Fetch total count of articles by author ID using GraphQL query
 */
export async function fetchAuthorArticlesCount(authorId: number): Promise<number> {
  try {
    const { data } = await apolloClient.query<{
      authorPostCount: number;
    }>({
      query: GET_AUTHOR_POST_COUNT,
      variables: { authorId },
      fetchPolicy: 'network-only',
    });

    return data?.authorPostCount || 0;
  } catch (error) {
    console.error('Error fetching author articles count:', error);
    return 0;
  }
}

/**
 * Fetch all articles (for static generation)
 */
export async function fetchAllArticles(): Promise<Article[]> {
  const allArticles: Article[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const { articles, pageInfo } = await fetchArticles(100, after || undefined);
    allArticles.push(...articles);
    hasNextPage = pageInfo.hasNextPage;
    after = pageInfo.endCursor;
  }

  return allArticles;
}

/**
 * Fetch multiple articles by their IDs
 */
export async function fetchArticlesByIds(ids: number[]): Promise<Article[]> {
  try {
    if (!ids || ids.length === 0) {
      return [];
    }

    const { data } = await apolloClient.query<{
      posts: {
        nodes: any[];
      };
    }>({
      query: GET_POSTS_BY_IDS,
      variables: { ids },
      fetchPolicy: 'network-only',
    });

    if (!data?.posts?.nodes) {
      return [];
    }

    // Transform and maintain the order of IDs passed
    const articlesMap = new Map(
      transformPostsToArticles(data.posts.nodes).map(article => [article.id, article])
    );

    // Return articles in the same order as the input IDs
    return ids
      .map(id => articlesMap.get(id))
      .filter((article): article is Article => article !== undefined);
  } catch (error) {
    console.error("Error fetching articles by IDs:", error);
    console.error("IDs were:", ids);
    return [];
  }
}

/**
 * Fetch category information by slug
 */
export async function fetchCategoryBySlug(slug: string): Promise<{
  name: string;
  slug: string;
  count: number;
  parent?: {
    name: string;
    slug: string;
  };
} | null> {
  try {
    const decodedSlug = decodeURIComponent(slug);
    
    const { data } = await apolloClient.query<{
      category: {
        id: string;
        name: string;
        slug: string;
        count: number;
        parent?: {
          node: {
            name: string;
            slug: string;
          };
        };
      };
    }>({
      query: GET_CATEGORY_BY_SLUG,
      variables: { slug: decodedSlug },
      fetchPolicy: 'network-only',
    });

    if (!data?.category) {
      return null;
    }

    return {
      name: data.category.name,
      slug: data.category.slug,
      count: data.category.count,
      parent: data.category.parent ? {
        name: data.category.parent.node.name,
        slug: data.category.parent.node.slug,
      } : undefined,
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    console.error("Category slug was:", slug);
    return null;
  }
}
