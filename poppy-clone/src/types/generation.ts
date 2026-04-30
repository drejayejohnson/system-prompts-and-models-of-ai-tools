export type ContentType =
  | 'blog_post'
  | 'blog_listicle'
  | 'social_instagram'
  | 'social_linkedin'
  | 'social_twitter'
  | 'email_newsletter'
  | 'email_subjects'
  | 'video_script_youtube'
  | 'video_script_tiktok'
  | 'ad_copy'
  | 'product_description'
  | 'press_release';

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  contentType: ContentType;
  icon: string;
  promptScaffold: string;
  formDefaults: Partial<GenerationRequest>;
}

export interface GenerationRequest {
  contentType: ContentType;
  topic: string;
  context?: string;
  targetAudience?: string;
  lengthPreference: 'short' | 'medium' | 'long';
  toneOverride?: string;
  templateId?: string;
  additionalInstructions?: string;
}
