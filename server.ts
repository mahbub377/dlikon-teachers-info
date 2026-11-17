import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getAllTeachers, getTeacherById, upsertTeacher, deleteTeacher } from './src/db/teachers.ts';
import {
  getAllLibraryResourcesDb,
  upsertLibraryResourceDb,
  getLibraryFileDb,
  deleteLibraryResourceDb,
} from './src/db/library.ts';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parser with sufficient limit for teacher photos and shared PDF uploads
  app.use(express.json({ limit: '45mb' }));

  // Global CORS headers to prevent canvas tainting and allow iframe preview
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
  });

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Current authenticated user info
  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    res.json({
      uid: req.user?.uid,
      email: req.user?.email,
      name: req.user?.name,
      picture: req.user?.picture,
      dbUserId: req.dbUserId,
    });
  });

  // Get all teachers from Cloud SQL
  app.get('/api/teachers', optionalAuth, async (_req: AuthRequest, res) => {
    try {
      const teachers = await getAllTeachers();
      res.json(teachers);
    } catch (error: unknown) {
      console.error('Failed to get teachers:', error);
      res.status(500).json({ error: 'শিক্ষকদের তথ্য লোড করা সম্ভব হয়নি' });
    }
  });

  // Get a specific teacher by ID
  app.get('/api/teachers/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const teacher = await getTeacherById(req.params.id);
      if (!teacher) {
        return res.status(404).json({ error: 'শিক্ষক পাওয়া যায়নি' });
      }
      res.json(teacher);
    } catch (error: unknown) {
      console.error(`Failed to get teacher ${req.params.id}:`, error);
      res.status(500).json({ error: 'শিক্ষকের তথ্য লোড করা সম্ভব হয়নি' });
    }
  });

  // Save / Update a teacher in Cloud SQL
  app.post('/api/teachers', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const teacherData = req.body;
      if (!teacherData || !teacherData.id) {
        return res.status(400).json({ error: 'বৈধ শিক্ষক তথ্য প্রদান করুন' });
      }

      const saved = await upsertTeacher(teacherData, req.dbUserId);
      res.json(saved);
    } catch (error: unknown) {
      console.error('Failed to save teacher:', error);
      res.status(500).json({ error: 'শিক্ষকের তথ্য সংরক্ষণ করা সম্ভব হয়নি' });
    }
  });

  // Delete a teacher from Cloud SQL
  app.delete('/api/teachers/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      await deleteTeacher(req.params.id);
      res.json({ success: true });
    } catch (error: unknown) {
      console.error(`Failed to delete teacher ${req.params.id}:`, error);
      res.status(500).json({ error: 'শিক্ষকের তথ্য মুছে ফেলা সম্ভব হয়নি' });
    }
  });

  // ==========================================================
  // DIGITAL LIBRARY CLOUD SQL ENDPOINTS (Multi-Device Shared)
  // ==========================================================

  // Get all shared library resources metadata (Open Read Access)
  app.get('/api/library', optionalAuth, async (_req: AuthRequest, res) => {
    try {
      const items = await getAllLibraryResourcesDb();
      res.json(items);
    } catch (error: unknown) {
      console.error('Failed to get library resources:', error);
      res.status(500).json({ error: 'লাইব্রেরির তালিকা লোড করা সম্ভব হয়নি' });
    }
  });

  // Stream / Download uploaded PDF directly from Cloud SQL across any device
  app.get('/api/library/:id/pdf', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const file = await getLibraryFileDb(req.params.id);
      if (!file) {
        return res.status(404).json({ error: 'পিডিএফ ফাইলটি পাওয়া যায়নি' });
      }
      const isDownload = req.query.download === '1' || req.query.download === 'true';
      const safeName = encodeURIComponent(file.fileName);
      res.setHeader('Content-Type', file.mimeType || 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `${isDownload ? 'attachment' : 'inline'}; filename*=UTF-8''${safeName}`
      );
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(file.buffer);
    } catch (error: unknown) {
      console.error(`Failed streaming library PDF ${req.params.id}:`, error);
      res.status(500).json({ error: 'পিডিএফ ফাইল প্রদর্শন করা সম্ভব হয়নি' });
    }
  });

  // Save a new PDF resource or external/Drive link into Cloud SQL
  app.post('/api/library', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { resource, pdfBase64 } = req.body || {};
      if (!resource || !resource.id || !resource.title) {
        return res.status(400).json({ error: 'বৈধ বই বা রিসোর্স তথ্য প্রদান করুন' });
      }
      const saved = await upsertLibraryResourceDb(resource, pdfBase64, req.dbUserId);
      res.json(saved);
    } catch (error: unknown) {
      console.error('Failed to save library resource:', error);
      res.status(500).json({ error: 'লাইব্রেরিতে সংরক্ষণ করা সম্ভব হয়নি' });
    }
  });

  // Delete a library resource from Cloud SQL
  app.delete('/api/library/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      await deleteLibraryResourceDb(req.params.id);
      res.json({ success: true });
    } catch (error: unknown) {
      console.error(`Failed deleting library resource ${req.params.id}:`, error);
      res.status(500).json({ error: 'রিসোর্সটি মুছে ফেলা সম্ভব হয়নি' });
    }
  });

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
