"use strict";
/**
 * Plaid sync tool - syncs transactions from Plaid-connected accounts
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
exports.plaidSyncTool = plaidSyncTool;
var plaid_1 = require("plaid");
var transaction_storage_js_1 = require("../storage/transaction-storage.js");
/**
 * Get Plaid client configuration
 */
function getPlaidConfig(context) {
    var config = context.config.get("billclaw");
    var plaidConfig = (config === null || config === void 0 ? void 0 : config.plaid) || {};
    var clientId = plaidConfig.clientId || process.env.PLAID_CLIENT_ID;
    var secret = plaidConfig.secret || process.env.PLAID_SECRET;
    var environment = plaidConfig.environment || "sandbox";
    if (!clientId || !secret) {
        throw new Error("Plaid credentials not configured. Set PLAID_CLIENT_ID and PLAID_SECRET environment variables.");
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
 * Create Plaid API client
 */
function createPlaidClient(context) {
    var _a = getPlaidConfig(context), clientId = _a.clientId, secret = _a.secret, environment = _a.environment;
    var configuration = new plaid_1.Configuration({
        basePath: plaid_1.PlaidEnvironments[environment],
        baseOptions: {
            headers: {
                "PLAID-CLIENT-ID": clientId,
                "PLAID-SECRET": secret,
            },
        },
    });
    return new plaid_1.PlaidApi(configuration);
}
/**
 * Convert Plaid transaction to internal format
 */
function convertTransaction(plaidTxn, accountId) {
    return {
        transactionId: "".concat(accountId, "_").concat(plaidTxn.transaction_id),
        accountId: accountId,
        date: plaidTxn.date,
        amount: Math.round(plaidTxn.amount * 100), // Convert to cents
        currency: plaidTxn.iso_currency_code,
        category: plaidTxn.category || [],
        merchantName: plaidTxn.merchant_name || plaidTxn.name || "Unknown",
        paymentChannel: plaidTxn.payment_channel,
        pending: plaidTxn.pending,
        plaidTransactionId: plaidTxn.transaction_id,
        createdAt: new Date().toISOString(),
    };
}
/**
 * Sync transactions from a single Plaid account
 */
function syncAccount(context, account, storageConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, transactionsAdded, transactionsUpdated, cursor, syncId, syncState, previousSyncs, lastSync, lastCursor, plaidClient, request, response, removed, added, transactions, deduplicated, byMonth, _i, deduplicated_1, txn, date, key, _a, _b, _c, monthKey, monthTransactions, _d, year, month, result, error_1, errorMsg;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    errors = [];
                    transactionsAdded = 0;
                    transactionsUpdated = 0;
                    cursor = "";
                    syncId = "sync_".concat(Date.now());
                    syncState = {
                        syncId: syncId,
                        accountId: account.id,
                        startedAt: new Date().toISOString(),
                        status: "running",
                        transactionsAdded: 0,
                        transactionsUpdated: 0,
                        cursor: "",
                    };
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 8, 9, 11]);
                    return [4 /*yield*/, (0, transaction_storage_js_1.readSyncStates)(account.id, storageConfig)];
                case 2:
                    previousSyncs = _e.sent();
                    lastSync = previousSyncs.find(function (s) { return s.status === "completed"; });
                    lastCursor = (lastSync === null || lastSync === void 0 ? void 0 : lastSync.cursor) || undefined;
                    plaidClient = createPlaidClient(context);
                    request = {
                        access_token: account.plaidAccessToken || "",
                        cursor: lastCursor,
                        count: 500,
                    };
                    return [4 /*yield*/, plaidClient.transactionsSync(request)];
                case 3:
                    response = _e.sent();
                    cursor = response.next_cursor || "";
                    removed = response.removed || [];
                    added = response.added || [];
                    context.logger.info("Plaid sync for ".concat(account.id, ": ").concat(added.length, " added, ").concat(removed.length, " removed"));
                    transactions = added.map(function (txn) {
                        return convertTransaction(txn, account.id);
                    });
                    deduplicated = (0, transaction_storage_js_1.deduplicateTransactions)(transactions, 24);
                    byMonth = new Map();
                    for (_i = 0, deduplicated_1 = deduplicated; _i < deduplicated_1.length; _i++) {
                        txn = deduplicated_1[_i];
                        date = new Date(txn.date);
                        key = "".concat(date.getFullYear(), "-").concat(date.getMonth());
                        if (!byMonth.has(key)) {
                            byMonth.set(key, []);
                        }
                        byMonth.get(key).push(txn);
                    }
                    _a = 0, _b = byMonth.entries();
                    _e.label = 4;
                case 4:
                    if (!(_a < _b.length)) return [3 /*break*/, 7];
                    _c = _b[_a], monthKey = _c[0], monthTransactions = _c[1];
                    _d = monthKey.split("-").map(Number), year = _d[0], month = _d[1];
                    return [4 /*yield*/, (0, transaction_storage_js_1.appendTransactions)(account.id, year, month, monthTransactions, storageConfig)];
                case 5:
                    result = _e.sent();
                    transactionsAdded += result.added;
                    transactionsUpdated += result.updated;
                    _e.label = 6;
                case 6:
                    _a++;
                    return [3 /*break*/, 4];
                case 7:
                    // Update sync state
                    syncState.status = "completed";
                    syncState.completedAt = new Date().toISOString();
                    syncState.transactionsAdded = transactionsAdded;
                    syncState.transactionsUpdated = transactionsUpdated;
                    syncState.cursor = cursor;
                    context.logger.info("Sync completed for ".concat(account.id, ": ").concat(transactionsAdded, " added, ").concat(transactionsUpdated, " updated"));
                    return [3 /*break*/, 11];
                case 8:
                    error_1 = _e.sent();
                    errorMsg = error_1 instanceof Error ? error_1.message : "Unknown error";
                    errors.push(errorMsg);
                    syncState.status = "failed";
                    syncState.error = errorMsg;
                    context.logger.error("Sync failed for ".concat(account.id, ":"), error_1);
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, (0, transaction_storage_js_1.writeSyncState)(syncState, storageConfig)];
                case 10:
                    _e.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/, {
                        success: errors.length === 0,
                        accountId: account.id,
                        transactionsAdded: transactionsAdded,
                        transactionsUpdated: transactionsUpdated,
                        cursor: cursor,
                        errors: errors.length > 0 ? errors : undefined,
                    }];
            }
        });
    });
}
/**
 * Sync transactions from Plaid for a specific account or all accounts
 */
function plaidSyncTool(context, params) {
    return __awaiter(this, void 0, void 0, function () {
        var config, accounts, storageConfig, plaidAccounts, accountsToSync, totalAdded, totalUpdated, lastCursor, allErrors, _i, accountsToSync_1, account, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = context.config.get("billclaw");
                    accounts = (config === null || config === void 0 ? void 0 : config.accounts) || [];
                    storageConfig = (config === null || config === void 0 ? void 0 : config.storage) || {};
                    plaidAccounts = accounts.filter(function (acc) { return acc.type === AccountType.Plaid && acc.enabled && acc.plaidAccessToken; });
                    if (plaidAccounts.length === 0) {
                        return [2 /*return*/, {
                                success: false,
                                accountId: params.accountId || "all",
                                transactionsAdded: 0,
                                transactionsUpdated: 0,
                                cursor: "",
                                errors: ["No enabled Plaid accounts found"],
                            }];
                    }
                    accountsToSync = params.accountId
                        ? plaidAccounts.filter(function (acc) { return acc.id === params.accountId; })
                        : plaidAccounts;
                    if (accountsToSync.length === 0) {
                        return [2 /*return*/, {
                                success: false,
                                accountId: params.accountId || "all",
                                transactionsAdded: 0,
                                transactionsUpdated: 0,
                                cursor: "",
                                errors: params.accountId
                                    ? ["Account ".concat(params.accountId, " not found or not enabled")]
                                    : ["No enabled Plaid accounts found"],
                            }];
                    }
                    totalAdded = 0;
                    totalUpdated = 0;
                    lastCursor = "";
                    allErrors = [];
                    _i = 0, accountsToSync_1 = accountsToSync;
                    _a.label = 1;
                case 1:
                    if (!(_i < accountsToSync_1.length)) return [3 /*break*/, 4];
                    account = accountsToSync_1[_i];
                    return [4 /*yield*/, syncAccount(context, account, storageConfig)];
                case 2:
                    result = _a.sent();
                    if (!result.success && result.errors) {
                        allErrors.push.apply(allErrors, result.errors);
                    }
                    totalAdded += result.transactionsAdded;
                    totalUpdated += result.transactionsUpdated;
                    if (result.cursor) {
                        lastCursor = result.cursor;
                    }
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: 
                // Update global cursor
                return [4 /*yield*/, (0, transaction_storage_js_1.writeGlobalCursor)({ lastSyncTime: new Date().toISOString() }, storageConfig)];
                case 5:
                    // Update global cursor
                    _a.sent();
                    return [2 /*return*/, {
                            success: allErrors.length === 0,
                            accountId: params.accountId || "all",
                            transactionsAdded: totalAdded,
                            transactionsUpdated: totalUpdated,
                            cursor: lastCursor,
                            errors: allErrors.length > 0 ? allErrors : undefined,
                        }];
            }
        });
    });
}
