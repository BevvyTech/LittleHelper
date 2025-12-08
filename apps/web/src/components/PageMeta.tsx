import { Helmet } from 'react-helmet-async';

interface PageMetaProps {
  title: string;
  siteName: string;
  summary: string;
  keywords: string[];
  locale: string;
  updatedAt?: string;
  releaseTag?: string;
}

export function PageMeta({
  title,
  siteName,
  summary,
  keywords,
  locale,
  updatedAt,
  releaseTag,
}: PageMetaProps) {
  const pageTitle = `${title} | ${siteName}`;
  const keywordsContent = keywords.join(', ');

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={summary} />
      <meta name="keywords" content={keywordsContent} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={summary} />
      <meta property="og:type" content="article" />
      <meta property="og:locale" content={locale} />
      {updatedAt && <meta name="article:modified_time" content={updatedAt} />}
      {releaseTag && <meta name="version" content={releaseTag} />}
    </Helmet>
  );
}
