import CreateBlogForm from "@/components/blog/CreateBlog";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function CreateBlogPage() {
  const token = (await cookies()).get("token")?.value;
  const user = await verifyAuth(token);

  return <CreateBlogForm user={user} />;
}
