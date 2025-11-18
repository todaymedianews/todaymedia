import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

/**
 * Apollo Client configured for Next.js App Router with proper cache invalidation
 * 
 * Strategy:
 * - Use cache tags for all GraphQL requests
 * - revalidatePath() will clear Next.js fetch cache
 * - Apollo cache set to network-only to always fetch fresh data after revalidation
 */

const client = new ApolloClient({
  link: new HttpLink({
    uri: `${process.env.NEXT_PUBLIC_DB_URI}/graphql`,
    fetch: async (uri, options) => {
      const response = await fetch(uri, {
        ...options,
        next: { 
          revalidate: false, // Static by default
          tags: ['wordpress'], // Tag all WordPress requests
        },
      });

      // Clone the response to read the body
      const clonedResponse = response.clone();
      let body = await clonedResponse.text();
      
      // Clean up any non-JSON prefixes that might be in the response
      // This handles cases where the backend might add comments or whitespace
      if (body.includes('// Start of Selection')) {
        body = body.substring(body.indexOf('{'));
      } else if (body.trim().startsWith('//')) {
        // Remove any leading comment lines
        const lines = body.split('\n');
        const jsonStart = lines.findIndex(line => line.trim().startsWith('{'));
        if (jsonStart > 0) {
          body = lines.slice(jsonStart).join('\n');
        }
      }

      // Return a new Response with the cleaned body
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    },
  }),
  cache: new InMemoryCache({
    typePolicies: {
      HomeACF: {
        merge(existing, incoming, { mergeObjects }) {
          return mergeObjects(existing, incoming);
        },
      },
      AboutUsTemplate: {
        merge(existing, incoming, { mergeObjects }) {
          return mergeObjects(existing, incoming);
        },
      },
      ThemeOptions: {
        keyFields: false,
        merge(existing = {}, incoming, { mergeObjects }) {
          return mergeObjects(existing, incoming);
        },
      },
      Page: {
        merge(existing, incoming, { mergeObjects }) {
          return mergeObjects(existing, incoming);
        },
      },
      Slider: {
        keyFields: false,
        merge(existing, incoming, { mergeObjects }) {
          return mergeObjects(existing, incoming);
        },
      },
    },
  }),
  // CRITICAL: Use network-only to bypass Apollo's cache
  // This ensures fresh data is fetched after Next.js cache is cleared
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

export default client;
