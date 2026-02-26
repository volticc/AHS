import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface LogEntry {
  actorId: ObjectId;
  action: string; // e.g., 'create_user', 'delete_project', 'change_ticket_status'
  targetId?: ObjectId; // The ID of the item that was changed
  details: object; // Any extra details, like the new status or role
  timestamp: Date;
}

export async function logAudit(actorId: string, action: string, details: object = {}, targetId?: string) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const logEntry: Partial<LogEntry> = {
      actorId: new ObjectId(actorId),
      action,
      details,
      timestamp: new Date(),
    };

    if (targetId) {
      logEntry.targetId = new ObjectId(targetId);
    }

    await db.collection('audit_logs').insertOne(logEntry);

  } catch (error) {
    console.error('Failed to write to audit log:', error);
    // We don't throw an error here because failing to log should not break the primary action
  }
}
