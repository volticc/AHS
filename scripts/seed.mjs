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
import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
dotenv.config({ path: './.env.local' });
var allPermissionsData = [
    { name: 'edit_games', description: 'Can edit existing game entries' },
    { name: 'delete_games', description: 'Can delete game entries' },
    { name: 'create_games', description: 'Can create new game entries' },
    { name: 'edit_dev_logs', description: 'Can edit dev logs' },
    { name: 'delete_dev_logs', description: 'Can delete dev logs' },
    { name: 'manage_users', description: 'Can create, edit, and delete users' },
    { name: 'manage_tickets', description: 'Can view and respond to all tickets' },
    { name: 'change_ticket_status', description: 'Can change the status of tickets' },
    { name: 'assign_tickets', description: 'Can assign tickets to other admins' },
    { name: 'modify_website_content', description: 'Can edit public-facing website content' },
    { name: 'access_analytics', description: 'Can view site analytics' },
    { name: 'change_site_settings', description: 'Can change global site settings' },
    { name: 'modify_roles', description: 'Can create, edit, and delete roles and their permissions' },
    { name: 'enable_maintenance_mode', description: 'Can toggle site maintenance mode' },
];
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var uri, client, db, permissionsCollection, permissionInsertResult, seededPermissions_1, getPermissionIds, rolesCollection, roles, seededRoles, usersCollection, ownerEmail, ownerRole, ownerPassword, hashedPassword, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    uri = process.env.MONGODB_URI;
                    if (!uri) {
                        throw new Error('MONGODB_URI not found in .env.local');
                    }
                    client = new MongoClient(uri);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, 13, 15]);
                    return [4 /*yield*/, client.connect()];
                case 2:
                    _a.sent();
                    console.log('Connected to database for seeding...');
                    db = client.db();
                    // 1. Seed Permissions
                    console.log('Seeding permissions...');
                    permissionsCollection = db.collection('permissions');
                    return [4 /*yield*/, permissionsCollection.deleteMany({})];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, permissionsCollection.insertMany(allPermissionsData)];
                case 4:
                    permissionInsertResult = _a.sent();
                    console.log("Seeded ".concat(permissionInsertResult.insertedCount, " permissions."));
                    return [4 /*yield*/, permissionsCollection.find().toArray()];
                case 5:
                    seededPermissions_1 = _a.sent();
                    getPermissionIds = function (names) {
                        return seededPermissions_1
                            .filter(function (p) { return names.includes(p.name); })
                            .map(function (p) { return p._id; });
                    };
                    // 2. Seed Roles
                    console.log('Seeding roles...');
                    rolesCollection = db.collection('roles');
                    return [4 /*yield*/, rolesCollection.deleteMany({})];
                case 6:
                    _a.sent();
                    roles = [
                        {
                            name: 'Owner',
                            permissions: seededPermissions_1.map(function (p) { return p._id; }), // All permissions
                        },
                        {
                            name: 'Dev Lead',
                            permissions: getPermissionIds(['edit_games', 'create_games', 'edit_dev_logs', 'manage_tickets', 'change_ticket_status', 'assign_tickets']),
                        },
                        {
                            name: 'Admin',
                            permissions: getPermissionIds(['manage_tickets', 'change_ticket_status', 'assign_tickets', 'manage_users']),
                        },
                    ];
                    return [4 /*yield*/, rolesCollection.insertMany(roles)];
                case 7:
                    seededRoles = _a.sent();
                    console.log("Seeded ".concat(seededRoles.insertedCount, " roles."));
                    // 3. Seed Owner User
                    console.log('Seeding Owner user...');
                    usersCollection = db.collection('users');
                    ownerEmail = 'owner@afterhours.studio';
                    return [4 /*yield*/, usersCollection.deleteOne({ email: ownerEmail })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, rolesCollection.findOne({ name: 'Owner' })];
                case 9:
                    ownerRole = _a.sent();
                    if (!ownerRole) {
                        throw new Error('Owner role not found after seeding!');
                    }
                    ownerPassword = crypto.randomBytes(16).toString('hex');
                    return [4 /*yield*/, bcrypt.hash(ownerPassword, 12)];
                case 10:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, usersCollection.insertOne({
                            email: ownerEmail,
                            password: hashedPassword,
                            roleId: ownerRole._id,
                            createdAt: new Date(),
                        })];
                case 11:
                    _a.sent();
                    console.log('\n--- OWNER ACCOUNT CREATED ---');
                    console.log("Email: ".concat(ownerEmail));
                    console.log("Password: ".concat(ownerPassword));
                    console.log('---------------------------\n');
                    return [3 /*break*/, 15];
                case 12:
                    error_1 = _a.sent();
                    console.error('Error seeding database:', error_1);
                    return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, client.close()];
                case 14:
                    _a.sent();
                    console.log('Database connection closed.');
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
seed();
