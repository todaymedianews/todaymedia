# Author Profile Image Revalidation Setup

This document explains how the author profile image revalidation system works between WordPress and Next.js.

## Overview

When an author's profile image is updated in WordPress, the system automatically revalidates all Next.js pages that display author information to ensure the new image is shown immediately.

## WordPress Setup

### Hook Registration (Already Configured)
```php
// User profile update
add_action('profile_update', 'trigger_nextjs_revalidation_on_user_profile_update');
```

### Webhook Function
```php
function trigger_nextjs_revalidation_on_user_profile_update($user_id) {
    $user = get_userdata($user_id);
    if (!$user) {
        return;
    }
    send_revalidation_webhook($user->ID, (object) [
        'post_name' => $user->user_login,
        'post_type' => 'user_profile'
    ], 'user_profile_update');
}
```

### Webhook Payload
When a user profile is updated, WordPress sends this payload to Next.js:
```json
{
  "action": "user_profile_update",
  "post_type": "user_profile",
  "post_name": "username",
  "post_id": 11
}
```

## Next.js Implementation

### API Route: `/app/api/revalidate/route.ts`

The revalidation endpoint handles the `user_profile_update` action:

```typescript
else if (action === 'user_profile_update' && post_type === 'user_profile') {
  console.log(`👤 User profile update detected for user: ${post_name || post_id}`);
  
  // Revalidate homepage (shows articles with author info)
  revalidatePath('/');
  
  // Revalidate all author pages
  revalidatePath('/author/[id]', 'page');
  
  // Revalidate all article pages (they display author images)
  revalidatePath('/[category]/[id]', 'page');
  
  // Revalidate all category pages (they list articles with author info)
  revalidatePath('/category/[category]', 'page');
  
  // Revalidate all tag pages (they list articles with author info)
  revalidatePath('/tag/[tag]', 'page');
}
```

## Pages That Get Revalidated

When an author profile image is updated, the following pages are automatically revalidated:

1. **Homepage** (`/`)
   - Shows articles with author information in various sections

2. **Author Pages** (`/author/[id]`)
   - Author profile header with image
   - List of author's articles

3. **Article Pages** (`/[category]/[id]`)
   - Author box at bottom of article shows author image
   - Article metadata shows author name

4. **Category Pages** (`/category/[category]`)
   - Article cards may show author information

5. **Tag Pages** (`/tag/[tag]`)
   - Article listings may show author information

## Configuration

### Environment Variables

Ensure these are configured:

**WordPress (functions.php)**
```php
define('NEXTJS_URL', 'https://todaymedia-peach.vercel.app');
define('NEXTJS_SECRET', 'your-secret-token-here');
```

**Next.js (.env.local)**
```env
REVALIDATE_SECRET=your-secret-token-here
```

⚠️ **Important**: The `NEXTJS_SECRET` in WordPress must match `REVALIDATE_SECRET` in Next.js exactly.

## Testing

### 1. Test WordPress Webhook Configuration
Visit: `https://your-wordpress-site.com/?test_nextjs_revalidation=1` (admin only)

This will:
- Check configuration
- Send a test webhook
- Show response from Next.js

### 2. Test User Profile Update
1. Log into WordPress admin
2. Go to Users → Profile (or any user)
3. Update the user's profile image using ACF field `userProfileImage.profileImage`
4. Save the profile
5. Check WordPress debug log (`/wp-content/debug.log`) for webhook success
6. Visit the author's page on your Next.js site to see the updated image

### 3. Monitor Logs

**WordPress Logs** (`/wp-content/debug.log`):
```
✅ Next.js webhook SUCCESS: {"success":true,"revalidated":true...}
```

**Next.js Logs** (console):
```
👤 User profile update detected for user: john-doe
✅ Revalidated homepage
✅ Revalidated all author pages
✅ Revalidated all article pages
✅ Revalidated category pages
✅ Revalidated tag pages
✅ User profile revalidation complete for: john-doe
```

## GraphQL Query Updates

The author profile image is fetched via the following GraphQL query structure:

```graphql
author {
  node {
    name
    slug
    databaseId
    userProfileImage {
      profileImage {
        node {
          sourceUrl
        }
      }
    }
  }
}
```

This query is included in all article queries:
- `GET_ARTICLE`
- `GET_ARTICLES`
- `GET_ARTICLES_BY_CATEGORY`
- `GET_ARTICLES_BY_TAG`
- `GET_ARTICLES_BY_AUTHOR`
- `GET_ARTICLES_BY_AUTHOR_ID`

## Troubleshooting

### Image Not Updating After Profile Change

1. **Check WordPress Logs**
   - Ensure webhook was sent successfully
   - Look for "✅ Next.js webhook SUCCESS" messages

2. **Check Next.js Logs**
   - Verify revalidation endpoint received the request
   - Look for "👤 User profile update detected" messages

3. **Verify Environment Variables**
   - Ensure `NEXTJS_SECRET` matches `REVALIDATE_SECRET`
   - Check that `NEXTJS_URL` points to correct deployment

4. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or open in incognito mode

5. **Check ISR Configuration**
   - Author page: `revalidate = 300` (5 minutes)
   - Article page: `revalidate = 300` (5 minutes)

### Webhook Authentication Errors

If you see "401 Unauthorized":
- Secret tokens don't match
- Check WordPress: `NEXTJS_SECRET`
- Check Next.js: `REVALIDATE_SECRET` in `.env.local`
- Ensure no extra spaces or characters

### Webhook Connection Errors

If webhook fails to connect:
- Verify `NEXTJS_URL` is correct
- Check firewall settings
- Ensure Next.js app is deployed and running
- For local development, use tunneling service (ngrok, cloudflared)

## Flow Diagram

```
WordPress User Profile Update
           ↓
  profile_update hook fires
           ↓
trigger_nextjs_revalidation_on_user_profile_update()
           ↓
  send_revalidation_webhook()
           ↓
   POST to /api/revalidate
   {
     action: "user_profile_update",
     post_type: "user_profile",
     post_name: "username",
     post_id: 11
   }
           ↓
   Next.js receives webhook
           ↓
   Validates secret token
           ↓
   Revalidates all author-related pages
           ↓
   Returns success response
           ↓
   New author image visible on site
```

## Security

- Webhook is protected by secret token authentication
- Token sent via `x-secret` header
- 401 response if token doesn't match
- WordPress blocks non-admin access to test endpoint

## Performance

- Revalidation is asynchronous in WordPress (non-blocking)
- Next.js ISR ensures pages are regenerated on-demand
- Cached pages served until revalidation completes
- Average revalidation time: 50-200ms

## Related Files

- WordPress: `/functions.php` (lines 304-411)
- Next.js: `/app/api/revalidate/route.ts`
- Queries: `/lib/queries/article/articleQuires.ts`
- Types: `/types/articles.ts`
- Components:
  - `/app/[category]/[id]/ArticleContent.tsx`
  - `/app/author/[id]/page.tsx`
  - `/components/shared/ArticleCardWithAuthor.tsx`
  - `/components/home/OpinionsSection.tsx`

