import { getBlogPostByIdAction } from "@/actions/blog";
import BlogDetails from "@/components/blog/BlogDeatils";
import { notFound } from "next/navigation";
import { Suspense } from "react";

function Fallback() {
  return <div>Loading...</div>;
}

export default async function BlogDetailsPage({ params }) {
  const { slug } = await params;
  const data = await getBlogPostByIdAction(slug);

  if (data.error) {
    notFound();
  }

  const { post } = data;

  return (
    <Suspense fallback={<Fallback />}>
      <BlogDetails post={JSON.parse(post)} />
    </Suspense>
  );
}
