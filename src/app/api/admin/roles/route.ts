import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET: Fetch all roles
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includePermissions = searchParams.get('includePermissions') === 'true';

  try {
    const client = await clientPromise;
    const db = client.db();

    if (includePermissions) {
      // Fetch roles and populate their permissions
      const roles = await db.collection('roles').aggregate([
        {
          $lookup: {
            from: 'permissions',
            localField: 'permissions',
            foreignField: '_id',
            as: 'permissions'
          }
        }
      ]).toArray();
      return NextResponse.json(roles, { status: 200 });
    } else {
      // Just fetch role names and IDs
      const roles = await db.collection('roles').find({}, {
        projection: {
          permissions: 0
        }
      }).toArray();
      return NextResponse.json(roles, { status: 200 });
    }

  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
