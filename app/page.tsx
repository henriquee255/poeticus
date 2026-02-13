import { Hero } from "@/components/home/hero";
import { FeaturedPosts } from "@/components/home/featured-posts";

export default function Home() {
  return (
    <div className="flex flex-col gap-0">
      <Hero />
      <FeaturedPosts />
    </div>
  );
}
