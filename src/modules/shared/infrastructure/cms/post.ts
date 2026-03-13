export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage: string;
  coverImageCredit?: {
    photographerName: string;
    photographerUrl: string;
    sourceUrl: string;
  };
  ogImage: {
    url: string;
  };
  content: string;
}
