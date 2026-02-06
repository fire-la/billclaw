"use strict";
/**
 * Webhook handler - handles incoming webhooks from Plaid and Gmail
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookHandler = webhookHandler;
/**
 * HTTP endpoint for handling Plaid and Gmail webhooks
 *
 * Verifies signatures and processes webhook events
 */
function webhookHandler(context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            context.logger.info("billclaw webhook handler registered");
            // Register HTTP routes for webhook endpoints
            context.http.register({
                path: "/webhook/plaid",
                method: "POST",
                handler: handlePlaidWebhook,
            });
            context.http.register({
                path: "/webhook/gmail",
                method: "POST",
                handler: handleGmailWebhook,
            });
            context.http.register({
                path: "/webhook/test",
                method: "POST",
                handler: handleTestWebhook,
            });
            return [2 /*return*/];
        });
    });
}
/**
 * Handle Plaid webhooks
 *
 * Plaid webhooks: https://plaid.com/docs/api/webhooks/
 * Events: TRANSACTION, ITEM, BANK_TRANSFER, etc.
 */
function handlePlaidWebhook(request, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // TODO: Implement Plaid webhook handling
                // 1. Verify webhook signature (HMAC-SHA256)
                // 2. Parse webhook type
                // 3. Handle specific event types:
                //    - TRANSACTIONS: Trigger sync for affected item
                //    - ITEM: Handle login errors, removed items
                //    - BANK_TRANSFER: Handle transfer status updates
                // 4. Forward to user-configured webhooks if enabled
                return [2 /*return*/, {
                        status: 200,
                        body: { received: true },
                    }];
            }
            catch (error) {
                context.logger.error("Plaid webhook error:", error);
                return [2 /*return*/, {
                        status: 500,
                        body: { error: "Webhook processing failed" },
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle Gmail push notifications
 *
 * Gmail push notifications via Google Cloud Pub/Sub
 */
function handleGmailWebhook(request, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // TODO: Implement Gmail webhook handling
                // 1. Verify Pub/Sub message authenticity
                // 2. Extract email ID from message
                // 3. Fetch email content
                // 4. Parse for bill/transaction data
                // 5. Store in local files
                // 6. Forward to user-configured webhooks if enabled
                return [2 /*return*/, {
                        status: 200,
                        body: { received: true },
                    }];
            }
            catch (error) {
                context.logger.error("Gmail webhook error:", error);
                return [2 /*return*/, {
                        status: 500,
                        body: { error: "Webhook processing failed" },
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle test webhooks
 *
 * Allows users to test their webhook configuration
 */
function handleTestWebhook(request, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // TODO: Implement test webhook
                // Send a test event to configured webhooks
                // Event type: webhook.test
                return [2 /*return*/, {
                        status: 200,
                        body: { test: "success" },
                    }];
            }
            catch (error) {
                return [2 /*return*/, {
                        status: 500,
                        body: { error: "Test failed" },
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Verify webhook signature
 */
function verifySignature(payload, signature, secret) {
    // TODO: Implement HMAC-SHA256 verification
    // 1. Compute HMAC-SHA256 of payload using secret
    // 2. Compare with provided signature (timing-safe)
    // 3. Check timestamp to prevent replay attacks
    return false;
}
/**
 * Forward event to user-configured webhooks
 */
function forwardToWebhooks(event, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
