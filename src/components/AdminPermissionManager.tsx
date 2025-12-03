import React, { useState, useEffect } from "react";
import {
  getAllPermissions,
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole,
} from "../services/permissionService";

const AdminPermissionManager: React.FC = () => {
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [availableRoles] = useState<string[]>(["admin", "coach", "user"]);
  const [newPermission, setNewPermission] = useState<{
    role: string;
    permission: string;
  }>({ role: "", permission: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Load all permissions on component mount
  useEffect(() => {
    loadAllPermissions();
    loadRolePermissions(selectedRole);
  }, []);

  const loadAllPermissions = async () => {
    try {
      const permissions = await getAllPermissions();
      setAllPermissions(permissions);
    } catch (error) {
      setMessage("Error loading permissions");
      console.error(error);
    }
  };

  const loadRolePermissions = async (roleName: string) => {
    try {
      setLoading(true);
      const permissions = await getRolePermissions(roleName);
      setRolePermissions(permissions);
    } catch (error) {
      setMessage("Error loading role permissions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value;
    setSelectedRole(role);
    loadRolePermissions(role);
  };

  const handleAssignPermission = async () => {
    if (!newPermission.role || !newPermission.permission) {
      setMessage("Please select both role and permission");
      return;
    }

    try {
      setLoading(true);
      await assignPermissionToRole(
        newPermission.role,
        newPermission.permission
      );
      setMessage(`Permission assigned successfully`);

      // Refresh the role permissions if we're viewing the same role
      if (newPermission.role === selectedRole) {
        loadRolePermissions(selectedRole);
      }

      // Reset form
      setNewPermission({ role: "", permission: "" });
    } catch (error) {
      setMessage("Error assigning permission");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePermission = async (permissionName: string) => {
    try {
      setLoading(true);
      await removePermissionFromRole(selectedRole, permissionName);
      setMessage(`Permission removed successfully`);

      // Refresh the role permissions
      loadRolePermissions(selectedRole);
    } catch (error) {
      setMessage("Error removing permission");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="permission-manager">
      <h2>Permission Management</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="card">
        <h3>Assign Permission to Role</h3>
        <div className="form-group">
          <label>Role:</label>
          <select
            value={newPermission.role}
            onChange={(e) =>
              setNewPermission({ ...newPermission, role: e.target.value })
            }
            disabled={loading}
          >
            <option value="">Select Role</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Permission:</label>
          <select
            value={newPermission.permission}
            onChange={(e) =>
              setNewPermission({ ...newPermission, permission: e.target.value })
            }
            disabled={loading}
          >
            <option value="">Select Permission</option>
            {allPermissions.map((permission) => (
              <option key={permission} value={permission}>
                {permission}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAssignPermission}
          disabled={loading || !newPermission.role || !newPermission.permission}
          className="btn btn-primary"
        >
          {loading ? "Assigning..." : "Assign Permission"}
        </button>
      </div>

      <div className="card">
        <h3>View Role Permissions</h3>
        <div className="form-group">
          <label>Select Role:</label>
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            disabled={loading}
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <h4>Permissions for {selectedRole}:</h4>
            {rolePermissions.length === 0 ? (
              <p>No permissions assigned to this role</p>
            ) : (
              <ul className="permission-list">
                {rolePermissions.map((permission) => (
                  <li key={permission} className="permission-item">
                    <span>{permission}</span>
                    <button
                      onClick={() => handleRemovePermission(permission)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPermissionManager;
