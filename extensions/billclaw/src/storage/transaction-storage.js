"use strict";
/**
 * Local file storage utilities for billclaw data
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorageDir = getStorageDir;
exports.initializeStorage = initializeStorage;
exports.readAccountRegistry = readAccountRegistry;
exports.writeAccountRegistry = writeAccountRegistry;
exports.readTransactions = readTransactions;
exports.writeTransactions = writeTransactions;
exports.appendTransactions = appendTransactions;
exports.readSyncStates = readSyncStates;
exports.writeSyncState = writeSyncState;
exports.readGlobalCursor = readGlobalCursor;
exports.writeGlobalCursor = writeGlobalCursor;
exports.deduplicateTransactions = deduplicateTransactions;
var fs = require("node:fs/promises");
var path = require("node:path");
var os = require("node:os");
/**
 * Get the base storage directory
 */
function getStorageDir(config) {
    return __awaiter(this, void 0, void 0, function () {
        var storagePath, expandedPath;
        return __generator(this, function (_a) {
            storagePath = (config === null || config === void 0 ? void 0 : config.path) || "~/.openclaw/billclaw";
            expandedPath = storagePath.replace(/^~/, os.homedir());
            return [2 /*return*/, expandedPath];
        });
    });
}
/**
 * Initialize storage directory structure
 */
function initializeStorage(config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir, directories, _i, directories_1, dir, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getStorageDir(config)];
                case 1:
                    baseDir = _b.sent();
                    directories = [
                        baseDir,
                        path.join(baseDir, "accounts"),
                        path.join(baseDir, "transactions"),
                        path.join(baseDir, "sync"),
                    ];
                    _i = 0, directories_1 = directories;
                    _b.label = 2;
                case 2:
                    if (!(_i < directories_1.length)) return [3 /*break*/, 7];
                    dir = directories_1[_i];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, fs.mkdir(dir, { recursive: true })];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Read account registry
 */
function readAccountRegistry(config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir, filePath, content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getStorageDir(config)];
                case 1:
                    baseDir = _b.sent();
                    filePath = path.join(baseDir, "accounts.json");
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.readFile(filePath, "utf-8")];
                case 3:
                    content = _b.sent();
                    return [2 /*return*/, JSON.parse(content)];
                case 4:
                    _a = _b.sent();
                    // File doesn't exist yet
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Write account registry
 */
function writeAccountRegistry(accounts, config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir, filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getStorageDir(config)];
                case 1:
                    baseDir = _a.sent();
                    filePath = path.join(baseDir, "accounts.json");
                    return [4 /*yield*/, initializeStorage(config)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs.writeFile(filePath, JSON.stringify(accounts, null, 2), "utf-8")];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Read transactions for an account and month
 */
function readTransactions(accountId, year, month, config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir, filePath, content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getStorageDir(config)];
                case 1:
                    baseDir = _b.sent();
                    filePath = path.join(baseDir, "transactions", accountId, "".concat(year), "".concat(month, ".json"));
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.readFile(filePath, "utf-8")];
                case 3:
                    content = _b.sent();
                    return [2 /*return*/, JSON.parse(content)];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Write transactions for an account and month
 * Uses atomic write (temp file + rename) for safety
 */
function writeTransactions(accountId, year, month, transactions, config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir, dirPath, filePath, tempPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getStorageDir(config)];
                case 1:
                    baseDir = _a.sent();
                    dirPath = path.join(baseDir, "transactions", accountId, "".concat(year));
                    filePath = path.join(dirPath, "".concat(month, ".json"));
                    return [4 /*yield*/, fs.mkdir(dirPath, { recursive: true })];
                case 2:
                    _a.sent();
                    tempPath = filePath + ".tmp";
                    return [4 /*yield*/, fs.writeFile(tempPath, JSON.stringify(transactions, null, 2), "utf-8")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, fs.rename(tempPath, filePath)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Append transactions to existing month file (with deduplication)
 */
function appendTransactions(accountId, year, month, newTransactions, config) {
    return __awaiter(this, void 0, void 0, function () {
        var existing, existingIds, added, updated, _loop_1, _i, newTransactions_1, txn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readTransactions(accountId, year, month, config)];
                case 1:
                    existing = _a.sent();
                    existingIds = new Set(existing.map(function (t) { return t.transactionId; }));
                    added = 0;
                    updated = 0;
                    _loop_1 = function (txn) {
                        if (existingIds.has(txn.transactionId)) {
                            // Update existing transaction
                            var index = existing.findIndex(function (t) { return t.transactionId === txn.transactionId; });
                            if (index !== -1) {
                                existing[index] = txn;
                                updated++;
                            }
                        }
                        else {
                            // Add new transaction
                            existing.push(txn);
                            existingIds.add(txn.transactionId);
                            added++;
                        }
                    };
                    for (_i = 0, newTransactions_1 = newTransactions; _i < newTransactions_1.length; _i++) {
                        txn = newTransactions_1[_i];
                        _loop_1(txn);
                    }
                    // Sort by date descending
                    existing.sort(function (a, b) { return b.date.localeCompare(a.date); });
                    return [4 /*yield*/, writeTransactions(accountId, year, month, existing, config)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { added: added, updated: updated }];
            }
        });
    });
}
/**
 * Read sync state for an account
 */
function readSyncStates(accountId, config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir, dirPath, files, states, _i, files_1, file, filePath, content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getStorageDir(config)];
                case 1:
                    baseDir = _b.sent();
                    dirPath = path.join(baseDir, "sync", accountId);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, fs.readdir(dirPath)];
                case 3:
                    files = _b.sent();
                    states = [];
                    _i = 0, files_1 = files;
                    _b.label = 4;
                case 4:
                    if (!(_i < files_1.length)) return [3 /*break*/, 7];
                    file = files_1[_i];
                    if (!file.endsWith(".json"))
                        return [3 /*break*/, 6];
                    filePath = path.join(dirPath, file);
                    return [4 /*yield*/, fs.readFile(filePath, "utf-8")];
                case 5:
                    content = _b.sent();
                    states.push(JSON.parse(content));
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, states.sort(function (a, b) { return b.startedAt.localeCompare(a.startedAt); })];
                case 8:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Write sync state
 */
function writeSyncState(state, config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir, dirPath, filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getStorageDir(config)];
                case 1:
                    baseDir = _a.sent();
                    dirPath = path.join(baseDir, "sync", state.accountId);
                    filePath = path.join(dirPath, "".concat(state.syncId, ".json"));
                    return [4 /*yield*/, fs.mkdir(dirPath, { recursive: true })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs.writeFile(filePath, JSON.stringify(state, null, 2), "utf-8")];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Read global cursor
 */
function readGlobalCursor(config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir, filePath, content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getStorageDir(config)];
                case 1:
                    baseDir = _b.sent();
                    filePath = path.join(baseDir, "cursor.json");
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.readFile(filePath, "utf-8")];
                case 3:
                    content = _b.sent();
                    return [2 /*return*/, JSON.parse(content)];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Write global cursor
 */
function writeGlobalCursor(cursor, config) {
    return __awaiter(this, void 0, void 0, function () {
        var baseDir, filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getStorageDir(config)];
                case 1:
                    baseDir = _a.sent();
                    filePath = path.join(baseDir, "cursor.json");
                    return [4 /*yield*/, initializeStorage(config)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs.writeFile(filePath, JSON.stringify(cursor, null, 2), "utf-8")];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Deduplicate transactions within a time window (24 hours)
 */
function deduplicateTransactions(transactions, windowHours) {
    if (windowHours === void 0) { windowHours = 24; }
    var seen = new Set();
    var windowStart = Date.now() - windowHours * 60 * 60 * 1000;
    var result = [];
    // Sort by date ascending
    var sorted = __spreadArray([], transactions, true).sort(function (a, b) { return a.date.localeCompare(b.date); });
    for (var _i = 0, sorted_1 = sorted; _i < sorted_1.length; _i++) {
        var txn = sorted_1[_i];
        var key = "".concat(txn.accountId, "_").concat(txn.plaidTransactionId);
        var txnDate = new Date(txn.date).getTime();
        // Only include if not seen, or outside deduplication window
        if (!seen.has(key) || txnDate > windowStart) {
            seen.add(key);
            result.push(txn);
        }
    }
    return result;
}
