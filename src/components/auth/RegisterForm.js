"use client";

import { Key, Mail, User } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { registerUserAction } from "@/actions/register";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 chracters." }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 chracters long." }),
});

function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => formData.append(key, data[key]));
      const result = await registerUserAction(formData);
      console.log(result, "result");
      if (result.success) {
        toast({
          title: "Registration succesful",
          description: result.success,
        });
        router.push("/login");
      } else {
        throw new Error(result.error || "Something went wrong!");
      }
    } catch (e) {
      console.log(e);
      toast({
        title: "Registration failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          <Input
            {...register("name")}
            placeholder="Name"
            disabled={isLoading}
            className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            {...register("email")}
            placeholder="Email"
            disabled={isLoading}
            className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="relative">
          <Key className="absolute left-2 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="password"
            {...register("password")}
            placeholder="Password"
            disabled={isLoading}
            className="pl-10 bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-3 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        Register
      </Button>
    </form>
  );
}

export default RegisterForm;
