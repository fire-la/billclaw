"use strict";
/**
 * billclaw - Bank transaction and bill data import for OpenClaw
 *
 * Data sovereignty for your financial data.
 * Hold your own Plaid/bank access tokens locally.
 *
 * @author fire-zu
 * @license MIT
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
exports.billclawPlugin = void 0;
exports.billclawPlugin = {
    name: "@fire-zu/billclaw",
    version: "0.0.1",
    // Register CLI commands
    registerCLI: function (cli) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                cli.registerCommand({
                    name: "bills",
                    description: "Manage bank account connections and transaction imports",
                    subcommands: {
                        setup: {
                            description: "Interactive setup wizard for connecting bank accounts",
                            handler: function () { return __awaiter(_this, void 0, void 0, function () {
                                var setupWizard;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/cli/commands.js"); })];
                                        case 1:
                                            setupWizard = (_a.sent()).setupWizard;
                                            return [2 /*return*/, setupWizard()];
                                    }
                                });
                            }); },
                        },
                        sync: {
                            description: "Manually trigger transaction sync for all connected accounts",
                            handler: function (args) { return __awaiter(_this, void 0, void 0, function () {
                                var syncCommand;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/cli/commands.js"); })];
                                        case 1:
                                            syncCommand = (_a.sent()).syncCommand;
                                            return [2 /*return*/, syncCommand(args.accountId)];
                                    }
                                });
                            }); },
                        },
                        status: {
                            description: "Show connection status and recent sync results",
                            handler: function () { return __awaiter(_this, void 0, void 0, function () {
                                var statusCommand;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/cli/commands.js"); })];
                                        case 1:
                                            statusCommand = (_a.sent()).statusCommand;
                                            return [2 /*return*/, statusCommand()];
                                    }
                                });
                            }); },
                        },
                        config: {
                            description: "Manage plugin configuration",
                            handler: function (args) { return __awaiter(_this, void 0, void 0, function () {
                                var configCommand;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/cli/commands.js"); })];
                                        case 1:
                                            configCommand = (_a.sent()).configCommand;
                                            return [2 /*return*/, configCommand(args)];
                                    }
                                });
                            }); },
                        },
                    },
                });
                return [2 /*return*/];
            });
        });
    },
    // Register Agent tools
    registerTools: function (tools) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                tools.register({
                    name: "plaid_sync",
                    description: "Sync transactions from Plaid-connected bank accounts",
                    parameters: {
                        type: "object",
                        properties: {
                            accountId: {
                                type: "string",
                                description: "Optional: specific account ID to sync (omits to sync all)",
                            },
                        },
                    },
                    handler: function (params) { return __awaiter(_this, void 0, void 0, function () {
                        var plaidSyncTool;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/tools/plaid-sync.js"); })];
                                case 1:
                                    plaidSyncTool = (_a.sent()).plaidSyncTool;
                                    return [2 /*return*/, plaidSyncTool(params)];
                            }
                        });
                    }); },
                });
                tools.register({
                    name: "gmail_fetch_bills",
                    description: "Fetch and parse bills from Gmail",
                    parameters: {
                        type: "object",
                        properties: {
                            days: {
                                type: "number",
                                description: "Number of days to look back (default: 30)",
                            },
                        },
                    },
                    handler: function (params) { return __awaiter(_this, void 0, void 0, function () {
                        var gmailFetchTool;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/tools/gmail-fetch.js"); })];
                                case 1:
                                    gmailFetchTool = (_a.sent()).gmailFetchTool;
                                    return [2 /*return*/, gmailFetchTool(params)];
                            }
                        });
                    }); },
                });
                tools.register({
                    name: "bill_parse",
                    description: "Parse bill data from various formats (PDF, CSV, email)",
                    parameters: {
                        type: "object",
                        properties: {
                            source: {
                                type: "string",
                                description: "Source type: plaid, gmail, file, or email",
                            },
                            data: {
                                type: "string",
                                description: "Raw data or file path to parse",
                            },
                        },
                        required: ["source", "data"],
                    },
                    handler: function (params) { return __awaiter(_this, void 0, void 0, function () {
                        var billParseTool;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/tools/bill-parse.js"); })];
                                case 1:
                                    billParseTool = (_a.sent()).billParseTool;
                                    return [2 /*return*/, billParseTool(params)];
                            }
                        });
                    }); },
                });
                return [2 /*return*/];
            });
        });
    },
    // Register OAuth providers
    registerOAuth: function (oauth) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                oauth.register({
                    name: "plaid",
                    description: "Plaid Link OAuth flow for connecting bank accounts",
                    handler: function (context) { return __awaiter(_this, void 0, void 0, function () {
                        var plaidOAuth;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/oauth/plaid.js"); })];
                                case 1:
                                    plaidOAuth = (_a.sent()).plaidOAuth;
                                    return [2 /*return*/, plaidOAuth(context)];
                            }
                        });
                    }); },
                });
                return [2 /*return*/];
            });
        });
    },
    // Register background services
    registerServices: function (services) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                services.register({
                    name: "sync-service",
                    description: "Background service for automatic transaction synchronization",
                    handler: function (context) { return __awaiter(_this, void 0, void 0, function () {
                        var syncService;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/services/sync-service.js"); })];
                                case 1:
                                    syncService = (_a.sent()).syncService;
                                    return [2 /*return*/, syncService(context)];
                            }
                        });
                    }); },
                });
                services.register({
                    name: "webhook-handler",
                    description: "HTTP endpoint for handling Plaid and Gmail webhooks",
                    handler: function (context) { return __awaiter(_this, void 0, void 0, function () {
                        var webhookHandler;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require("./src/services/webhook-handler.js"); })];
                                case 1:
                                    webhookHandler = (_a.sent()).webhookHandler;
                                    return [2 /*return*/, webhookHandler(context)];
                            }
                        });
                    }); },
                    routes: [
                        { path: "/webhook/plaid", method: "POST" },
                        { path: "/webhook/gmail", method: "POST" },
                    ],
                });
                return [2 /*return*/];
            });
        });
    },
};
exports.default = exports.billclawPlugin;
