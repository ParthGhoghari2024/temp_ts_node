import pino, { Logger } from "pino";

const logger: Logger<never> = pino({
  transport: {
    target: "pino-pretty",
    options: {
      destination: `logs.log`,
      colorize: true,
    },
  },
});

export { logger };
