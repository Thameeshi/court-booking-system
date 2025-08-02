import React, { useEffect, useState } from "react";
import userService from "../services/domain-services/UserService";
import "../styles/AdminUsers.css"; // CSS for styling

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch user list
  async function fetchUsers() {
    try {
      const res = await userService.getUserList();
      if (res.success) {
        setUsers(res.success); // Assuming res.success contains user list
      } else {
        console.warn("Failed to load users:", res);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  // Delete user handler
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await userService.deleteUser(userId);
        console.log("Delete response:", response);

        // Check response success
        if (response.success || response.message === "User deleted successfully") {
          alert("User deleted successfully");
          fetchUsers(); // Refresh list
        } else {
          alert("Failed to delete user");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("An error occurred while deleting the user.");
      }
    }
  };

  return (
    <div className="adminUsersContainer">
      <h2 className="adminUsersTitle">All Users</h2>
      <table className="adminUsersTable">
        <thead className="adminUsersThead">
          <tr>
            <th className="adminUsersTh">Email</th>
            <th className="adminUsersTh">Name</th>
            <th className="adminUsersTh">Role</th>
            <th className="adminUsersTh">Action</th>
          </tr>
        </thead>
        <tbody className="adminUsersTbody">
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.Email}>
                <td className="adminUsersTd">{user.Email}</td>
                <td className="adminUsersTd">{user.Name}</td>
                <td className="adminUsersTd">{user.UserRole}</td>
                <td className="adminUsersTd">
                  <button
                    className="adminUsersDeleteBtn"
                    onClick={() => handleDelete(user.Id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="adminUsersTd" colSpan="4">No users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
