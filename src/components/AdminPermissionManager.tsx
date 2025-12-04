import React, { useState, useEffect } from "react";
import {
  getAllPermissions,
  getRolePermissions,
  setRolePermissions,
} from "../services/permissionService";
import { apiGet } from "../api/client";
import { useToast } from "../hooks/useToast";

// Define response interface
interface UserCountsResponse {
  counts: Record<string, number>;
}

// Group permissions by module/category
const groupPermissionsByModule = (
  permissions: string[]
): Record<string, string[]> => {
  const modules: Record<string, string[]> = {};

  permissions.forEach((permission) => {
    // Extract module name (first part before underscore)
    const moduleName = permission.split("_")[0] || "other";

    if (!modules[moduleName]) {
      modules[moduleName] = [];
    }
    modules[moduleName].push(permission);
  });

  return modules;
};

const AdminPermissionManager: React.FC = () => {
  const toast = useToast();
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [rolePermissions, setRolePermissionsState] = useState<
    Record<string, string[]>
  >({});
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [availableRoles] = useState<string[]>(["admin", "coach", "user"]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<
    Record<string, boolean>
  >({});
  const [showModal, setShowModal] = useState<boolean>(false);

  // Load all permissions on component mount
  useEffect(() => {
    loadAllPermissions();
    loadAllRolePermissions();
    loadUserCounts();
  }, []);

  const loadAllPermissions = async () => {
    try {
      const permissions = await getAllPermissions();
      setAllPermissions(permissions);
    } catch (error) {
      toast.error("Error loading permissions");
      console.error(error);
    }
  };

  const loadAllRolePermissions = async () => {
    try {
      setLoading(true);
      const rolePerms: Record<string, string[]> = {};
      for (const role of availableRoles) {
        const permissions = await getRolePermissions(role);
        rolePerms[role] = permissions;
      }
      setRolePermissionsState(rolePerms);
    } catch (error) {
      toast.error("Error loading role permissions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserCounts = async () => {
    try {
      // Use the new endpoint to get user counts by role
      const response = await apiGet<UserCountsResponse>(
        "/api/v1/users/counts/by-role"
      );
      setUserCounts(response.counts);

      // Initialize counts for roles that don't have any users
      const counts: Record<string, number> = { ...response.counts };
      availableRoles.forEach((role) => {
        if (counts[role] === undefined) {
          counts[role] = 0;
        }
      });
      setUserCounts(counts);
    } catch (error) {
      toast.error("Error loading user counts");
      console.error(error);
    }
  };

  const handleEditRole = (roleName: string) => {
    setEditingRole(roleName);
    // Initialize edit permissions with current role permissions
    const perms: Record<string, boolean> = {};
    allPermissions.forEach((perm) => {
      perms[perm] = rolePermissions[roleName]?.includes(perm) || false;
    });
    setEditPermissions(perms);
    setShowModal(true);
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;

    try {
      setLoading(true);
      // Get all selected permissions
      const selectedPermissions = Object.entries(editPermissions)
        .filter(([, selected]) => selected)
        .map(([permission]) => permission);

      await setRolePermissions(editingRole, selectedPermissions);

      // Refresh data
      await loadAllRolePermissions();
      await loadUserCounts();

      toast.success(`Permissions updated for role ${editingRole}`);
      setShowModal(false);
    } catch (error) {
      toast.error("Error updating permissions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to remove all permissions from role "${roleName}"?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await setRolePermissions(roleName, []);
      await loadAllRolePermissions();
      toast.success(`All permissions removed from role ${roleName}`);
    } catch (error) {
      toast.error("Error removing permissions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEditPermission = (permission: string) => {
    setEditPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  // Group permissions by module for the edit modal
  const groupedPermissions = groupPermissionsByModule(allPermissions);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-slate-800">
        Permission Management
      </h2>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-slate-200">
        <h3 className="text-xl font-medium mb-4 text-slate-800">
          Roles Overview
        </h3>
        {loading ? (
          <div className="text-center py-4">Loading roles...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Users Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableRoles.map((role) => (
                  <tr key={role}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                      {role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {rolePermissions[role]?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {userCounts[role] || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="mr-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm"
                        onClick={() => handleEditRole(role)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition disabled:opacity-50 text-sm"
                        onClick={() => handleDeleteRole(role)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {showModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h5 className="text-lg font-medium text-slate-800">
                Edit Permissions for Role: {editingRole}
              </h5>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-700 text-2xl"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="permission-modules">
                {Object.entries(groupedPermissions).map(
                  ([module, permissions]) => (
                    <div key={module} className="mb-6">
                      <h6 className="font-medium uppercase text-slate-600 mb-3">
                        {module}
                      </h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`perm-${permission}`}
                              checked={editPermissions[permission] || false}
                              onChange={() => toggleEditPermission(permission)}
                              disabled={loading}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label
                              className="ml-2 block text-sm text-slate-700"
                              htmlFor={`perm-${permission}`}
                            >
                              {permission}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="border-t border-slate-200 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition disabled:opacity-50"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50"
                onClick={handleSavePermissions}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Permission Assignment (kept for backward compatibility) */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6 border border-slate-200">
        <h3 className="text-xl font-medium mb-2 text-slate-800">
          Assign Individual Permission
        </h3>
        <p className="text-slate-600 mb-4">
          Use this section to assign a single permission to a role
        </p>
        {/* ... existing form code ... */}
      </div>
    </div>
  );
};

export default AdminPermissionManager;
