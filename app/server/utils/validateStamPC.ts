import type { H3Event } from "h3";
import type { IncomingMessage } from "http";

interface StamConfig {
  allowedIPs: string[];
  requiredUserAgent: string[];
  blockedKeywords: string[];
}

interface ValidationResult {
  isValid: boolean;
  clientIP: string;
  userAgent: string;
  timestamp: string;
  failureReasons?: string[];
}

interface ClientHeaders {
  "user-agent"?: string;
  accept?: string;
  "accept-language"?: string;
  "accept-encoding"?: string;
  "x-forwarded-for"?: string;
  "x-real-ip"?: string;
  [key: string]: string | string[] | undefined;
}

/**
 * Validates if the current request is coming from your home PC
 * @param event - The Nuxt/H3 event object
 * @returns true if it's your home PC, false otherwise
 */
export function validateHomePC(event: H3Event): boolean {
  try {
    const req: IncomingMessage = event.node.req;
    const headers: ClientHeaders = req.headers as ClientHeaders;

    const clientIP: string = getClientIP(event);

    const stamConfig: StamConfig = {
      allowedIPs: ["192.168.1.100", "10.0.0.50", "127.0.0.1", "::1"],
      requiredUserAgent: ["Windows NT", "Chrome"],
      blockedKeywords: ["bot", "crawler", "spider", "headless"],
    };

    const isHomeIP: boolean =
      stamConfig.allowedIPs.includes(clientIP) ||
      clientIP.startsWith("192.168.");

    if (!isHomeIP) {
      return false;
    }

    const userAgent: string = headers["user-agent"] || "";
    const isPCBrowser: boolean = stamConfig.requiredUserAgent.every(
      (keyword: string) => userAgent.includes(keyword)
    );
    const isBot: boolean = stamConfig.blockedKeywords.some((keyword: string) =>
      userAgent.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!isPCBrowser || isBot) {
      return false;
    }

    const hasNormalHeaders: boolean = !!(
      headers["accept"] &&
      headers["accept-language"] &&
      headers["accept-encoding"]
    );

    if (!hasNormalHeaders) {
      return false;
    }

    return true;
  } catch (error: unknown) {
    console.error("Error validating home PC:", error);
    return false;
  }
}

/**
 * Helper function to extract client IP from request
 * @param event - The H3Event object
 * @returns The client IP address as string
 */
function getClientIP(event: H3Event): string {
  const req: IncomingMessage = event.node.req;
  const headers: ClientHeaders = req.headers as ClientHeaders;

  let forwardedFor: string | undefined;
  if (typeof headers["x-forwarded-for"] === "string") {
    forwardedFor = headers["x-forwarded-for"].split(",")[0]?.trim();
  } else if (Array.isArray(headers["x-forwarded-for"])) {
    forwardedFor = headers["x-forwarded-for"][0]?.split(",")[0]?.trim();
  }

  return (
    forwardedFor ||
    (typeof headers["x-real-ip"] === "string" ? headers["x-real-ip"] : "") ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

/**
 * Detailed validation with comprehensive logging and result object
 * @param event - The H3Event object
 * @returns Detailed validation result with reasons for failure
 */
export function validateHomePCDetailed(event: H3Event): ValidationResult {
  const clientIP: string = getClientIP(event);
  const userAgent: string =
    (event.node.req.headers["user-agent"] as string) || "unknown";
  const timestamp: string = new Date().toISOString();
  const failureReasons: string[] = [];

  const stamConfig: StamConfig = {
    allowedIPs: ["192.168.1.100", "10.0.0.50", "127.0.0.1", "::1"],
    requiredUserAgent: ["Windows NT", "Chrome"],
    blockedKeywords: ["bot", "crawler", "spider", "headless"],
  };

  try {
    // IP validation
    const isHomeIP: boolean =
      stamConfig.allowedIPs.includes(clientIP) ||
      clientIP.startsWith("192.168.");
    if (!isHomeIP) {
      failureReasons.push(`IP address ${clientIP} not in allowed list`);
    }

    // User Agent validation
    const isPCBrowser: boolean = stamConfig.requiredUserAgent.every(
      (keyword: string) => userAgent.includes(keyword)
    );
    const isBot: boolean = stamConfig.blockedKeywords.some((keyword: string) =>
      userAgent.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!isPCBrowser) {
      failureReasons.push(
        `User agent missing required keywords: ${stamConfig.requiredUserAgent.join(
          ", "
        )}`
      );
    }
    if (isBot) {
      failureReasons.push(`User agent contains blocked keywords`);
    }

    // Headers validation
    const headers: ClientHeaders = event.node.req.headers as ClientHeaders;
    const hasNormalHeaders: boolean = !!(
      headers["accept"] &&
      headers["accept-language"] &&
      headers["accept-encoding"]
    );
    if (!hasNormalHeaders) {
      failureReasons.push("Missing expected browser headers");
    }

    const isValid: boolean =
      isHomeIP && isPCBrowser && !isBot && hasNormalHeaders;

    const result: ValidationResult = {
      isValid,
      clientIP,
      userAgent,
      timestamp,
    };

    if (!isValid) {
      result.failureReasons = failureReasons;
    }

    return result;
  } catch (error: unknown) {
    console.error("Error in detailed PC validation:", error);
    return {
      isValid: false,
      clientIP,
      userAgent,
      timestamp,
      failureReasons: ["Internal validation error"],
    };
  }
}

/**
 * Simple validation with logging
 * @param event - The H3Event object
 * @returns true if valid home PC, false otherwise
 */
export function validateHomePCWithLogging(event: H3Event): boolean {
  const result: ValidationResult = validateHomePCDetailed(event);

  if (result.isValid) {
    console.log(`[PC Validation] ✅ Valid home PC - IP: ${result.clientIP}`);
  } else {
    console.log(
      `[PC Validation] ❌ Invalid request - IP: ${
        result.clientIP
      }, Reasons: ${result.failureReasons?.join(", ")}`
    );
  }

  return result.isValid;
}

/**
 * Configuration type for custom validation rules
 */
export interface CustomStamConfig extends StamConfig {
  allowLocalNetwork?: boolean;
  timeRestriction?: {
    startHour: number;
    endHour: number;
  };
}

/**
 * Validates home PC with custom configuration
 * @param event - The H3Event object
 * @param config - Custom configuration for validation
 * @returns true if valid according to custom rules, false otherwise
 */
export function validateHomePCCustom(
  event: H3Event,
  config: CustomStamConfig
): boolean {
  try {
    const clientIP: string = getClientIP(event);
    const headers: ClientHeaders = event.node.req.headers as ClientHeaders;
    const userAgent: string = headers["user-agent"] || "";

    // IP validation
    let isValidIP: boolean = config.allowedIPs.includes(clientIP);
    if (config.allowLocalNetwork && clientIP.startsWith("192.168.")) {
      isValidIP = true;
    }

    if (!isValidIP) return false;

    // User Agent validation
    const isPCBrowser: boolean = config.requiredUserAgent.every(
      (keyword: string) => userAgent.includes(keyword)
    );
    const isBot: boolean = config.blockedKeywords.some((keyword: string) =>
      userAgent.toLowerCase().includes(keyword.toLowerCase())
    );

    if (!isPCBrowser || isBot) return false;

    // Time restriction (optional)
    if (config.timeRestriction) {
      const currentHour: number = new Date().getHours();
      const { startHour, endHour } = config.timeRestriction;
      if (currentHour < startHour || currentHour > endHour) {
        return false;
      }
    }

    return true;
  } catch (error: unknown) {
    console.error("Error in custom PC validation:", error);
    return false;
  }
}
