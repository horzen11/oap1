CREATE TABLE IF NOT EXISTS Requests (
  id TEXT PRIMARY KEY,
  itemCode TEXT NOT NULL CHECK (length(itemCode) >= 3 AND length(itemCode) <= 12),
  userId TEXT NOT NULL,
  dateFrom TEXT NOT NULL,
  dateTo TEXT NOT NULL,
  comment TEXT NOT NULL CHECK (length(comment) >= 5 AND length(comment) <= 500),
  status TEXT NOT NULL CHECK (status IN ('New', 'Approved', 'Rejected')),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
