import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (email === 'test@example.com' && password === 'password123') {
    // Generate a proper JWT-like token
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ sub: 'u1', email, iat: Math.floor(Date.now() / 1000) })).toString('base64url');
    const signature = Math.random().toString(36).slice(2);
    const token = `${header}.${payload}.${signature}`;
    
    res.json({
      token,
      user: { id: 'u1', email, name: 'Test User' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  
  // Generate a new JWT-like token
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'u1', email: 'test@example.com', iat: Math.floor(Date.now() / 1000) })).toString('base64url');
  const signature = Math.random().toString(36).slice(2);
  const newToken = `${header}.${payload}.${signature}`;
  
  res.json({ token: newToken });
});

app.post('/api/auth/logout', (req, res) => {
  // Invalidate the token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    if (!global.invalidatedTokens) global.invalidatedTokens = new Set();
    global.invalidatedTokens.add(token);
  }
  
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/user/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  
  // Check if token was invalidated (simple mock - in real app, check token blacklist)
  const token = authHeader.replace('Bearer ', '');
  if (global.invalidatedTokens && global.invalidatedTokens.has(token)) {
    return res.status(401).json({ error: 'Token has been invalidated' });
  }
  
  res.json({
    id: 'u1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user'
  });
});

// ---- Immoviewer-like endpoints
app.get('/api/tours/:id', (req, res) => {
  // Check if tour was deleted
  if (global.deletedTours && global.deletedTours.has(req.params.id)) {
    return res.status(404).json({ error: 'Tour not found' });
  }
  
  res.json({ 
    id: req.params.id, 
    title: 'Loft', 
    description: 'Beautiful 3-bedroom loft with city views',
    propertyType: 'residential',
    address: '123 Main St, New York, NY',
    price: 2500000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1800,
    status: 'published',
    scenes: [
      { id: 's1', name: 'Hall' }, 
      { id: 's2', name: 'Kitchen' }
    ] 
  });
});

app.get('/api/tours', (req, res) => {
  res.json({ 
    page: 1, 
    per_page: 10, 
    total: 2, 
    data: [
      { id: 't1', title: 'Luxury Downtown Loft', status: 'published' }, 
      { id: 't2', title: 'Modern Apartment', status: 'draft' }
    ] 
  });
});

app.post('/api/tours', (req, res) => {
  const tourData = req.body;
  const newTour = {
    id: 't' + Math.random().toString(36).slice(2),
    ...tourData,
    status: 'draft',
    createdAt: new Date().toISOString()
  };
  res.status(201).json(newTour);
});

app.put('/api/tours/:id', (req, res) => {
  const tourData = req.body;
  const updatedTour = {
    id: req.params.id,
    ...tourData,
    updatedAt: new Date().toISOString()
  };
  res.json(updatedTour);
});

app.delete('/api/tours/:id', (req, res) => {
  // Store deleted tours to simulate 404 after deletion
  if (!global.deletedTours) global.deletedTours = new Set();
  global.deletedTours.add(req.params.id);
  res.status(204).send();
});

app.get('/api/tours/:id/analytics', (req, res) => {
  res.json({
    views: 1250,
    uniqueVisitors: 890,
    avgTimeOnTour: 180, // seconds
    conversionRate: 0.12
  });
});

app.post('/api/leads', (req, res) => {
  const { tourId, name, email, consent } = req.body || {};
  if (!tourId || !name || !email || !consent) {
    return res.status(400).json({ error: 'validation' });
  }
  res.status(201).json({ 
    id: 'lead_' + Math.random().toString(36).slice(2), 
    tourId 
  });
});

app.post('/api/tours/:id/publish', (req, res) => {
  res.status(202).json({ 
    status: 'queued',
    publishUrl: `https://tours.example.com/${req.params.id}`
  });
});

// ---- DocuSketch-like endpoints
let statusHits = 0;

app.post('/api/projects/:id/uploads', (req, res) => {
  res.status(201).json({ 
    sessionId: 'sess1', 
    chunkUrl: `/api/chunk/sess1` 
  });
});

app.put('/api/chunk/:sid', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/projects/:id/finalize', (req, res) => { 
  statusHits = 0; 
  res.status(202).json({ status: 'queued' }); 
});

app.get('/api/projects/:id/status', (req, res) => {
  statusHits++;
  const status = statusHits < 2 ? 'queued' : statusHits < 4 ? 'processing' : 'done';
  res.json({ status });
});

app.get('/api/projects/:id/floorplan', (req, res) => {
  res.json({ 
    rooms: [{ id: 'r1', name: 'Living' }], 
    walls: [{ from: [0,0], to: [3,0] }], 
    scale: 'm' 
  });
});

// ---- Simple pages for UI tests
app.get('/dashboard', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/tour/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tour.html'));
});

app.get('/projects/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'project.html'));
});

const port = Number(process.env.MOCK_PORT || 5173);
app.listen(port, () => {
  console.log(`[mock] running on http://localhost:${port}`);
});
