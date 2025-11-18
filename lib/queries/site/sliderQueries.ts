import { gql } from '@apollo/client';

export const GET_HOME_PAGE_SLIDER = gql`
  query GetHomePageHeroSlider {
    slider {
      homePageSlider {
        homePageSlider {
          nodes {
            ... on Post {
              postId
            }
          }
        }
      }
    }
  }
`;

