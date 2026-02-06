"use strict";
/**
 * CLI command implementations for billclaw
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
exports.setupWizard = setupWizard;
exports.syncCommand = syncCommand;
exports.statusCommand = statusCommand;
exports.configCommand = configCommand;
var plaid_sync_js_1 = require("../tools/plaid-sync.js");
var transaction_storage_js_1 = require("../storage/transaction-storage.js");
/**
 * Create a mock context for CLI operations
 */
function createMockContext() {
    var _this = this;
    return {
        logger: {
            info: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return console.log.apply(console, args);
            },
            error: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return console.error.apply(console, args);
            },
            warn: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return console.warn.apply(console, args);
            },
        },
        config: {
            get: function (key) {
                // In real usage, OpenClaw provides the config
                // For now, return empty config
                return {};
            },
            set: function (key, value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // In real usage, OpenClaw handles persistence
                    console.log("Config updated: ".concat(key));
                    return [2 /*return*/];
                });
            }); },
        },
    };
}
/**
 * Interactive setup wizard for connecting bank accounts
 */
function setupWizard() {
    return __awaiter(this, void 0, void 0, function () {
        var context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🦀 billclaw Setup Wizard");
                    console.log("This will guide you through connecting your bank accounts.\n");
                    context = createMockContext();
                    // Initialize storage
                    return [4 /*yield*/, (0, transaction_storage_js_1.initializeStorage)()];
                case 1:
                    // Initialize storage
                    _a.sent();
                    // Step 1: Select data source
                    console.log("Step 1: Select your data source");
                    console.log("  1. Plaid (US/Canada)");
                    console.log("  2. GoCardless (Europe) - Coming soon");
                    console.log("  3. Gmail Bills - Coming soon\n");
                    // In real implementation, this would be interactive
                    // For now, show instructions for Plaid setup
                    console.log("⚠️  Plaid Setup Instructions:");
                    console.log("\n1. Get your Plaid API credentials:");
                    console.log("   - Go to https://dashboard.plaid.com");
                    console.log("   - Create an account or sign in");
                    console.log("   - Go to API Keys and note your Client ID and Secret");
                    console.log("\n2. Set environment variables:");
                    console.log("   export PLAID_CLIENT_ID='your_client_id'");
                    console.log("   export PLAID_SECRET='your_secret'");
                    console.log("\n3. Run: openclaw bills sync");
                    console.log("\n4. For OAuth flow (coming soon):");
                    console.log("   Run: openclaw bills setup --interactive");
                    console.log("\n💡 Your transactions will be stored in: ~/.openclaw/billclaw/");
                    console.log("💡 Data sovereignty: Access tokens are stored locally, never on our servers.");
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Manually trigger sync for all or specific account
 */
function syncCommand(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var context, result, _i, _a, error, error_1, errorMsg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("\uD83D\uDD04 Syncing".concat(accountId ? " account ".concat(accountId) : " all accounts", "..."));
                    context = createMockContext();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, plaid_sync_js_1.plaidSyncTool)(context, {
                            accountId: accountId,
                        })];
                case 2:
                    result = _b.sent();
                    if (result.success) {
                        console.log("\u2705 Sync completed:");
                        console.log("   Accounts synced: ".concat(accountId || "all"));
                        console.log("   Transactions added: ".concat(result.transactionsAdded));
                        console.log("   Transactions updated: ".concat(result.transactionsUpdated));
                        if (result.cursor) {
                            console.log("   Cursor: ".concat(result.cursor.substring(0, 16), "..."));
                        }
                    }
                    else {
                        console.log("\u274C Sync failed:");
                        if (result.errors) {
                            for (_i = 0, _a = result.errors; _i < _a.length; _i++) {
                                error = _a[_i];
                                console.log("   - ".concat(error));
                            }
                        }
                    }
                    return [2 /*return*/, {
                            success: result.success,
                            accounts: accountId ? 1 : -1, // TODO: Get actual count
                            transactions: result.transactionsAdded + result.transactionsUpdated,
                            errors: result.errors || [],
                        }];
                case 3:
                    error_1 = _b.sent();
                    errorMsg = error_1 instanceof Error ? error_1.message : "Unknown error";
                    console.log("\u274C Sync error: ".concat(errorMsg));
                    return [2 /*return*/, {
                            success: false,
                            accounts: 0,
                            transactions: 0,
                            errors: [errorMsg],
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Show connection status and recent sync results
 */
function statusCommand() {
    return __awaiter(this, void 0, void 0, function () {
        var context, accounts, _i, accounts_1, account, syncStates, lastSync, lastSyncTime, status_1, statusEmoji, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("📊 billclaw Status\n");
                    context = createMockContext();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, (0, transaction_storage_js_1.readAccountRegistry)()];
                case 2:
                    accounts = _a.sent();
                    if (accounts.length === 0) {
                        console.log("No accounts configured yet.");
                        console.log("\nRun 'openclaw bills setup' to get started.");
                        return [2 /*return*/];
                    }
                    console.log("Configured Accounts: ".concat(accounts.length, "\n"));
                    _i = 0, accounts_1 = accounts;
                    _a.label = 3;
                case 3:
                    if (!(_i < accounts_1.length)) return [3 /*break*/, 6];
                    account = accounts_1[_i];
                    return [4 /*yield*/, (0, transaction_storage_js_1.readSyncStates)(account.id)];
                case 4:
                    syncStates = _a.sent();
                    lastSync = syncStates.find(function (s) { return s.status === "completed"; });
                    lastSyncTime = (lastSync === null || lastSync === void 0 ? void 0 : lastSync.completedAt)
                        ? new Date(lastSync.completedAt).toLocaleString()
                        : "Never";
                    status_1 = (lastSync === null || lastSync === void 0 ? void 0 : lastSync.status) || "pending";
                    statusEmoji = status_1 === "completed" ? "✅" : status_1 === "failed" ? "❌" : "⏳";
                    console.log("  ".concat(statusEmoji, " ").concat(account.name, " (").concat(account.type, ") - Last sync: ").concat(lastSyncTime));
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log("\n💡 Run 'openclaw bills sync' to sync all accounts.");
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    console.log("❌ Failed to read status:", error_2);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Manage configuration
 */
function configCommand(args) {
    return __awaiter(this, void 0, void 0, function () {
        var context, value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context = createMockContext();
                    if (!(args.key && args.value)) return [3 /*break*/, 2];
                    console.log("Setting ".concat(args.key, " = ").concat(args.value));
                    // In real implementation, this would update the config
                    return [4 /*yield*/, context.config.set("billclaw.".concat(args.key), args.value)];
                case 1:
                    // In real implementation, this would update the config
                    _a.sent();
                    console.log("\u2705 Configuration updated");
                    return [3 /*break*/, 3];
                case 2:
                    if (args.key) {
                        console.log("Getting ".concat(args.key, ":"));
                        value = context.config.get("billclaw.".concat(args.key));
                        console.log(JSON.stringify(value, null, 2));
                    }
                    else {
                        console.log("💡 billclaw Configuration Management\n");
                        console.log("View all config:");
                        console.log("  openclaw bills config\n");
                        console.log("Set a value:");
                        console.log("  openclaw bills config set plaid.clientId YOUR_CLIENT_ID");
                        console.log("  openclaw bills config set plaid.secret YOUR_SECRET");
                        console.log("  openclaw bills config set plaid.environment sandbox\n");
                        console.log("Available config paths:");
                        console.log("  plaid.clientId     - Plaid Client ID");
                        console.log("  plaid.secret       - Plaid Secret");
                        console.log("  plaid.environment  - sandbox|development|production");
                        console.log("  storage.path       - Local storage path (default: ~/.openclaw/billclaw)");
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
