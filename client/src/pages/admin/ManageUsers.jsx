import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import ConfirmModal from "../../components/ConfirmModal";
import Modal from "../../components/Modal";
import api from "../../services/api";
import { IconEdit, IconTrash, IconUsers } from "../../components/Icons";

export default function ManageUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editDoctor, setEditDoctor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createAdmin, setCreateAdmin] = useState({ name: "", email: "", password: "" });

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

  const openEdit = async (u) => {
    setEditUser({ ...u });
    
    if (u.role === "doctor") {
      try {
        const { data } = await api.get(`/admin/doctors`);
        const doctorData = data.doctors.find(d => d.userId._id === u._id || d.userId === u._id);
        if (doctorData) {
          setEditDoctor({ ...doctorData });
        }
      } catch (err) {
        console.error("Failed to fetch doctor details", err);
        toast.error("Failed to load doctor details");
      }
    } else {
      setEditDoctor(null);
    }
  };

  const saveEdit = async () => {
    if (!editUser) return;
    if (!editUser.name?.trim() || !editUser.email?.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    
    if (editUser.role === "doctor" && editDoctor) {
      if (!editDoctor.specialization?.trim() || editDoctor.experience === undefined) {
        toast.error("Specialization and experience are required for doctors.");
        return;
      }
    }
    
    try {
      setSaving(true);
      
      await api.put(`/admin/users/${editUser._id}`, {
        name: editUser.name,
        email: editUser.email
      });
      
      if (editUser.role === "doctor" && editDoctor) {
        await api.put(`/admin/doctors/${editDoctor._id}`, {
          name: editUser.name,
          email: editUser.email,
          specialization: editDoctor.specialization,
          experience: editDoctor.experience,
          availableSlots: editDoctor.availableSlots
        });
      }
      
      toast.success("User updated.");
      setEditUser(null);
      setEditDoctor(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const createAdminUser = async (e) => {
    e.preventDefault();
    if (!createAdmin.name || !createAdmin.email || !createAdmin.password) {
      toast.error("Please fill all admin fields.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/admin/users", { ...createAdmin, role: "admin" });
      toast.success("Admin user created.");
      setCreateAdmin({ name: "", email: "", password: "" });
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create admin user");
    } finally {
      setSaving(false);
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
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#editUserModal"
              onClick={() => openEdit(r)}
            >
              <span className="d-inline-flex align-items-center gap-1">
                <IconEdit size={16} /> Edit
              </span>
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#confirmDeleteUser"
              onClick={() => setSelectedUser(r)}
            >
              <span className="d-inline-flex align-items-center gap-1">
                <IconTrash size={16} /> Delete
              </span>
            </button>
          </div>
        )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="row g-3">
        <div className="col-lg-8">
          <Card
            title="Users"
            subtitle="All registered users (admin/doctor/patient)"
            right={
              <span className="badge text-bg-light border d-inline-flex align-items-center gap-1">
                <IconUsers size={16} /> {users.length}
              </span>
            }
          >
            <DataTable columns={columns} rows={users.map((u) => ({ ...u, id: u._id }))} />
          </Card>
        </div>
        <div className="col-lg-4">
          <Card title="Create admin account" subtitle="Admins are created only by an admin (recommended)">
            <form onSubmit={createAdminUser}>
              <div className="mb-3">
                <label className="form-label">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  value={createAdmin.name}
                  onChange={(e) => setCreateAdmin((s) => ({ ...s, name: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={createAdmin.email}
                  onChange={(e) => setCreateAdmin((s) => ({ ...s, email: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={createAdmin.password}
                  onChange={(e) => setCreateAdmin((s) => ({ ...s, password: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <button className="btn btn-primary w-100" disabled={saving} type="submit">
                {saving ? "Creating..." : "Create Admin"}
              </button>
              <div className="small text-muted mt-2">
                Patients self-register from the Register page. Doctors should be created from <b>Manage Doctors</b>.
              </div>
            </form>
          </Card>
        </div>
      </div>

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

      <Modal
        id="editUserModal"
        title="Edit user"
        footer={
          <>
            <button type="button" className="btn btn-light" data-bs-dismiss="modal" disabled={saving}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={saveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        {!editUser ? (
          <div className="text-muted">Select a user to edit.</div>
        ) : (
          <div className="row g-3">
            {/* Common fields for all users */}
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={editUser.name}
                onChange={(e) => setEditUser((u) => ({ ...u, name: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={editUser.email}
                onChange={(e) => setEditUser((u) => ({ ...u, email: e.target.value }))}
                disabled={saving}
              />
            </div>

            {/* Doctor-specific fields */}
            {editUser.role === "doctor" && editDoctor && (
              <>
                <div className="col-md-6">
                  <label className="form-label">Specialization</label>
                  <input
                    className="form-control"
                    value={editDoctor.specialization || ""}
                    onChange={(e) => setEditDoctor((d) => ({ ...d, specialization: e.target.value }))}
                    disabled={saving}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Experience (years)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editDoctor.experience || 0}
                    onChange={(e) => setEditDoctor((d) => ({ ...d, experience: parseInt(e.target.value) }))}
                    disabled={saving}
                    min="0"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Available Slots (comma-separated)</label>
                  <input
                    className="form-control"
                    value={(editDoctor.availableSlots || []).join(", ")}
                    onChange={(e) =>
                      setEditDoctor((d) => ({
                        ...d,
                        availableSlots: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      }))
                    }
                    disabled={saving}
                    placeholder="e.g., 09:00, 10:30, 14:00"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
