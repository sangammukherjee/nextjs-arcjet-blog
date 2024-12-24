import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";
import { createUploadthing } from "uploadthing/next";

const fn = createUploadthing();

export const ourFileRouter = {
  imageUploader: fn({ image: { maxFileSize: "4MB" } })
    .middleware(async (req) => {
      const token = (await cookies()).get("token")?.value;
      const user = await verifyAuth(token);

      return {
        userId: user?.userId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(metadata.userId);
      console.log(file.url);
    }),
};
