/**
 * Analytics Event Types
 *
 * Pattern: {domain}_{action}_{target}
 * - guide_ : Public guide interactions
 * - admin_ : Admin dashboard
 * - auth_  : Authentication
 * - venue_ : Venue management
 */

// Event name constants
export const AnalyticsEvent = {
  // Public Guide Events (gtag only - no Firebase SDK)
  GUIDE_VIEW: 'guide_view',
  GUIDE_SECTION_EXPAND: 'guide_section_expand',
  GUIDE_SECTION_COLLAPSE: 'guide_section_collapse',
  GUIDE_EXPAND_ALL: 'guide_expand_all',
  GUIDE_COLLAPSE_ALL: 'guide_collapse_all',
  GUIDE_IMAGE_VIEW: 'guide_image_view',
  GUIDE_PDF_DOWNLOAD: 'guide_pdf_download',
  GUIDE_EXTERNAL_LINK: 'guide_external_link',
  GUIDE_FEEDBACK_SUBMIT: 'guide_feedback_submit',
  // GUIDE_FEEDBACK_TEXT removed - text feedback now goes to Firestore only

  // Auth Events
  AUTH_LOGIN_ATTEMPT: 'auth_login_attempt',
  AUTH_LOGIN_SUCCESS: 'auth_login_success',
  AUTH_LOGIN_FAILURE: 'auth_login_failure',
  AUTH_LOGOUT: 'auth_logout',

  // Admin Dashboard Events
  ADMIN_DASHBOARD_VIEW: 'admin_dashboard_view',
  ADMIN_TAB_SWITCH: 'admin_tab_switch',
  ADMIN_VENUE_CLICK: 'admin_venue_click',
  ADMIN_CREATE_VENUE_CLICK: 'admin_create_venue_click',

  // Venue Management Events
  VENUE_PDF_UPLOAD_START: 'venue_pdf_upload_start',
  VENUE_PDF_UPLOAD_COMPLETE: 'venue_pdf_upload_complete',
  VENUE_PDF_UPLOAD_ERROR: 'venue_pdf_upload_error',
  VENUE_TRANSFORM_START: 'venue_transform_start',
  VENUE_TRANSFORM_COMPLETE: 'venue_transform_complete',
  VENUE_TRANSFORM_ERROR: 'venue_transform_error',
  VENUE_PUBLISH_CLICK: 'venue_publish_click',
  VENUE_PUBLISH_CONFIRM: 'venue_publish_confirm',
  VENUE_PUBLISH_SUCCESS: 'venue_publish_success',
  VENUE_PUBLISH_ERROR: 'venue_publish_error',
  VENUE_IMAGE_EDITOR_OPEN: 'venue_image_editor_open',
  VENUE_IMAGE_EDITOR_SAVE: 'venue_image_editor_save',
  VENUE_EMBED_EDITOR_OPEN: 'venue_embed_editor_open',
  VENUE_EMBED_EDITOR_SAVE: 'venue_embed_editor_save',
  VENUE_EDITOR_ADD: 'venue_editor_add',
  VENUE_EDITOR_REMOVE: 'venue_editor_remove',
  VENUE_VERSION_PREVIEW: 'venue_version_preview',
  VENUE_VERSION_MAKE_LIVE: 'venue_version_make_live',
  VENUE_DELETE: 'venue_delete',

  // Super Admin Events
  SUPER_ADMIN_ANALYTICS_VIEW: 'super_admin_analytics_view',
} as const

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent]

// Event parameter types
export interface GuideViewParams {
  venue_slug: string
  venue_name?: string
}

export interface GuideSectionParams {
  venue_slug: string
  section_name: string
  section_id: string
}

export interface GuideImageViewParams {
  venue_slug: string
  section_name: string
  image_index: number
}

export interface GuidePdfDownloadParams {
  venue_slug: string
  venue_name: string
}

export interface GuideExternalLinkParams {
  venue_slug: string
  link_type: 'maps' | 'phone' | 'email' | 'website'
  destination?: string
}

export interface GuideFeedbackParams {
  venue_slug: string
  feedback: 'up' | 'down'
}

// GuideFeedbackTextParams removed - text feedback now goes to Firestore only

export interface AuthLoginParams {
  method: 'email' | 'google'
}

export interface AuthLoginFailureParams {
  method: 'email' | 'google'
  error_code?: string
}

export interface AdminTabSwitchParams {
  from_tab: string
  to_tab: string
}

export interface AdminVenueClickParams {
  venue_id: string
  venue_name: string
}

export interface VenueParams {
  venue_id: string
  venue_slug?: string
}

export interface VenueErrorParams {
  venue_id: string
  error_code?: string
  error_message?: string
}

export interface VenueEditorParams {
  venue_id: string
  editor_email: string
  action: 'add' | 'remove'
}

export interface VenueVersionParams {
  venue_id: string
  version_timestamp: string
}

// Union type for all event params
export type AnalyticsEventParams =
  | GuideViewParams
  | GuideSectionParams
  | GuideImageViewParams
  | GuidePdfDownloadParams
  | GuideExternalLinkParams
  | GuideFeedbackParams
  | AuthLoginParams
  | AuthLoginFailureParams
  | AdminTabSwitchParams
  | AdminVenueClickParams
  | VenueParams
  | VenueErrorParams
  | VenueEditorParams
  | VenueVersionParams
  | Record<string, string | number | boolean | undefined>
