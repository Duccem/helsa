import { Post } from "./post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "src/modules/shared/infrastructure/cms/posts");

function sanitizeSlug(value: string): string {
  const normalized = value.toLowerCase().trim();
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    throw new Error(`Invalid post slug: ${value}`);
  }
  return normalized;
}

export function getPostSlugs() {
  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => sanitizeSlug(fileName.replace(/\.md$/, "")));
}

export function getPostBySlug(slug: string) {
  const realSlug = sanitizeSlug(slug.replace(/\.md$/, ""));
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs.map((slug) => getPostBySlug(slug)).sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export function getRandomPosts(count: number): Post[] {
  const allPosts = getAllPosts();
  const shuffled = allPosts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

