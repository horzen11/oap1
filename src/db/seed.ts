import { v4 as uuid } from "uuid";
import { run } from "./dbClient.js";
import { migrate } from "./migrate.js";
import { sqlString } from "./sql.js";

async function seed(): Promise<void> {
  await migrate();

  await run("DELETE FROM RequestComments;");
  await run("DELETE FROM Requests;");
  await run("DELETE FROM Users;");

  const now = new Date().toISOString();

  const user1 = uuid();
  const user2 = uuid();
  const user3 = uuid();
  const request1 = uuid();
  const request2 = uuid();
  const request3 = uuid();

  await run(`
    INSERT INTO Users (id, fullName, email, role, createdAt) VALUES
    (${sqlString(user1)}, 'Софія Шевцова', 'sofia@example.com', 'Student', ${sqlString(now)}),
    (${sqlString(user2)}, 'Назар Горячий', 'nazar@example.com', 'Student', ${sqlString(now)}),
    (${sqlString(user3)}, 'Викладач ОАП', 'teacher@example.com', 'Teacher', ${sqlString(now)});
  `);

  await run(`
    INSERT INTO Requests (id, itemCode, userId, dateFrom, dateTo, comment, status, createdAt, updatedAt) VALUES
    (${sqlString(request1)}, '1001', ${sqlString(user1)}, '2026-05-20', '2026-05-21', 'Потрібен ноутбук для лабораторної роботи', 'New', ${sqlString(now)}, ${sqlString(now)}),
    (${sqlString(request2)}, '2002', ${sqlString(user2)}, '2026-05-22', '2026-05-23', 'Потрібен проєктор для презентації', 'Approved', ${sqlString(now)}, ${sqlString(now)}),
    (${sqlString(request3)}, '3003', ${sqlString(user1)}, '2026-05-24', '2026-05-24', 'Потрібна миша для роботи в аудиторії', 'Rejected', ${sqlString(now)}, ${sqlString(now)});
  `);

  await run(`
    INSERT INTO RequestComments (id, requestId, userId, body, createdAt, updatedAt) VALUES
    (${sqlString(uuid())}, ${sqlString(request1)}, ${sqlString(user3)}, 'Заявку прийнято на перевірку', ${sqlString(now)}, ${sqlString(now)}),
    (${sqlString(uuid())}, ${sqlString(request2)}, ${sqlString(user3)}, 'Проєктор можна забрати зранку', ${sqlString(now)}, ${sqlString(now)}),
    (${sqlString(uuid())}, ${sqlString(request3)}, ${sqlString(user3)}, 'Наразі обладнання недоступне', ${sqlString(now)}, ${sqlString(now)});
  `);

  console.log("Seed completed");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
