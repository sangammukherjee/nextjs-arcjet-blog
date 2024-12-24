"use client";

import { Controller, useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UploadButton } from "@uploadthing/react";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";
import "./quill-custom.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BLOG_CATEGORIES } from "@/lib/config";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "category is required"),
  coverImage: z.string().min(1, "Image is required"),
});

const isSuspiciousContent = (data) => {
  const suspiciousPatterns = [
    /<script>/i,
    /javascript:/i,
    /onload=/i,
    /onclick=/i,
    /'.*OR.*'/i,
    /UNION SELECT/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(data.content));
};

function CreateBlogForm({ user }) {
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const quillRef = useRef(null);
  const router = useRouter();
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      coverImage: "",
    },
  });

  const title = watch("title");
  const category = watch("category");
  const content = watch("content");
  const coverImage = watch("coverImage");

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["blockquote", "code-block"],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const onBlogSubmit = async (data) => {
    setIsLoading(true);
    try {
      const isSuspiciousInput = isSuspiciousContent(data);

      const result = await fetch("/api/create-blog-post", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "x-arcjet-suspicious": isSuspiciousInput.toString(),
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());

      if (result.success) {
        toast({
          title: "Success",
          description: result.success,
        });
        router.push("/");
      } else {
        toast({
          title: "Error",
          description: result.error,
          varaint: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Some error occured",
        varaint: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setQuillLoaded(true);
  }, []);

  const isBtnDisabled = () => {
    return (
      title === "" || category === "" || coverImage === "" || content === ""
    );
  };

  console.log(title, category, coverImage, content);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user?.userName}</p>
          </div>
        </div>
        <Button
          disabled={isBtnDisabled() || isLoading}
          onClick={handleSubmit(onBlogSubmit)}
        >
          Publish
        </Button>
      </header>
      <main>
        <form>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="Title"
                className="text-4xl font-bold border-none outline-none mb-4 p-0 focus-visible:ring-0"
              />
            )}
          />
          {errors.title && (
            <p className="text-sm text-red-600 mt-2">{errors.title.message}</p>
          )}
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_CATEGORIES.map((categoryItem) => (
                    <SelectItem key={categoryItem.key} value={categoryItem.key}>
                      {categoryItem.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <div className="flex items-center mb-6">
            <UploadButton
              content={{
                button: (
                  <div className="flex gap-3">
                    <PlusCircle className="h-4 w-4 text-white" />
                    <span className="text-[12px]">Add Cover Image</span>
                  </div>
                ),
              }}
              appearance={{
                allowedContent: {
                  display: "none",
                },
              }}
              className="mt-4 ut-button:bg-black ut-button:ut-readying:bg-black"
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setValue("coverImage", res[0].url);
                  toast({
                    title: "Success",
                    description: "Image uploaded successfully",
                  });
                }
              }}
              onUploadError={(error) => {
                // Do something with the error.
                toast({
                  title: "Error",
                  description: `Upload Failed: ${error.message}`,
                  varaint: "destructive",
                });
              }}
            />
          </div>
          {quillLoaded && (
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  modules={modules}
                  {...field}
                  onChange={(content) => field.onChange(content)}
                  placeholder="Write your story..."
                  className="quill-editor"
                />
              )}
            />
          )}
        </form>
      </main>
    </div>
  );
}

export default CreateBlogForm;
