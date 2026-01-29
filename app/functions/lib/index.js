"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformPdf = exports.getSignedUploadUrl = void 0;
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
// Export callable functions
var getSignedUploadUrl_1 = require("./storage/getSignedUploadUrl");
Object.defineProperty(exports, "getSignedUploadUrl", { enumerable: true, get: function () { return getSignedUploadUrl_1.getSignedUploadUrl; } });
var transformPdf_1 = require("./transforms/transformPdf");
Object.defineProperty(exports, "transformPdf", { enumerable: true, get: function () { return transformPdf_1.transformPdf; } });
//# sourceMappingURL=index.js.map