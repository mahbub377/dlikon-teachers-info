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

// Define the 'library_resources' table for shared school-wide Digital Library metadata
export const libraryResources = pgTable('library_resources', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  className: text('class_name').notNull(),
  subject: text('subject').notNull(),
  category: text('category').notNull(),
  sourceType: text('source_type').notNull(), // 'pdf_upload' | 'external_url'
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  hasCloudFile: integer('has_cloud_file').default(0), // 1 if stored in library_files
  url: text('url'),
  academicYear: text('academic_year'),
  termOrChapter: text('term_or_chapter'),
  authorOrPublisher: text('author_or_publisher'),
  description: text('description'),
  uploadedBy: text('uploaded_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the 'library_files' table for storing shared PDF binary/base64 payloads cleanly
export const libraryFiles = pgTable('library_files', {
  resourceId: text('resource_id')
    .primaryKey()
    .references(() => libraryResources.id, { onDelete: 'cascade' }),
  fileDataBase64: text('file_data_base64').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  teachers: many(teachers),
  libraryResources: many(libraryResources),
}));

export const teachersRelations = relations(teachers, ({ one }) => ({
  author: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
}));

export const libraryResourcesRelations = relations(libraryResources, ({ one }) => ({
  author: one(users, {
    fields: [libraryResources.userId],
    references: [users.id],
  }),
  file: one(libraryFiles, {
    fields: [libraryResources.id],
    references: [libraryFiles.resourceId],
  }),
}));

