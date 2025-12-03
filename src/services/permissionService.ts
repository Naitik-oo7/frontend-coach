import { apiGet, apiPost } from "../api/client";

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
export async function getAllPermissions(): Promise<string[]> {
  try {
    const response = await apiGet("/api/v1/permissions");
    return response.permissions;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
}

/**
 * Get all permissions for a specific role
 */
export async function getRolePermissions(roleName: string): Promise<string[]> {
  try {
    const response = await apiGet(`/api/v1/permissions/roles/${roleName}`);
    return response.permissions;
  } catch (error) {
    console.error(`Error fetching permissions for role ${roleName}:`, error);
    throw error;
  }
}

/**
 * Assign a permission to a role
 */
export async function assignPermissionToRole(
  roleName: string,
  permissionName: string
) {
  try {
    const response = await apiPost("/api/v1/permissions/assign", {
      roleName,
      permissionName,
    });
    return response;
  } catch (error) {
    console.error(
      `Error assigning permission ${permissionName} to role ${roleName}:`,
      error
    );
    throw error;
  }
}

/**
 * Remove a permission from a role
 */
export async function removePermissionFromRole(
  roleName: string,
  permissionName: string
) {
  try {
    const response = await apiPost("/api/v1/permissions/remove", {
      roleName,
      permissionName,
    });
    return response;
  } catch (error) {
    console.error(
      `Error removing permission ${permissionName} from role ${roleName}:`,
      error
    );
    throw error;
  }
}

/**
 * Get all roles that have a specific permission
 */
export async function getRolesWithPermission(
  permissionName: string
): Promise<string[]> {
  try {
    const response = await apiGet(
      `/api/v1/permissions/${permissionName}/roles`
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
    const response = await apiPost("/api/v1/permissions/seed");
    return response;
  } catch (error) {
    console.error("Error seeding permissions:", error);
    throw error;
  }
}
