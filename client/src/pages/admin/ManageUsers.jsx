import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import ConfirmModal from "../../components/ConfirmModal";
import api from "../../services/api";

export default function ManageUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteUser = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/admin/users/${selectedUser._id}`);
      toast.success("User deleted.");
      setSelectedUser(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete user");
    }
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", render: (r) => <span className="badge text-bg-light border">{r.role}</span> },
    {
      key: "actions",
      header: "Actions",
      className: "text-end",
      render: (r) =>
        r.role === "admin" ? (
          <span className="text-muted small">Protected</span>
        ) : (
          <button
            className="btn btn-outline-danger btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#confirmDeleteUser"
            onClick={() => setSelectedUser(r)}
          >
            Delete
          </button>
        )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Card title="Users" subtitle="All registered users (admin/doctor/patient)">
        <DataTable columns={columns} rows={users.map((u) => ({ ...u, id: u._id }))} />
      </Card>

      <ConfirmModal
        id="confirmDeleteUser"
        title="Delete user"
        body={
          selectedUser ? (
            <div>
              Are you sure you want to delete <b>{selectedUser.name}</b> ({selectedUser.email})?
            </div>
          ) : (
            "Are you sure?"
          )
        }
        confirmText="Delete"
        onConfirm={deleteUser}
      />
    </>
  );
}

