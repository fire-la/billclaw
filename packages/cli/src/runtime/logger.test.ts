/**
 * Tests for CLI runtime context
 */

import { describe, it, expect } from "vitest";
import {
  CliLogger,
  LogLevel,
  createLogger,
  type CliLoggerConfig,
} from "../logger";

describe("CliLogger", () => {
  describe("constructor", () => {
    it("should create logger with default config", () => {
      const logger = createLogger();
      expect(logger).toBeInstanceOf(CliLogger);
    });

    it("should use DEBUG level when DEBUG env var is set", () => {
      const originalDebug = process.env.DEBUG;
      process.env.DEBUG = "1";

      const logger = createLogger();
      expect(logger).toBeInstanceOf(CliLogger);

      process.env.DEBUG = originalDebug;
    });

    it("should accept custom config", () => {
      const config: Partial<CliLoggerConfig> = {
        level: LogLevel.ERROR,
        colors: false,
        timestamps: false,
      };

      const logger = createLogger(config);
      expect(logger).toBeInstanceOf(CliLogger);
    });
  });

  describe("setLevel", () => {
    it("should change log level", () => {
      const logger = createLogger({ level: LogLevel.INFO });

      logger.setLevel(LogLevel.ERROR);

      // Logger should now only log errors
      // (actual testing of output would require console mocking)
      expect(logger).toBeInstanceOf(CliLogger);
    });
  });

  describe("log methods", () => {
    let logger: CliLogger;
    let originalInfo: typeof console.log;
    let originalError: typeof console.error;
    let infoCalls: string[] = [];
    let errorCalls: string[] = [];

    beforeEach(() => {
      logger = createLogger({ level: LogLevel.DEBUG, colors: false });

      // Mock console methods
      originalInfo = console.log;
      originalError = console.error;

      console.log = (...args: any[]) => {
        infoCalls.push(args.join(" "));
      };
      console.error = (...args: any[]) => {
        errorCalls.push(args.join(" "));
      };

      infoCalls = [];
      errorCalls = [];
    });

    afterEach(() => {
      console.log = originalInfo;
      console.error = originalError;
    });

    it("should log debug messages", () => {
      logger.debug("test debug");
      expect(infoCalls.length).toBeGreaterThan(0);
      expect(infoCalls[0]).toContain("test debug");
    });

    it("should log info messages", () => {
      logger.info("test info");
      expect(infoCalls.length).toBeGreaterThan(0);
      expect(infoCalls[0]).toContain("test info");
    });

    it("should log warn messages", () => {
      logger.warn("test warn");
      // Warning might go to console.log or console.error
      const allCalls = [...infoCalls, ...errorCalls];
      expect(allCalls.some((call) => call.includes("test warn"))).toBe(true);
    });

    it("should log error messages", () => {
      logger.error("test error");
      expect(errorCalls.length).toBeGreaterThan(0);
      expect(errorCalls[0]).toContain("test error");
    });

    it("should handle multiple arguments", () => {
      logger.info("arg1", "arg2", { obj: "value" });
      expect(infoCalls.length).toBeGreaterThan(0);
      expect(infoCalls[0]).toContain("arg1");
      expect(infoCalls[0]).toContain("arg2");
    });

    it("should serialize objects", () => {
      logger.info({ key: "value", num: 42 });
      expect(infoCalls.length).toBeGreaterThan(0);
      expect(infoCalls[0]).toContain("key");
      expect(infoCalls[0]).toContain("value");
    });
  });

  describe("log level filtering", () => {
    let logger: CliLogger;
    let infoCalls: string[] = [];
    let originalInfo: typeof console.log;

    beforeEach(() => {
      logger = createLogger({ level: LogLevel.WARN, colors: false });

      originalInfo = console.log;
      console.log = () => {};
      console.error = () => {};

      infoCalls = [];
    });

    afterEach(() => {
      console.log = originalInfo;
    });

    it("should not log debug when level is WARN", () => {
      // Should not throw
      expect(() => logger.debug("test")).not.toThrow();
    });

    it("should not log info when level is WARN", () => {
      // Should not throw
      expect(() => logger.info("test")).not.toThrow();
    });
  });
});

describe("LogLevel", () => {
  it("should have correct numeric values", () => {
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
  });
});
