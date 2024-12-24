"use server";

import { paymentRules } from "@/lib/arcjet";
import { request } from "@arcjet/next";

export async function prePaymentAction(email) {
  try {
    const req = await request();
    const decision = await paymentRules.protect(req, {
      email,
    });

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
      } else if (decision.reason.isShield()) {
        return {
          error: "Suspecious activity detected",
          status: 403,
        };
      } else if (decision.reason.isRateLimit()) {
        return {
          error: "Too many requests! Please try after some time",
          status: 403,
        };
      }
    }

    return {
      success: true,
      id: decision.id,
    };
  } catch (e) {
    return {
      error: "Some error ocurred in pre payment step",
    };
  }
}
