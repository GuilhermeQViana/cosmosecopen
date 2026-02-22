import DOMPurify from 'dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','strong','em','u','ul','ol','li','table','tr','td','th','thead','tbody','a','span','div','blockquote','pre','code','img','sub','sup'],
    ALLOWED_ATTR: ['href','target','class','id','rel','src','alt','width','height','style'],
    ALLOW_DATA_ATTR: false,
  });
}
