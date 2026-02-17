import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not found in .env.local');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to database...');

    const db = client.db();
    const usersCollection = db.collection('users');

    // --- Seed Admin User ---
    const adminEmail = 'admin@afterhours.studio';
    const adminExists = await usersCollection.findOne({ email: adminEmail });

    if (adminExists) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
    } else {
      const adminPassword = 'AdminPassword123!'; // IMPORTANT: Change this in production!
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await usersCollection.insertOne({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
      });

      console.log(`Successfully created admin user with email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Database connection closed.');
  }
}

seed();
