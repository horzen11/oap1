const users = new Map();
export const usersRepository = {
    getAll() {
        return Array.from(users.values());
    },
    getById(id) {
        return users.get(id) ?? null;
    },
    getByEmail(email) {
        return this.getAll().find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
    },
    add(user) {
        users.set(user.id, user);
        return user;
    },
    update(id, user) {
        if (!users.has(id))
            return null;
        users.set(id, user);
        return user;
    },
    delete(id) {
        return users.delete(id);
    },
};
