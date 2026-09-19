// src/db/teachers.ts
import { db } from './index.ts';
import { teachers } from './schema.ts';
import { desc, eq } from 'drizzle-orm';
import { TeacherFormData } from '../types.ts';

export async function getAllTeachers() {
  try {
    const records = await db.select().from(teachers).orderBy(desc(teachers.updatedAt));
    return records.map((r) => r.data as TeacherFormData);
  } catch (error) {
    console.error('Database query for teachers failed:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getTeacherById(id: string) {
  try {
    const records = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
    if (records.length === 0) return null;
    return records[0].data as TeacherFormData;
  } catch (error) {
    console.error(`Database query for teacher ${id} failed:`, error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function upsertTeacher(teacher: TeacherFormData, userId?: number) {
  try {
    const now = new Date();
    const result = await db
      .insert(teachers)
      .values({
        id: teacher.id,
        userId: userId || null,
        teacherId: teacher.teacherId || '',
        fullName: teacher.fullName || 'নামবিহীন',
        designation: teacher.designation || '',
        mainSubject: teacher.mainSubject || '',
        mobileNumber: teacher.mobileNumber || '',
        email: teacher.email || '',
        bloodGroup: teacher.bloodGroup || '',
        highestDegree: teacher.highestDegree || '',
        joiningDate: teacher.joiningDate || '',
        nidNumber: teacher.nidNumber || '',
        presentAddress: teacher.presentAddress || '',
        permanentAddress: teacher.permanentAddress || '',
        data: teacher,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: teachers.id,
        set: {
          teacherId: teacher.teacherId || '',
          fullName: teacher.fullName || 'নামবিহীন',
          designation: teacher.designation || '',
          mainSubject: teacher.mainSubject || '',
          mobileNumber: teacher.mobileNumber || '',
          email: teacher.email || '',
          bloodGroup: teacher.bloodGroup || '',
          highestDegree: teacher.highestDegree || '',
          joiningDate: teacher.joiningDate || '',
          nidNumber: teacher.nidNumber || '',
          presentAddress: teacher.presentAddress || '',
          permanentAddress: teacher.permanentAddress || '',
          data: teacher,
          updatedAt: now,
        },
      })
      .returning();

    return result[0].data as TeacherFormData;
  } catch (error) {
    console.error('Database upsert for teacher failed:', error);
    throw new Error('Database save operation failed. Please try again later.', { cause: error });
  }
}

export async function deleteTeacher(id: string) {
  try {
    await db.delete(teachers).where(eq(teachers.id, id));
    return true;
  } catch (error) {
    console.error(`Database delete for teacher ${id} failed:`, error);
    throw new Error('Database delete operation failed. Please try again later.', { cause: error });
  }
}
