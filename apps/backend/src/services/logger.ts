import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

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
