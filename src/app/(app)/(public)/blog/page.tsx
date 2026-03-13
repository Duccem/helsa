import { getAllPosts } from "@/modules/shared/infrastructure/cms/utils";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Helsa",
  description:
    "Stay updated with the latest news and insights from Helsa. Explore our blog for expert advice, health tips, and industry trends to help you make informed decisions about your healthcare journey.",
};

export default async function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col w-full gap-6 px-6 sm:px-12 py-3 mt-28">
      <div>
        <h1 className="text-4xl font-bold mb-2">Helsa Blog</h1>
        <p className="text-gray-600">
          Stay updated with the latest news and insights from Helsa. Explore our blog for expert advice, health tips,
          and industry trends to help you make informed decisions about your healthcare journey.
        </p>
      </div>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`}>
              <div className="relative aspect-video mb-4 overflow-hidden rounded-lg">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary">{post.title}</h2>
              <p className="text-gray-600 mb-2">{post.excerpt}</p>
              <time className="text-sm text-gray-500">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

