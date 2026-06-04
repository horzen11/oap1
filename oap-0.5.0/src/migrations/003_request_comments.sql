CREATE TABLE IF NOT EXISTS RequestComments (
  id TEXT PRIMARY KEY,
  requestId TEXT NOT NULL,
  userId TEXT NOT NULL,
  body TEXT NOT NULL CHECK (length(body) >= 3 AND length(body) <= 500),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (requestId) REFERENCES Requests(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE RESTRICT
);
