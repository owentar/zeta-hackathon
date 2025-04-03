import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

console.log("isProduction", isProduction);

export const logger = pino({
  name: "age-lens-backend",
  level: isProduction ? "info" : "debug",
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      },
});
