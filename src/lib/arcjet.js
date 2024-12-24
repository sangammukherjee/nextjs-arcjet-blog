import arcjet, {
  detectBot,
  protectSignup,
  shield,
  slidingWindow,
  tokenBucket,
  validateEmail,
} from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    //protect sign up form
    protectSignup({
      email: {
        mode: "LIVE",
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: {
        mode: "LIVE",
        allow: [],
      },
      rateLimit: {
        mode: "LIVE",
        interval: "1m",
        max: 50,
      },
    }),
  ],
});

export const loginRules = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    validateEmail({
      mode: "LIVE",
      block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 50,
    }),
  ],
});

export const blogPostRules = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
    shield({ mode: "DRY_RUN" }),
    // tokenBucket({
    //   mode: "LIVE",
    //   refillRate: 20,
    //   interval: "1m",
    //   capacity: 2,
    // }),
  ],
});

export const commentRules = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 20,
      interval: "1m",
      capacity: 2,
    }),
  ],
});

export const searchRules = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
    shield({ mode: "LIVE" }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 20,
      interval: "1m",
      capacity: 2,
    }),
  ],
});

export const paymentRules = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
    shield({ mode: "LIVE" }),
    validateEmail({
      mode: "LIVE",
      block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
    slidingWindow({
      mode: "LIVE",
      interval: "10m", // counts requests over a 10 minute sliding window
      max: 5,
    }),
  ],
});

export default aj;
