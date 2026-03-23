import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import ConfirmModal from "../../components/ConfirmModal";
import api from "../../services/api";
import Modal from "../../components/Modal";
import { IconEdit, IconTrash, IconUsers } from "../../components/Icons";

export default function ManageDoctors() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [editDoctor, setEditDoctor] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: "",
    availableSlots: ""
  });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/doctors");
      setDoctors(data.doctors || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.specialization || !form.experience) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        specialization: form.specialization,
        experience: Number(form.experience),
        availableSlots: form.availableSlots
          ? form.availableSlots.split(",").map((s) => s.trim()).filter(Boolean)
          : []
      };
      await api.post("/admin/doctors", payload);
      toast.success("Doctor created.");
      setForm({ name: "", email: "", password: "", specialization: "", experience: "", availableSlots: "" });
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create doctor");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (doctor) => {
    setEditDoctor({
      _id: doctor._id,
      name: doctor.userId?.name || "",
      email: doctor.userId?.email || "",
      specialization: doctor.specialization || "",
      experience: doctor.experience ?? "",
      availableSlots: (doctor.availableSlots || []).join(", ")
    });
  };

  const saveEdit = async () => {
    if (!editDoctor) return;
    if (!editDoctor.name || !editDoctor.email || !editDoctor.specialization || editDoctor.experience === "") {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: editDoctor.name,
        email: editDoctor.email,
        specialization: editDoctor.specialization,
        experience: Number(editDoctor.experience),
        availableSlots: editDoctor.availableSlots
          ? editDoctor.availableSlots.split(",").map((s) => s.trim()).filter(Boolean)
          : []
      };
      await api.put(`/admin/doctors/${editDoctor._id}`, payload);
      toast.success("Doctor updated.");
      setEditDoctor(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update doctor");
    } finally {
      setSaving(false);
    }
  };

  const deleteDoctor = async () => {
    if (!selectedDoctor) return;
    try {
      setSaving(true);
      await api.delete(`/admin/doctors/${selectedDoctor._id}`);
      toast.success("Doctor removed from availability and notifications sent.");
      setSelectedDoctor(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove doctor");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name", header: "Name", render: (row) => row.userId?.name || "-" },
    { key: "email", header: "Email", render: (row) => row.userId?.email || "-" },
    { key: "specialization", header: "Specialization" },
    { key: "experience", header: "Experience (yrs)", render: (row) => row.experience },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`badge ${row.isActive === false ? "text-bg-secondary" : "text-bg-success"}`}>
          {row.isActive === false ? "Inactive" : "Active"}
        </span>
      )
    },
    {
      key: "slots",
      header: "Slots",
      render: (row) => (row.availableSlots || []).slice(0, 2).join(" | ") || "-"
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-end",
      render: (row) => (
        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#editDoctorModal"
            onClick={() => openEdit(row)}
            disabled={saving || row.isActive === false}
          >
            <span className="d-inline-flex align-items-center gap-1">
              <IconEdit size={16} /> Edit
            </span>
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#confirmDeleteDoctor"
            onClick={() => setSelectedDoctor(row)}
            disabled={saving || row.isActive === false}
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
    <div className="row g-3">
      <div className="col-lg-7">
        <Card
          title="Doctors"
          subtitle="All registered doctors"
          right={
            <span className="badge text-bg-light border d-inline-flex align-items-center gap-1">
              <IconUsers size={16} /> {doctors.length}
            </span>
          }
        >
          <DataTable columns={columns} rows={doctors.map((doctor) => ({ ...doctor, id: doctor._id }))} />
        </Card>
      </div>
      <div className="col-lg-5">
        <Card title="Add doctor" subtitle="Create a doctor login + profile">
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Experience (years) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.experience}
                    onChange={(e) => setForm((current) => ({ ...current, experience: e.target.value }))}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
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
                value={form.password}
                onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Specialization <span className="text-danger">*</span>
              </label>
              <input
                className="form-control"
                value={form.specialization}
                onChange={(e) => setForm((current) => ({ ...current, specialization: e.target.value }))}
                disabled={saving}
                placeholder="e.g. Cardiologist"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Available slots (comma-separated)</label>
              <input
                className="form-control"
                value={form.availableSlots}
                onChange={(e) => setForm((current) => ({ ...current, availableSlots: e.target.value }))}
                disabled={saving}
                placeholder="Mon 10:00-12:00, Wed 14:00-16:00"
              />
            </div>
            <button className="btn btn-primary w-100" disabled={saving} type="submit">
              {saving ? "Creating..." : "Create Doctor"}
            </button>
          </form>
        </Card>
      </div>

      <Modal
        id="editDoctorModal"
        title="Edit doctor"
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
        {!editDoctor ? (
          <div className="text-muted">Select a doctor to edit.</div>
        ) : (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={editDoctor.name}
                onChange={(e) => setEditDoctor((current) => ({ ...current, name: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={editDoctor.email}
                onChange={(e) => setEditDoctor((current) => ({ ...current, email: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Specialization</label>
              <input
                className="form-control"
                value={editDoctor.specialization}
                onChange={(e) => setEditDoctor((current) => ({ ...current, specialization: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Experience (years)</label>
              <input
                type="number"
                className="form-control"
                value={editDoctor.experience}
                onChange={(e) => setEditDoctor((current) => ({ ...current, experience: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Available slots (comma-separated)</label>
              <input
                className="form-control"
                value={editDoctor.availableSlots}
                onChange={(e) => setEditDoctor((current) => ({ ...current, availableSlots: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        id="confirmDeleteDoctor"
        title="Delete doctor"
        body={
          selectedDoctor ? (
            <div>
              {selectedDoctor.userId?.name} will no longer be available for booking. Doctors and affected patients
              will be notified to look for another doctor.
            </div>
          ) : (
            "Are you sure?"
          )
        }
        confirmText="Delete"
        onConfirm={deleteDoctor}
      />
    </div>
  );
}
