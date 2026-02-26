const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const allPermissionsData = [
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

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not found in .env.local. Make sure the file exists and the variable is set.');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to database for seeding...');
    const db = client.db();

    // 1. Seed Permissions
    console.log('Seeding permissions...');
    const permissionsCollection = db.collection('permissions');
    await permissionsCollection.deleteMany({});
    await permissionsCollection.insertMany(allPermissionsData);
    const seededPermissions = await permissionsCollection.find().toArray();
    console.log(`Seeded ${seededPermissions.length} permissions.`);

    const getPermissionIds = (names) => {
      return seededPermissions
        .filter(p => names.includes(p.name))
        .map(p => p._id);
    };

    // 2. Seed Roles
    console.log('Seeding roles...');
    const rolesCollection = db.collection('roles');
    await rolesCollection.deleteMany({});

    const roles = [
      {
        name: 'Owner',
        permissions: seededPermissions.map(p => p._id), // All permissions
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

    const seededRolesResult = await rolesCollection.insertMany(roles);
    console.log(`Seeded ${seededRolesResult.insertedCount} roles.`);

    // 3. Seed Owner User
    console.log('Seeding Owner user...');
    const usersCollection = db.collection('users');
    const ownerEmail = 'tylervanpelt08@gmail.com';

    await usersCollection.deleteOne({ email: ownerEmail });

    const ownerRole = await rolesCollection.findOne({ name: 'Owner' });
    if (!ownerRole) {
      throw new Error('Owner role not found after seeding!');
    }

    const ownerPassword = 'Bailey2019!!@@';
    const hashedPassword = await bcrypt.hash(ownerPassword, 12);

    await usersCollection.insertOne({
      email: ownerEmail,
      password: hashedPassword,
      roleId: ownerRole._id,
      createdAt: new Date(),
    });

    console.log('\n--- OWNER ACCOUNT CREATED ---');
    console.log(`Email: ${ownerEmail}`);
    console.log(`Password: ${ownerPassword}`);
    console.log('---------------------------\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed.');
  }
}

seed();
