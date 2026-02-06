"use strict";
/**
 * Plaid OAuth handler - implements Plaid Link flow
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
exports.createLinkToken = createLinkToken;
exports.exchangePublicToken = exchangePublicToken;
exports.plaidOAuth = plaidOAuth;
var plaid_1 = require("plaid");
/**
 * Get Plaid configuration from OpenClaw config
 */
function getPlaidConfig(context) {
    var config = context.config.get("billclaw");
    var plaidConfig = (config === null || config === void 0 ? void 0 : config.plaid) || {};
    var clientId = plaidConfig.clientId || process.env.PLAID_CLIENT_ID;
    var secret = plaidConfig.secret || process.env.PLAID_SECRET;
    var environment = plaidConfig.environment || "sandbox";
    if (!clientId || !secret) {
        throw new Error("Plaid credentials not configured. Set PLAID_CLIENT_ID and PLAID_SECRET environment variables, or configure them in billclaw settings.");
    }
    var plaidEnvMap = {
        sandbox: plaid_1.PlaidEnvironments.sandbox,
        development: plaid_1.PlaidEnvironments.development,
        production: plaid_1.PlaidEnvironments.production,
    };
    return {
        clientId: clientId,
        secret: secret,
        environment: plaidEnvMap[environment] || plaid_1.PlaidEnvironments.sandbox,
    };
}
/**
 * Create Plaid Link token for initializing Link frontend
 */
function createLinkToken(context, accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, clientId, secret, environment, configuration, plaidClient, request, response, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = getPlaidConfig(context), clientId = _a.clientId, secret = _a.secret, environment = _a.environment;
                    configuration = new plaid_1.Configuration({
                        basePath: plaid_1.PlaidEnvironments[environment],
                        baseOptions: {
                            headers: {
                                "PLAID-CLIENT-ID": clientId,
                                "PLAID-SECRET": secret,
                            },
                        },
                    });
                    plaidClient = new plaid_1.PlaidApi(configuration);
                    request = {
                        user: {
                            client_user_id: accountId || "user_" + Date.now(),
                        },
                        client_name: "billclaw",
                        products: ["transactions"],
                        country_codes: ["US"],
                        language: "en",
                    };
                    return [4 /*yield*/, plaidClient.linkTokenCreate(request)];
                case 1:
                    response = _b.sent();
                    context.logger.info("Plaid Link token created successfully");
                    return [2 /*return*/, {
                            success: true,
                            linkToken: response.link_token,
                        }];
                case 2:
                    error_1 = _b.sent();
                    context.logger.error("Failed to create Plaid Link token:", error_1);
                    return [2 /*return*/, {
                            success: false,
                            error: error_1 instanceof Error ? error_1.message : "Unknown error",
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Exchange Plaid public token for access token
 */
function exchangePublicToken(context, publicToken) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, clientId, secret, environment, configuration, plaidClient, request, response, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = getPlaidConfig(context), clientId = _a.clientId, secret = _a.secret, environment = _a.environment;
                    configuration = new plaid_1.Configuration({
                        basePath: plaid_1.PlaidEnvironments[environment],
                        baseOptions: {
                            headers: {
                                "PLAID-CLIENT-ID": clientId,
                                "PLAID-SECRET": secret,
                            },
                        },
                    });
                    plaidClient = new plaid_1.PlaidApi(configuration);
                    request = {
                        public_token: publicToken,
                    };
                    return [4 /*yield*/, plaidClient.itemPublicTokenExchange(request)];
                case 1:
                    response = _b.sent();
                    context.logger.info("Plaid public token exchanged successfully");
                    return [2 /*return*/, {
                            accessToken: response.access_token,
                            itemId: response.item_id,
                        }];
                case 2:
                    error_2 = _b.sent();
                    context.logger.error("Failed to exchange Plaid public token:", error_2);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle Plaid Link OAuth flow
 *
 * This integrates Plaid Link (https://plaid.com/docs/link/)
 * for secure bank account connection.
 *
 * Flow:
 * 1. Create Link token
 * 2. Serve Plaid Link frontend (or provide token for external UI)
 * 3. Handle Link success callback (receives public_token)
 * 4. Exchange public_token for access_token
 * 5. Return itemId and accessToken for storage
 */
function plaidOAuth(context, publicToken) {
    return __awaiter(this, void 0, void 0, function () {
        var result, exchangeResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!publicToken) return [3 /*break*/, 2];
                    return [4 /*yield*/, createLinkToken(context)];
                case 1:
                    result = _a.sent();
                    if (!result.success || !result.linkToken) {
                        return [2 /*return*/, {
                                success: false,
                                error: result.error || "Failed to create Link token",
                            }];
                    }
                    // Return the Link token - caller will use it to render Plaid Link
                    return [2 /*return*/, {
                            success: true,
                        }];
                case 2: return [4 /*yield*/, exchangePublicToken(context, publicToken)];
                case 3:
                    exchangeResult = _a.sent();
                    if (!exchangeResult) {
                        return [2 /*return*/, {
                                success: false,
                                error: "Failed to exchange public token for access token",
                            }];
                    }
                    return [2 /*return*/, {
                            success: true,
                            itemId: exchangeResult.itemId,
                            accessToken: exchangeResult.accessToken,
                        }];
            }
        });
    });
}
