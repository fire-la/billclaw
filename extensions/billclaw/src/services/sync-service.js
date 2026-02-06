"use strict";
/**
 * Background sync service - runs scheduled transaction synchronization
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
exports.syncService = syncService;
var plaid_sync_js_1 = require("../tools/plaid-sync.js");
/**
 * Calculate next sync time based on sync frequency
 */
function calculateNextSync(frequency, lastSync) {
    var now = new Date();
    var base = lastSync || now;
    switch (frequency) {
        case SyncFrequency.Realtime:
            // Webhook-based, no scheduled sync
            return new Date(0);
        case SyncFrequency.Hourly:
            return new Date(base.getTime() + 60 * 60 * 1000);
        case SyncFrequency.Daily:
            // Next day at same time
            var nextDay = new Date(base);
            nextDay.setDate(nextDay.getDate() + 1);
            return nextDay;
        case SyncFrequency.Weekly:
            // Next week on same day
            var nextWeek = new Date(base);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return nextWeek;
        case SyncFrequency.Manual:
            // No scheduled sync
            return new Date(0);
        default:
            return new Date(base.getTime() + 24 * 60 * 60 * 1000);
    }
}
/**
 * Check if an account is due for sync
 */
function isDueForSync(account) {
    if (!account.enabled || !account.lastSync) {
        return true;
    }
    var lastSync = new Date(account.lastSync);
    var nextSync = calculateNextSync(account.syncFrequency, lastSync);
    // Manual accounts never sync automatically
    if (account.syncFrequency === SyncFrequency.Manual) {
        return false;
    }
    // Realtime accounts sync via webhook, not scheduled
    if (account.syncFrequency === SyncFrequency.Realtime) {
        return false;
    }
    return new Date() >= nextSync;
}
/**
 * Trigger sync for a single account
 */
function syncAccount(accountId, context) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, plaid_sync_js_1.plaidSyncTool)(context, {
                            accountId: accountId,
                        })];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        context.logger.info("Sync completed for ".concat(accountId, ": ").concat(result.transactionsAdded, " added, ").concat(result.transactionsUpdated, " updated"));
                    }
                    else {
                        context.logger.error("Sync failed for ".concat(accountId, ":"), result.errors || []);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    context.logger.error("Error syncing ".concat(accountId, ":"), error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Background service for automatic transaction synchronization
 *
 * This service runs periodically (based on account sync frequency settings)
 * and syncs transactions from all enabled accounts.
 */
function syncService(context) {
    return __awaiter(this, void 0, void 0, function () {
        var config, accounts, plaidAccounts, syncedCount, _i, plaidAccounts_1, account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    context.logger.info("billclaw sync service started");
                    config = context.config.get("billclaw");
                    accounts = (config === null || config === void 0 ? void 0 : config.accounts) || [];
                    plaidAccounts = accounts.filter(function (acc) { return acc.type === AccountType.Plaid && acc.enabled; });
                    if (plaidAccounts.length === 0) {
                        context.logger.info("No enabled Plaid accounts to sync");
                        return [2 /*return*/];
                    }
                    context.logger.info("Found ".concat(plaidAccounts.length, " Plaid accounts to check"));
                    syncedCount = 0;
                    _i = 0, plaidAccounts_1 = plaidAccounts;
                    _a.label = 1;
                case 1:
                    if (!(_i < plaidAccounts_1.length)) return [3 /*break*/, 5];
                    account = plaidAccounts_1[_i];
                    if (!isDueForSync(account)) return [3 /*break*/, 3];
                    context.logger.info("Syncing account: ".concat(account.name, " (").concat(account.id, ")"));
                    return [4 /*yield*/, syncAccount(account.id, context)];
                case 2:
                    _a.sent();
                    syncedCount++;
                    return [3 /*break*/, 4];
                case 3:
                    context.logger.info("Skipping ".concat(account.name, " (").concat(account.id, "): not due for sync"));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    context.logger.info("Sync service completed: ".concat(syncedCount, " accounts synced"));
                    return [2 /*return*/];
            }
        });
    });
}
