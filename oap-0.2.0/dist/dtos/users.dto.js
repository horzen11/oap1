export function toUserResponseDto(user) {
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}
