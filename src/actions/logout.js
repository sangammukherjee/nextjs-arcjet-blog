"use server";

import { cookies } from "next/headers";

export async function logoutUserAction() {
  try {
    (await cookies()).delete("token", { path: "/" });
    return {
      success: "Logged out successfull",
      status: 200,
    };
  } catch (e) {
    return {
      error: "Failed to logout! Please try after sometime.",
      status: 500,
    };
  }
}
