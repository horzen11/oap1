ALTER TABLE Requests ADD COLUMN ownerUserId TEXT;
UPDATE Requests SET ownerUserId = userId WHERE ownerUserId IS NULL;
