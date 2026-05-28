CREATE TABLE IF NOT EXISTS Users (
  id TEXT PRIMARY KEY,
  fullName TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('Student', 'Teacher', 'Admin')),
  createdAt TEXT NOT NULL
);
