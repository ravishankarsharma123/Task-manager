export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project-admin",
    MEMBER: "member",
    GUEST: "guest",
}// this is the enum for user roles 
export const AvailableUserRoles = Object.values(UserRolesEnum); // this will give you an array of the values of the enum

export const TaskStatusEnum = {
    TODO: "todo",
    PENDING: "pending",
    IN_PROGRESS: "in-progress",
    DONE: "done",
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum);