import type { User } from "../models/user.model.js";

const users = new Map<string, User>();

export const usersRepository = {
  getAll(): User[] {
    return Array.from(users.values());
  },

  getById(id: string): User | null {
    return users.get(id) ?? null;
  },

  getByEmail(email: string): User | null {
    return this.getAll().find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  add(user: User): User {
    users.set(user.id, user);
    return user;
  },

  update(id: string, user: User): User | null {
    if (!users.has(id)) return null;
    users.set(id, user);
    return user;
  },

  delete(id: string): boolean {
    return users.delete(id);
  },
};
