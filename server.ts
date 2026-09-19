import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getAllTeachers, getTeacherById, upsertTeacher, deleteTeacher } from './src/db/teachers.ts';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parser with sufficient limit for teacher photo/signature
  app.use(express.json({ limit: '15mb' }));

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
