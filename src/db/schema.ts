import { relations } from 'drizzle-orm';
import { integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table (synced with Firebase Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'teachers' table for storing teacher records
export const teachers = pgTable('teachers', {
  id: text('id').primaryKey(), // tch_ timestamp or custom id
  userId: integer('user_id').references(() => users.id),
  teacherId: text('teacher_id'),
  fullName: text('full_name').notNull(),
  designation: text('designation'),
  mainSubject: text('main_subject'),
  mobileNumber: text('mobile_number'),
  email: text('email'),
  bloodGroup: text('blood_group'),
  highestDegree: text('highest_degree'),
  joiningDate: text('joining_date'),
  nidNumber: text('nid_number'),
  presentAddress: text('present_address'),
  permanentAddress: text('permanent_address'),
  data: jsonb('data').notNull(), // Complete TeacherFormData
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  teachers: many(teachers),
}));

export const teachersRelations = relations(teachers, ({ one }) => ({
  author: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
}));
