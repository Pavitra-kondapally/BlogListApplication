const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Allow CORS
app.use(express.json()); // Parse JSON bodies

// Define routes

// Create a new post
app.post('/posts', (req, res) => {
  const { title, content, userId } = req.body;
  console.log('Received POST request at /posts');
  console.log('Request body:', req.body);

  const stmt = db.prepare('INSERT INTO Post (title, content, userId) VALUES (?, ?, ?)');
  stmt.run([title, content, userId], function (err) {
    if (err) {
      console.error('Error creating post:', err.message);
      res.status(500).json({ message: 'Error creating post', error: err.message });
    } else {
      console.log('Post created with id:', this.lastID);
      res.status(201).json({ id: this.lastID, title, content, userId });
    }
  });
  stmt.finalize();
});

// Retrieve all posts
app.get('/posts', (req, res) => {
  console.log('Received GET request at /posts');

  const stmt = db.prepare('SELECT * FROM Post');
  stmt.all((err, rows) => {
    if (err) {
      console.error('Error fetching posts:', err.message);
      res.status(500).json({ message: 'Error fetching posts', error: err.message });
    } else {
      console.log('Posts retrieved:', rows);
      res.json(rows);
    }
  });
  stmt.finalize();
});

// Retrieve a single post by id
app.get('/posts/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Received GET request for post with id: ${id}`);

  const stmt = db.prepare('SELECT * FROM Post WHERE id = ?');
  stmt.get([id], (err, row) => {
    if (err) {
      console.error('Database error:', err.message);
      res.status(500).json({ message: 'Database error', error: err.message });
    } else if (row) {
      console.log('Post found:', row);
      res.json(row);
    } else {
      console.log('Post not found');
      res.status(404).json({ message: 'Post not found' });
    }
  });
  stmt.finalize();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
