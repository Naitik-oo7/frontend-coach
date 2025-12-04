import { apiGet, apiPost, apiPut } from "../api/client";

// Types
export interface Permission {
  name: string;
  description?: string;
}

export interface RolePermission {
  roleName: string;
  permissions: string[];
}

// API Functions

/**
 * Get all permissions in the system
 */
interface GetAllPermissionsResponse {
  permissions: string[];
}

export async function getAllPermissions(): Promise<string[]> {
  try {
    const response = await apiGet<GetAllPermissionsResponse>(
      "/api/v1/role-permissions"
    );
    return response.permissions;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
}

/**
 * Get all permissions for a specific role
 */
interface GetRolePermissionsResponse {
  permissions: string[];
}

export async function getRolePermissions(roleName: string): Promise<string[]> {
  try {
    const response = await apiGet<GetRolePermissionsResponse>(
      `/api/v1/role-permissions/roles/${roleName}`
    );
    return response.permissions;
  } catch (error) {
    console.error(`Error fetching permissions for role ${roleName}:`, error);
    throw error;
  }
}

/**
 * Assign multiple permissions to a role
 */
export async function assignPermissionsToRole(
  roleName: string,
  permissionNames: string[]
) {
  try {
    const response = await apiPost("/api/v1/role-permissions/assign-bulk", {
      roleName,
      permissionNames,
    });
    return response;
  } catch (error) {
    console.error(`Error assigning permissions to role ${roleName}:`, error);
    throw error;
  }
}

/**
 * Remove multiple permissions from a role
 */
export async function removePermissionsFromRole(
  roleName: string,
  permissionNames: string[]
) {
  try {
    const response = await apiPost("/api/v1/role-permissions/remove-bulk", {
      roleName,
      permissionNames,
    });
    return response;
  } catch (error) {
    console.error(`Error removing permissions from role ${roleName}:`, error);
    throw error;
  }
}

/**
 * Set permissions for a role (removes all existing and assigns new ones)
 */
export async function setRolePermissions(
  roleName: string,
  permissionNames: string[]
) {
  try {
    const response = await apiPut("/api/v1/role-permissions/set", {
      roleName,
      permissionNames,
    });
    return response;
  } catch (error) {
    console.error(`Error setting permissions for role ${roleName}:`, error);
    throw error;
  }
}

/**
 * Get all roles that have a specific permission
 */
interface GetRolesWithPermissionResponse {
  roles: string[];
}

export async function getRolesWithPermission(
  permissionName: string
): Promise<string[]> {
  try {
    const response = await apiGet<GetRolesWithPermissionResponse>(
      `/api/v1/role-permissions/${permissionName}/roles`
    );
    return response.roles;
  } catch (error) {
    console.error(
      `Error fetching roles with permission ${permissionName}:`,
      error
    );
    throw error;
  }
}

/**
 * Seed default permissions
 */
export async function seedPermissions() {
  try {
    const response = await apiPost("/api/v1/role-permissions/seed");
    return response;
  } catch (error) {
    console.error("Error seeding permissions:", error);
    throw error;
  }
}
