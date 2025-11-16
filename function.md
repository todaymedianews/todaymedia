<?php
/**
 * TodayMedia functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package TodayMedia
 */

if ( ! defined( '_S_VERSION' ) ) {
	// Replace the version number of the theme on each release.
	define( '_S_VERSION', '1.0.0' );
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 *
 * Note that this function is hooked into the after_setup_theme hook, which
 * runs before the init hook. The init hook is too late for some features, such
 * as indicating support for post thumbnails.
 */
function todaymedia_setup() {
	/*
		* Make theme available for translation.
		* Translations can be filed in the /languages/ directory.
		* If you're building a theme based on TodayMedia, use a find and replace
		* to change 'todaymedia' to the name of your theme in all the template files.
		*/
	load_theme_textdomain( 'todaymedia', get_template_directory() . '/languages' );

	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	/*
		* Let WordPress manage the document title.
		* By adding theme support, we declare that this theme does not use a
		* hard-coded <title> tag in the document head, and expect WordPress to
		* provide it for us.
		*/
	add_theme_support( 'title-tag' );

	/*
		* Enable support for Post Thumbnails on posts and pages.
		*
		* @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		*/
	add_theme_support( 'post-thumbnails' );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menus( array(
		'top-menu'    => esc_html__( '​Secondary Nav Menu', 'todaymedia' ),
		'primary'     => esc_html__( 'Main Nav Menu',     'todaymedia' ),
		'404-menu'    => esc_html__( '404 Page menu',     'todaymedia' ),
		'footer-menu' => esc_html__( 'Footer Navigation', 'todaymedia' ),
	));

	/*
		* Switch default core markup for search form, comment form, and comments
		* to output valid HTML5.
		*/
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);

	// Set up the WordPress core custom background feature.
	add_theme_support(
		'custom-background',
		apply_filters(
			'todaymedia_custom_background_args',
			array(
				'default-color' => 'ffffff',
				'default-image' => '',
			)
		)
	);

	// Add theme support for selective refresh for widgets.
	add_theme_support( 'customize-selective-refresh-widgets' );

	/**
	 * Add support for core custom logo.
	 *
	 * @link https://codex.wordpress.org/Theme_Logo
	 */
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 250,
			'width'       => 250,
			'flex-width'  => true,
			'flex-height' => true,
		)
	);
}
add_action( 'after_setup_theme', 'todaymedia_setup' );

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function todaymedia_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'todaymedia_content_width', 640 );
}
add_action( 'after_setup_theme', 'todaymedia_content_width', 0 );

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function todaymedia_widgets_init() {
	register_sidebar(
		array(
			'name'          => esc_html__( 'Sidebar', 'todaymedia' ),
			'id'            => 'sidebar-1',
			'description'   => esc_html__( 'Add widgets here.', 'todaymedia' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'todaymedia_widgets_init' );

/**
 * Enqueue scripts and styles.
 */
function todaymedia_scripts() {
	wp_enqueue_style( 'todaymedia-style', get_stylesheet_uri(), array(), _S_VERSION );
	wp_style_add_data( 'todaymedia-style', 'rtl', 'replace' );

	wp_enqueue_script( 'todaymedia-navigation', get_template_directory_uri() . '/js/navigation.js', array(), _S_VERSION, true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'todaymedia_scripts' );

/**
 * Implement the Custom Header feature.
 */
require get_template_directory() . '/inc/custom-header.php';

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Functions which enhance the theme by hooking into WordPress.
 */
require get_template_directory() . '/inc/template-functions.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * Load Jetpack compatibility file.
 */
if ( defined( 'JETPACK__VERSION' ) ) {
	require get_template_directory() . '/inc/jetpack.php';
}

function themename_custom_logo_setup() {
	$defaults = array(
		'height'               => 100,
		'width'                => 400,
		'flex-height'          => true,
		'flex-width'           => true,
		'header-text'          => array( 'site-title', 'site-description' ),
		'unlink-homepage-logo' => true, 
	);
	add_theme_support( 'custom-logo', $defaults );
}
add_action( 'after_setup_theme', 'themename_custom_logo_setup' );

add_action( 'graphql_register_types', function() {

  // Site Info Type
  register_graphql_object_type( 'SiteInfo', [
    'description' => __( 'General site information', 'your-textdomain' ),
    'fields' => [
      'siteUrl' => [ 'type' => 'String' ],
      'siteName' => [ 'type' => 'String' ],
      'siteDescription' => [ 'type' => 'String' ],
    ],
  ]);

  // Site Info Field
  register_graphql_field( 'RootQuery', 'siteInfo', [
    'type' => 'SiteInfo',
    'description' => __( 'Site information', 'your-textdomain' ),
    'resolve' => function() {
      return [
        'siteUrl' => get_site_url(),
        'siteName' => get_bloginfo('name'),
        'siteDescription' => get_bloginfo('description'),
      ];
    },
  ]);

  // Site Logo URL
  register_graphql_field( 'RootQuery', 'siteLogoUrl', [
    'type' => 'String',
    'description' => __( 'The site logo URL', 'your-textdomain' ),
    'resolve' => function() {
      $custom_logo_id = get_theme_mod( 'custom_logo' );
      $logo = wp_get_attachment_image_src( $custom_logo_id , 'full' );
      return $logo ? $logo[0] : null;
    }
  ]);

  // Site Logo Object
  register_graphql_field( 'RootQuery', 'siteLogo', [
    'type' => 'MediaItem',
    'description' => __( 'The site logo image object', 'your-textdomain' ),
    'resolve' => function() {
      $custom_logo_id = get_theme_mod( 'custom_logo' );
      if ( ! $custom_logo_id ) {
        return null;
      }
      return \WPGraphQL\ModelRegistry::get_model( 'MediaItem', $custom_logo_id );
    }
  ]);

});


/**
 * WordPress to Next.js Auto-Revalidation Webhook
 * 
 * INSTALLATION:
 * 1. Copy this ENTIRE file content
 * 2. Paste into your WordPress theme's functions.php file
 * 3. Update NEXTJS_URL and NEXTJS_SECRET below
 * 4. Save functions.php
 * 5. Test by visiting: yoursite.com/?test_nextjs_revalidation=1
 * 
 * This will automatically trigger Next.js revalidation when:
 * - Posts/Pages are created, updated, published, unpublished, or deleted
 * - Menus are updated or deleted
 * - Media files are uploaded, edited, or deleted
 * - User profiles are updated
 */

// ===============================
// 🔧 CONFIGURATION - CHANGE THESE!
// ===============================
if (!defined('NEXTJS_URL')) {
    define('NEXTJS_URL', 'https://www.todaymedia.net'); // Change to your Next.js URL (no trailing slash)
}
if (!defined('NEXTJS_SECRET')) {
    define('NEXTJS_SECRET', 'nxjs_8k2m9p4w7q5t3v6x'); // Must match REVALIDATE_SECRET in .env.local
}

// Enable WordPress debug logging to see webhook activity
if (!defined('WP_DEBUG_LOG')) {
    define('WP_DEBUG_LOG', true);
}

// ===============================
// 🪝 WordPress Hooks
// ===============================

// Post/Page create or edit
add_action('save_post', 'trigger_nextjs_revalidation', 10, 3);

// Post/Page publish/unpublish
add_action('transition_post_status', 'trigger_nextjs_revalidation_on_status_change', 10, 3);

// Post/Page delete
add_action('before_delete_post', 'trigger_nextjs_revalidation_on_delete');

// Menu update/delete
add_action('wp_update_nav_menu', 'trigger_nextjs_revalidation_on_menu_update');
add_action('wp_delete_nav_menu', 'trigger_nextjs_revalidation_on_menu_update');

// Media upload/edit/delete
add_action('add_attachment', 'trigger_nextjs_revalidation_on_media');
add_action('edit_attachment', 'trigger_nextjs_revalidation_on_media');
add_action('delete_attachment', 'trigger_nextjs_revalidation_on_media');

// ACF Options Page (Theme Settings) update
add_action('acf/save_post', 'trigger_nextjs_revalidation_on_acf_options', 20);

// User profile update
add_action('profile_update', 'trigger_nextjs_revalidation_on_user_profile_update');

// ===============================
// 📝 Functions
// ===============================

/**
 * Trigger revalidation on post save
 */
function trigger_nextjs_revalidation($post_id, $post, $update) {
    // Skip autosaves and revisions
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }

    // Only trigger for published content
    if ($post->post_status !== 'publish') {
        return;
    }

    // Skip if not public post type
    $post_type_obj = get_post_type_object($post->post_type);
    if (!$post_type_obj || !$post_type_obj->public) {
        return;
    }

    send_revalidation_webhook($post_id, $post, $update ? 'update' : 'create');
}

/**
 * Trigger revalidation on status change (publish/unpublish)
 */
function trigger_nextjs_revalidation_on_status_change($new_status, $old_status, $post) {
    $post_type_obj = get_post_type_object($post->post_type);
    if (!$post_type_obj || !$post_type_obj->public) {
        return;
    }

    if ($new_status === 'publish' && $old_status !== 'publish') {
        send_revalidation_webhook($post->ID, $post, 'publish');
    } elseif ($old_status === 'publish' && $new_status !== 'publish') {
        send_revalidation_webhook($post->ID, $post, 'unpublish');
    }
}

/**
 * Trigger revalidation on post delete
 */
function trigger_nextjs_revalidation_on_delete($post_id) {
    $post = get_post($post_id);
    if (!$post) {
        return;
    }

    $post_type_obj = get_post_type_object($post->post_type);
    if (!$post_type_obj || !$post_type_obj->public) {
        return;
    }

    send_revalidation_webhook($post_id, $post, 'delete');
}

/**
 * Trigger revalidation on menu update/delete
 */
function trigger_nextjs_revalidation_on_menu_update($menu_id = null) {
    send_revalidation_webhook(0, (object)[
        'post_name' => 'menu',
        'post_type' => 'nav_menu'
    ], 'menu_update');
}

/**
 * Trigger revalidation on media upload/edit/delete
 */
function trigger_nextjs_revalidation_on_media($attachment_id) {
    $post = get_post($attachment_id);
    send_revalidation_webhook($attachment_id, $post, 'media_update');
}

/**
 * Trigger revalidation on ACF Options Page (Theme Settings) update
 */
function trigger_nextjs_revalidation_on_acf_options($post_id) {
    // Check if this is an ACF options page save
    // ACF options pages use string IDs like 'options' or the menu slug (e.g., 'theme-settings')
    if ($post_id === 'options' || $post_id === 'theme-settings' || strpos($post_id, 'options') === 0) {
        send_revalidation_webhook(0, (object)[
            'post_name' => 'theme-settings',
            'post_type' => 'acf_options'
        ], 'theme_settings_update');
    }
}

/**
 * Trigger revalidation on user profile update
 */
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

/**
 * Send webhook to Next.js revalidation API
 */
function send_revalidation_webhook($post_id, $post, $action) {
    // Validate configuration (only check if NOT defaults)
    if (!defined('NEXTJS_URL')) {
        error_log('⚠️ NEXTJS_URL not defined in functions.php');
        return;
    }
    
    if (!defined('NEXTJS_SECRET')) {
        error_log('⚠️ NEXTJS_SECRET not defined in functions.php');
        return;
    }
    
    // Warn but continue if using defaults (allow localhost development)
    if (NEXTJS_URL === 'https://www.todaymedia.net/') {
        error_log('ℹ️ Using default NEXTJS_URL (localhost) - make sure Next.js is running');
    }
    
    if (NEXTJS_SECRET === 'your-secret-token') {
        error_log('ℹ️ Using default NEXTJS_SECRET - should change for production');
    }

    $webhook_url = NEXTJS_URL . '/api/revalidate';

    $body = [
        'action'    => $action,
        'post_type' => $post->post_type ?? 'unknown',
        'slug'      => $post->post_name ?? '',
        'post_id'   => $post_id,
    ];

    // Log webhook attempt for debugging
    error_log('🔔 Sending Next.js webhook: ' . wp_json_encode($body));

    $args = [
        'headers' => [
            'Content-Type' => 'application/json',
            'x-secret'     => NEXTJS_SECRET,
        ],
        'body'       => wp_json_encode($body),
        'timeout'    => 15,
        'blocking'   => true, // Changed to true for better debugging
        'sslverify'  => false, // Set to true in production with HTTPS
    ];

    $response = wp_remote_post($webhook_url, $args);

    // Log response for debugging
    if (is_wp_error($response)) {
        error_log('❌ Next.js webhook ERROR: ' . $response->get_error_message());
    } else {
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code === 200) {
            error_log('✅ Next.js webhook SUCCESS: ' . $response_body);
        } else {
            error_log('⚠️ Next.js webhook responded with code ' . $response_code . ': ' . $response_body);
        }
    }
}

/**
 * Test function - Visit: yoursite.com/?test_nextjs_revalidation=1
 * (Only works for admin users)
 */
add_action('init', 'test_nextjs_revalidation');
function test_nextjs_revalidation() {
    if (isset($_GET['test_nextjs_revalidation']) && current_user_can('manage_options')) {
        echo '<h2>🔧 Next.js Webhook Configuration Test</h2>';
        echo '<hr>';
        
        // Check configuration
        echo '<h3>Configuration:</h3>';
        echo '<p><strong>NEXTJS_URL:</strong> ' . (defined('NEXTJS_URL') ? NEXTJS_URL : '❌ Not defined') . '</p>';
        echo '<p><strong>NEXTJS_SECRET:</strong> ' . (defined('NEXTJS_SECRET') ? '✅ Defined (' . strlen(NEXTJS_SECRET) . ' chars)' : '❌ Not defined') . '</p>';
        echo '<hr>';
        
        // Send test webhook
        echo '<h3>Sending Test Webhook...</h3>';
        $test_post = (object)[
            'ID'        => 999,
            'post_name' => 'test-post',
            'post_type' => 'post'
        ];
        
        // Call with blocking to see result
        $webhook_url = NEXTJS_URL . '/api/revalidate';
        $body = [
            'action'    => 'test',
            'post_type' => 'post',
            'slug'      => 'test-post',
            'post_id'   => 999,
        ];
        
        $args = [
            'headers' => [
                'Content-Type' => 'application/json',
                'x-secret'     => NEXTJS_SECRET,
            ],
            'body'       => wp_json_encode($body),
            'timeout'    => 15,
            'blocking'   => true,
            'sslverify'  => false,
        ];
        
        echo '<p>Target URL: <code>' . $webhook_url . '</code></p>';
        echo '<p>Payload: <code>' . wp_json_encode($body) . '</code></p>';
        echo '<hr>';
        
        $response = wp_remote_post($webhook_url, $args);
        
        if (is_wp_error($response)) {
            echo '<p style="color: red;">❌ <strong>ERROR:</strong> ' . $response->get_error_message() . '</p>';
            echo '<h4>Common Issues:</h4>';
            echo '<ul>';
            echo '<li>Is your Next.js server running?</li>';
            echo '<li>Is the URL correct? (http://localhost:3000 for local)</li>';
            echo '<li>Check your firewall settings</li>';
            echo '</ul>';
        } else {
            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);
            
            if ($response_code === 200) {
                echo '<p style="color: green;">✅ <strong>SUCCESS!</strong> Webhook received by Next.js</p>';
                echo '<p>Response: <code>' . htmlspecialchars($response_body) . '</code></p>';
                echo '<p>Now try editing/publishing a post in WordPress to see automatic revalidation!</p>';
            } else if ($response_code === 401) {
                echo '<p style="color: red;">❌ <strong>AUTHENTICATION ERROR (401)</strong></p>';
                echo '<p>The secret token doesn\'t match!</p>';
                echo '<p>WordPress NEXTJS_SECRET: <code>' . substr(NEXTJS_SECRET, 0, 5) . '...</code></p>';
                echo '<p>Make sure REVALIDATE_SECRET in .env.local matches exactly</p>';
            } else {
                echo '<p style="color: orange;">⚠️ <strong>Unexpected Response Code:</strong> ' . $response_code . '</p>';
                echo '<p>Response: <code>' . htmlspecialchars($response_body) . '</code></p>';
            }
        }
        
        echo '<hr>';
        echo '<h4>📋 Check WordPress Logs:</h4>';
        echo '<p>Location: <code>/wp-content/debug.log</code></p>';
        echo '<p>Look for lines starting with "🔔" or "✅" or "❌"</p>';
        
        wp_die();
    }
}

/**
 * Add admin notice to remind about configuration
 */
add_action('admin_notices', 'nextjs_webhook_configuration_notice');
function nextjs_webhook_configuration_notice() {
    // Only show if secret is still default
    if (!defined('NEXTJS_SECRET') || NEXTJS_SECRET === 'your-secret-token') {
        
        // Only show if not already dismissed
        $user_id = get_current_user_id();
        $dismissed = get_user_meta($user_id, 'nextjs_webhook_notice_dismissed', true);
        
        if ($dismissed) {
            return;
        }
        
        $test_url = admin_url('?test_nextjs_revalidation=1');
        $dismiss_url = add_query_arg('nextjs_dismiss_notice', '1');
        
        echo '<div class="notice notice-info is-dismissible">';
        echo '<p><strong>ℹ️ Next.js Webhook:</strong> Update <code>NEXTJS_SECRET</code> in functions.php to match your .env.local file</p>';
        echo '<p>Current: <code>define(\'NEXTJS_SECRET\', \'your-secret-token\');</code><br>';
        echo 'Example: <code>define(\'NEXTJS_SECRET\', \'abc123xyz\');</code></p>';
        echo '<p><a href="' . $test_url . '" class="button button-primary">Test Configuration</a> ';
        echo '<a href="' . $dismiss_url . '" class="button">Dismiss</a></p>';
        echo '</div>';
    }
}

// Handle dismiss
add_action('admin_init', 'nextjs_webhook_dismiss_notice');
function nextjs_webhook_dismiss_notice() {
    if (isset($_GET['nextjs_dismiss_notice'])) {
        $user_id = get_current_user_id();
        update_user_meta($user_id, 'nextjs_webhook_notice_dismissed', true);
        wp_redirect(remove_query_arg('nextjs_dismiss_notice'));
        exit;
    }
}


add_action('acf/init', function() {
  if ( function_exists('acf_add_options_page') ) {
    acf_add_options_page(array(
      'page_title'        => 'Theme Settings',
      'menu_title'        => 'Theme Settings',
      'menu_slug'         => 'theme-settings',
      'capability'        => 'edit_posts',
      'redirect'          => false,
      'show_in_graphql'   => true, // ✅ This makes it visible in GraphQL
      'graphql_single_name' => 'themeSettings',
      'graphql_plural_name' => 'allThemeSettings',
    ));
  }
});




/*================================================================
Preview
================================================================*/
/**
 * WordPress Preview Custom REST Endpoint
 * 
 * This creates a custom endpoint to fetch draft posts for preview
 * using the validated token system.
 * 
 * ADD THIS to your functions.php (in addition to the preview link code)
 */

/**
 * Register custom REST endpoint for fetching preview posts
 */
 
add_filter('preview_post_link', function($preview_link, $post) {
    
    $nextjs_preview_url = 'https://www.todaymedia.net/api/preview';

    // Get post ID
    $post_id = $post->ID;
    
    // Get category slug (first category)
    $categories = get_the_category($post_id);
    $category_slug = 'uncategorized';
    if (!empty($categories)) {
        $category_slug = $categories[0]->slug;
    }

    // Generate token via REST API function
    $response = nj_create_preview_token_with_id($post_id);
    if (is_wp_error($response)) {
        error_log('❌ Preview token creation failed: ' . $response->get_error_message());
        return $preview_link; // Return original link on error
    }
    
    $data = $response->get_data();
    $token = $data['token'];

    // Build final preview URL with category and id
    $preview_url = add_query_arg([
        'token' => $token,
        'category' => $category_slug,
        'id' => $post_id,
    ], $nextjs_preview_url);

    error_log('✅ Preview URL generated: ' . $preview_url);

    return $preview_url;
}, 10, 2);


add_action('rest_api_init', function() {
    register_rest_route('nextjs/v1', '/create-preview', [
        'methods' => 'GET',
        'callback' => 'nj_create_preview_token',
        'permission_callback' => function() { return current_user_can('edit_posts'); }
    ]);

    register_rest_route('nextjs/v1', '/validate-preview', [
        'methods' => 'GET',
        'callback' => 'nj_validate_preview_token',
        'permission_callback' => '__return_true'
    ]);
});


function nj_create_preview_token(\WP_REST_Request $req) {
    $post_id = intval($req->get_param('post_id'));
    if (!current_user_can('edit_post', $post_id)) {
        return new WP_Error('forbidden', 'No permission', ['status' => 403]);
    }

    $token = bin2hex(random_bytes(24));
    $expires = time() + 60*10; // 10 minutes
    $data = [
        'post_id' => $post_id,
        'user_id' => get_current_user_id(),
        'expires' => $expires,
    ];

    set_transient('nj_preview_' . $token, $data, 60*10);

    $next_url = rtrim(get_option('nj_next_url', ''), '/');
    if (!$next_url) $next_url = 'https://www.todaymedia.net';

    $slug = get_permalink($post_id);
    $preview_path = '/api/preview?token='.$token.'&slug='.rawurlencode(parse_url($slug, PHP_URL_PATH));
    $redirect = $next_url . $preview_path;

    return rest_ensure_response(['preview_url' => $redirect, 'token' => $token]);
}


function nj_create_preview_token_with_id($post_id) {
    if (!current_user_can('edit_post', $post_id)) {
        return new WP_Error('forbidden', 'No permission', ['status' => 403]);
    }

    $token = bin2hex(random_bytes(24));
    $expires = time() + 60*10; // 10 minutes
    $data = [
        'post_id' => $post_id,
        'user_id' => get_current_user_id(),
        'expires' => $expires,
    ];

    set_transient('nj_preview_' . $token, $data, 60*10);

    return rest_ensure_response(['token' => $token]);
}


function nj_validate_preview_token(\WP_REST_Request $req) {
    $token = $req->get_param('token');
    if (!$token) {
        return new WP_Error('bad_request', 'token required', ['status'=>400]);
    }

    $key = 'nj_preview_' . $token;
    $data = get_transient($key);

    if (!$data) {
        return new WP_Error('invalid_token', 'token invalid or expired', ['status'=>401]);
    }

    return rest_ensure_response([
        'valid' => true, 
        'post_id' => $data['post_id'], 
        'expires' => $data['expires']
    ]);
}
 
add_action('rest_api_init', function() {
    register_rest_route('nextjs/v1', '/preview-post', [
        'methods' => 'GET',
        'callback' => 'nj_get_preview_post',
        'permission_callback' => '__return_true', // We validate token manually
    ]);
});

/**
 * Get preview post with token validation
 */
function nj_get_preview_post(\WP_REST_Request $req) {
    // Get parameters
    $token = $req->get_param('token');
    $post_id = intval($req->get_param('post_id'));

    // Validate token
    if (!$token) {
        return new WP_Error('bad_request', 'Token required', ['status' => 400]);
    }

    $key = 'nj_preview_' . $token;
    $token_data = get_transient($key);

    if (!$token_data) {
        return new WP_Error('invalid_token', 'Token invalid or expired', ['status' => 401]);
    }

    // Verify post_id matches token
    if ($token_data['post_id'] != $post_id) {
        return new WP_Error('invalid_post', 'Post ID mismatch', ['status' => 403]);
    }

    // Get the post (including drafts)
    $post = get_post($post_id);

    if (!$post) {
        return new WP_Error('not_found', 'Post not found', ['status' => 404]);
    }

    // Get post data
    $post_data = [
        'id' => $post->ID,
        'title' => $post->post_title,
        'content' => apply_filters('the_content', $post->post_content),
        'excerpt' => $post->post_excerpt ?: wp_trim_excerpt('', $post),
        'status' => $post->post_status,
        'date' => $post->post_date,
        'modified' => $post->post_modified,
        'slug' => $post->post_name,
    ];

    // Get featured image
    if (has_post_thumbnail($post_id)) {
        $thumbnail_id = get_post_thumbnail_id($post_id);
        $image_src = wp_get_attachment_image_src($thumbnail_id, 'full');
        $post_data['featured_image'] = $image_src ? $image_src[0] : null;
    } else {
        $post_data['featured_image'] = null;
    }

    // Get categories
    $categories = get_the_category($post_id);
    $post_data['categories'] = array_map(function($cat) {
        return [
            'id' => $cat->term_id,
            'name' => $cat->name,
            'slug' => $cat->slug,
            'count' => $cat->count,
        ];
    }, $categories);

    // Get tags
    $tags = get_the_tags($post_id);
    $post_data['tags'] = $tags ? array_map(function($tag) {
        return [
            'id' => $tag->term_id,
            'name' => $tag->name,
            'slug' => $tag->slug,
        ];
    }, $tags) : [];

    // Get author
    $author_id = $post->post_author;
    $author = get_userdata($author_id);
    if ($author) {
        $post_data['author'] = [
            'id' => $author->ID,
            'name' => $author->display_name,
            'slug' => $author->user_nicename,
        ];
    }

    // Get ACF SEO fields if they exist
    if (function_exists('get_field')) {
        $seo_fields = get_field('seo_custom_options', $post_id);
        if ($seo_fields) {
            $post_data['seo'] = $seo_fields;
        }
    }

    return rest_ensure_response($post_data);
}

/**
 * Get post count using author ID
 * */

add_action('graphql_register_types', function() {
  
  register_graphql_field('RootQuery', 'authorPostCount', [
    'type' => 'Int',
    'args' => [
      'authorId' => [
        'type' => 'Int',
        'description' => 'Author user ID'
      ],
    ],
    'resolve' => function($root, $args, $context, $info) {
      if (empty($args['authorId'])) {
        return 0;
      }

      // Count published posts by that author
      $count = count_user_posts($args['authorId'], 'post', true);
      return (int) $count;
    },
  ]);
});

function headless_get_frontend_url_generic($post) {

    // If it's a PAGE → /slug
    if ($post->post_type === 'page') {
        return "https://www.todaymedia.net/" . $post->post_name;
    }
	
	if ($post->post_type === 'aiovg_videos') {
        return "https://www.todaymedia.net/video/" . $post->post_name;
    }

    // Otherwise it's a POST → /category-slug/postID
    $categories = get_the_category($post->ID);
    $category_slug = 'uncategorized';

    if (!empty($categories)) {
        $category_slug = $categories[0]->slug;
    }

    return "https://www.todaymedia.net/" . $category_slug . "/" . $post->ID;
}

add_filter('page_row_actions', 'headless_change_admin_view_link', 10, 2);
add_filter('post_row_actions', 'headless_change_admin_view_link', 10, 2);

function headless_change_admin_view_link($actions, $post) {

    $frontend_url = headless_get_frontend_url_generic($post);

    if (isset($actions['view'])) {
        $actions['view'] = '<a href="' . $frontend_url . '" target="_blank">View</a>';
    }

    return $actions;
}

function headless_replace_permalink_generic($permalink, $post) {

    // Skip preview page (your preview code already handles it)
    if (is_admin() && isset($_GET['preview'])) {
        return $permalink;
    }

    return headless_get_frontend_url_generic($post);
}

add_filter('post_type_link', 'headless_replace_permalink_generic', 10, 2);
add_filter('post_link', 'headless_replace_permalink_generic', 10, 2);
add_filter('page_link', 'headless_replace_permalink_generic', 10, 2);
