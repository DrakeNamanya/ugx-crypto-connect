
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
}

const defaultDescription = "UGXchange - The leading crypto exchange platform in Uganda.";
const defaultKeywords = "cryptocurrency, Uganda, exchange, UGX, USDT, mobile money, crypto trading";
const defaultOgImage = `${window.location.origin}/ogimage.jpg`;

const SEO: React.FC<SEOProps> = ({
  title,
  description = defaultDescription,
  keywords = defaultKeywords,
  ogImage = defaultOgImage,
  ogUrl = window.location.href
}) => {
  const siteTitle = title ? `${title} | UGXchange` : 'UGXchange - Crypto Exchange Uganda';
  
  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={ogUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Security headers */}
      <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https://* data:; font-src 'self' https://* data:; style-src 'self' 'unsafe-inline' https://*; script-src 'self' 'unsafe-inline' https://*; connect-src 'self' https://*;" />
      <meta http-equiv="X-Content-Type-Options" content="nosniff" />
      <meta http-equiv="X-Frame-Options" content="SAMEORIGIN" />
      <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
    </Helmet>
  );
};

export default SEO;
