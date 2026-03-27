import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nextgen-council-secret-key";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Database setup
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT -- Chief, Senior, Admin
    );

    CREATE TABLE IF NOT EXISTS activists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT,
      photoUrl TEXT,
      department TEXT,
      grade TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS digital_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      badgeNumber TEXT UNIQUE,
      activistId INTEGER,
      isActive BOOLEAN,
      FOREIGN KEY(activistId) REFERENCES activists(id)
    );

    CREATE TABLE IF NOT EXISTS senior_staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activistId INTEGER,
      position TEXT,
      priority INTEGER,
      FOREIGN KEY(activistId) REFERENCES activists(id)
    );

    CREATE TABLE IF NOT EXISTS hall_of_fame (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT,
      achievement TEXT,
      year INTEGER
    );

    CREATE TABLE IF NOT EXISTS vacancies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      status TEXT -- Open, Closed
    );

    CREATE TABLE IF NOT EXISTS candidate_apps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vacancyId INTEGER,
      name TEXT,
      telegram TEXT,
      motivation TEXT,
      FOREIGN KEY(vacancyId) REFERENCES vacancies(id)
    );

    CREATE TABLE IF NOT EXISTS partner_apps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand TEXT,
      offer TEXT,
      contact TEXT
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      content TEXT,
      photoUrl TEXT,
      date TEXT
    );

    CREATE TABLE IF NOT EXISTS wiki (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      category TEXT,
      content TEXT
    );

    CREATE TABLE IF NOT EXISTS page_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE,
      value TEXT
    );
  `);

  // Seed initial Chief admin if not exists
  const chief = await db.get("SELECT * FROM users WHERE role = 'Chief'");
  if (!chief) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ["chief", hashedPassword, "Chief"]);
  }

  // API Routes
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Public API: ID Check
  app.get("/api/public/id-check/:number", async (req, res) => {
    const { number } = req.params;
    const badge = await db.get(`
      SELECT b.*, a.fullName, a.photoUrl, a.department, a.grade, a.status 
      FROM digital_badges b 
      JOIN activists a ON b.activistId = a.id 
      WHERE b.badgeNumber = ? AND b.isActive = 1
    `, [number]);
    if (badge) {
      res.json(badge);
    } else {
      res.status(404).json({ error: "Badge not found or inactive" });
    }
  });

  // Public API: News
  app.get("/api/public/news", async (req, res) => {
    const news = await db.all("SELECT * FROM news ORDER BY date DESC LIMIT 10");
    res.json(news);
  });

  // Public API: Staff
  app.get("/api/public/staff", async (req, res) => {
    const staff = await db.all(`
      SELECT s.*, a.fullName, a.photoUrl 
      FROM senior_staff s 
      JOIN activists a ON s.activistId = a.id 
      ORDER BY s.priority ASC
    `);
    res.json(staff);
  });

  // Public API: Hall of Fame
  app.get("/api/public/hall-of-fame", async (req, res) => {
    const hof = await db.all("SELECT * FROM hall_of_fame ORDER BY year DESC");
    res.json(hof);
  });

  // Public API: Wiki
  app.get("/api/public/wiki", async (req, res) => {
    const wiki = await db.all("SELECT * FROM wiki");
    res.json(wiki);
  });

  // Public API: Vacancies
  app.get("/api/public/vacancies", async (req, res) => {
    const vacancies = await db.all("SELECT * FROM vacancies WHERE status = 'Open'");
    res.json(vacancies);
  });

  // Public API: Submit Candidate App
  app.post("/api/public/candidate-app", async (req, res) => {
    const { vacancyId, name, telegram, motivation } = req.body;
    await db.run("INSERT INTO candidate_apps (vacancyId, name, telegram, motivation) VALUES (?, ?, ?, ?)", [vacancyId, name, telegram, motivation]);
    res.json({ success: true });
  });

  // Public API: Submit Partner App
  app.post("/api/public/partner-app", async (req, res) => {
    const { brand, offer, contact } = req.body;
    await db.run("INSERT INTO partner_apps (brand, offer, contact) VALUES (?, ?, ?)", [brand, offer, contact]);
    res.json({ success: true });
  });

  // --- Admin API Routes (Protected) ---

  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      (req as any).user = user;
      next();
    });
  };

  const checkRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (roles.includes((req as any).user.role)) {
      next();
    } else {
      res.status(403).json({ error: "Access denied" });
    }
  };

  // Activists & Badges (Chief, Senior, Admin)
  app.get("/api/admin/activists", authenticateToken, checkRole(['Chief', 'Senior', 'Admin']), async (req, res) => {
    const activists = await db.all("SELECT * FROM activists");
    res.json(activists);
  });

  app.post("/api/admin/activists", authenticateToken, checkRole(['Chief', 'Senior', 'Admin']), async (req, res) => {
    const { fullName, photoUrl, department, grade, status } = req.body;
    const result = await db.run("INSERT INTO activists (fullName, photoUrl, department, grade, status) VALUES (?, ?, ?, ?, ?)", [fullName, photoUrl, department, grade, status]);
    res.json({ id: result.lastID });
  });

  app.get("/api/admin/badges", authenticateToken, checkRole(['Chief', 'Senior', 'Admin']), async (req, res) => {
    const badges = await db.all("SELECT * FROM digital_badges");
    res.json(badges);
  });

  app.post("/api/admin/badges", authenticateToken, checkRole(['Chief', 'Senior', 'Admin']), async (req, res) => {
    const { badgeNumber, activistId, isActive } = req.body;
    await db.run("INSERT INTO digital_badges (badgeNumber, activistId, isActive) VALUES (?, ?, ?)", [badgeNumber, activistId, isActive]);
    res.json({ success: true });
  });

  // News, Wiki, Vacancies, HOF (Chief, Senior)
  app.post("/api/admin/news", authenticateToken, checkRole(['Chief', 'Senior']), async (req, res) => {
    const { title, content, photoUrl, date } = req.body;
    await db.run("INSERT INTO news (title, content, photoUrl, date) VALUES (?, ?, ?, ?)", [title, content, photoUrl, date]);
    res.json({ success: true });
  });

  app.post("/api/admin/wiki", authenticateToken, checkRole(['Chief', 'Senior']), async (req, res) => {
    const { title, category, content } = req.body;
    await db.run("INSERT INTO wiki (title, category, content) VALUES (?, ?, ?)", [title, category, content]);
    res.json({ success: true });
  });

  // Page Settings & Senior Staff (Chief only)
  app.get("/api/admin/settings", authenticateToken, checkRole(['Chief']), async (req, res) => {
    const settings = await db.all("SELECT * FROM page_settings");
    res.json(settings);
  });

  app.post("/api/admin/settings", authenticateToken, checkRole(['Chief']), async (req, res) => {
    const { key, value } = req.body;
    await db.run("INSERT OR REPLACE INTO page_settings (key, value) VALUES (?, ?)", [key, value]);
    res.json({ success: true });
  });

  // Admin Management (Chief, Senior can create Admin)
  app.post("/api/admin/users", authenticateToken, checkRole(['Chief', 'Senior']), async (req, res) => {
    const { username, password, role } = req.body;
    // Senior can only create Admin
    if ((req as any).user.role === 'Senior' && role !== 'Admin') {
      return res.status(403).json({ error: "Seniors can only create Admins" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      await db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, role]);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Username already exists" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
