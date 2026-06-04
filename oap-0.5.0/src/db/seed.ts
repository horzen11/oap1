import { v4 as uuid } from "uuid";
import { run } from "./dbClient.js";
import { migrate } from "./migrate.js";

async function seed(): Promise<void> {
  await migrate();

  await run("DELETE FROM RequestComments;");
  await run("DELETE FROM Requests;");
  await run("DELETE FROM Users;");

  const now = new Date().toISOString();

  const user1 = "11111111-1111-4111-8111-111111111111";
  const user2 = "22222222-2222-4222-8222-222222222222";
  const user3 = "33333333-3333-4333-8333-333333333333";
  const request1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const request2 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const request3 = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

  await run(
    `
    INSERT INTO Users (id, fullName, email, role, createdAt) VALUES
    (?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?);
  `,
    [
      user1,
      "Софія Шевцова",
      "sofia@example.com",
      "Student",
      now,
      user2,
      "Назар Горячий",
      "nazar@example.com",
      "Student",
      now,
      user3,
      "Викладач ОАП",
      "teacher@example.com",
      "Teacher",
      now,
    ],
  );

  await run(
    `
    INSERT INTO Requests (id, itemCode, userId, dateFrom, dateTo, comment, status, createdAt, updatedAt) VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `,
    [
      request1,
      "1001",
      user1,
      "2026-05-20",
      "2026-05-21",
      "Потрібен ноутбук для лабораторної роботи",
      "New",
      now,
      now,
      request2,
      "2002",
      user2,
      "2026-05-22",
      "2026-05-23",
      "Потрібен проєктор для презентації",
      "Approved",
      now,
      now,
      request3,
      "3003",
      user1,
      "2026-05-24",
      "2026-05-24",
      "Потрібна миша для роботи в аудиторії",
      "Rejected",
      now,
      now,
    ],
  );

  await run(
    `
    INSERT INTO RequestComments (id, requestId, userId, body, createdAt, updatedAt) VALUES
    (?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?),
    (?, ?, ?, ?, ?, ?);
  `,
    [
      uuid(),
      request1,
      user3,
      "Заявку прийнято на перевірку",
      now,
      now,
      uuid(),
      request2,
      user3,
      "Проєктор можна забрати зранку",
      now,
      now,
      uuid(),
      request3,
      user3,
      "Наразі обладнання недоступне",
      now,
      now,
    ],
  );

  console.log("Seed completed");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
