"use server";

import aj from "@/lib/arcjet";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import { request } from "@arcjet/next";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 chracters." }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 chracters long." }),
});

export async function registerUserAction(formData) {
  const validatedFields = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
      status: 400,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      email,
    });

    console.log(decision, "decision");

    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        const emailTypes = decision.reason.emailTypes;
        if (emailTypes.includes("DISPOSABLE")) {
          return {
            error: "Disposable email addresses are not allowed",
            status: 403,
          };
        } else if (emailTypes.includes("INVALID")) {
          return {
            error: "Invalid Email address",
            status: 403,
          };
        } else if (emailTypes.includes("NO_MX_RECORDS")) {
          return {
            error: "Email domain does not have valid MX records",
            status: 403,
          };
        } else {
          return {
            error: "Email address is not accepted! Please try again",
            status: 403,
          };
        }
      } else if (decision.reason.isBot()) {
        return {
          error: "Bot activity detected",
          status: 403,
        };
      } else if (decision.reason.isRateLimit()) {
        return {
          error: "Too many requests! Please try again later",
          status: 403,
        };
      }
    }

    //database connection
    await connectToDatabase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        error: "User already exists",
        status: 400,
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const result = new User({
      name,
      email,
      password: hashPassword,
    });

    await result.save();

    if (result) {
      return {
        success: "user registered successfully",
        status: 201,
      };
    } else {
      return {
        error: "Internal server error",
        status: 500,
      };
    }
  } catch (e) {
    console.error(e, "Registration error");
    return {
      error: "Internal server error",
      status: 500,
    };
  }
}
