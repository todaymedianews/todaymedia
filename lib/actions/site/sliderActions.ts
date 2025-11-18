import apolloClient from '@/lib/client/ApolloClient';
import { GET_HOME_PAGE_SLIDER } from '@/lib/queries/site/sliderQueries';

/**
 * Fetch home page hero slider post IDs from WordPress
 */
export async function fetchHomePageSliderPostIds(): Promise<number[]> {
  try {
    const result = await apolloClient.query<{
      slider: {
        homePageSlider: {
          homePageSlider: {
            nodes: Array<{
              postId: number;
            }>;
          };
        };
      };
    }>({
      query: GET_HOME_PAGE_SLIDER,
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    });

    // Log GraphQL error if any
    if (result.error) {
      console.error('GraphQL error in slider query:', result.error);
    }

    // Check if data exists and has the expected structure
    if (!result.data?.slider?.homePageSlider?.homePageSlider?.nodes) {
      console.warn('No slider data found or data structure is unexpected');
      return [];
    }

    // Extract post IDs from the response
    const postIds = result.data.slider.homePageSlider.homePageSlider.nodes.map(node => node.postId);
    console.log('Fetched slider post IDs:', postIds);
    return postIds;
  } catch (error) {
    console.error('Error fetching home page slider post IDs:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    return [];
  }
}

