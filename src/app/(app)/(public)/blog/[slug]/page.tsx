import markdownToHtml from "@/modules/shared/infrastructure/cms/markdown-to-html";
import { getAllPosts, getPostBySlug } from "@/modules/shared/infrastructure/cms/utils";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// Generate SEO metadata dynamically
export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      images: [{ url: post.ogImage.url }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.ogImage.url],
    },
  };
}

export default async function BlogEntryPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const content = await markdownToHtml(post.content);
  return (
    <div className="flex flex-col w-full gap-6 px-6 sm:px-12 py-3 mt-28">
      <article className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/blog" className="flex items-center gap-2 text-gray-600 hover:text-foreground mb-8">
          <ArrowLeft />
          Back to Blog
        </Link>
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-600 mb-8">
            <div>
              <time>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img src={post.coverImage} alt={post.title} className="object-cover" />
            {post.coverImageCredit && (
              <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
                Photo by{" "}
                <a
                  href={post.coverImageCredit.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {post.coverImageCredit.photographerName}
                </a>
              </div>
            )}
          </div>
        </header>

        <div className={"markdown"} dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </div>
  );
}

