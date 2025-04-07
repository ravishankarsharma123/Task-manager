export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project-admin",
    MEMBER: "member",
    GUEST: "guest",
}
export const AvailableUserRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
    TODO: "todo",
    PENDING: "pending",
    IN_PROGRESS: "in-progress",
    DONE: "done",
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum);