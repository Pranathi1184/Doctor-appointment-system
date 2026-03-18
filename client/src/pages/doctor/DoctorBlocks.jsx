import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { fmtDateTime } from "../../services/format";
import { IconCalendar, IconTrash } from "../../components/Icons";

export default function DoctorBlocks() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [form, setForm] = useState({ date: "", reason: "" });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/doctor/blocks");
      setBlocks(data.blocks || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load blocked days");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.date) return toast.error("Please choose a date.");
    try {
      setSaving(true);
      await api.post("/doctor/blocks", { date: form.date, reason: form.reason });
      toast.success("Leave/blocked day added.");
      setForm({ date: "", reason: "" });
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add blocked day");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      setSaving(true);
      await api.delete(`/doctor/blocks/${id}`);
      toast.success("Blocked day removed.");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove blocked day");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "date", header: "Date", render: (r) => fmtDateTime(r.date) },
    { key: "reason", header: "Reason", render: (r) => r.reason || "-" },
    {
      key: "actions",
      header: "Actions",
      className: "text-end",
      render: (r) => (
        <button className="btn btn-outline-danger btn-sm" onClick={() => remove(r._id)} disabled={saving}>
          <span className="d-inline-flex align-items-center gap-1">
            <IconTrash size={16} /> Remove
          </span>
        </button>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row g-3">
      <div className="col-lg-7">
        <Card
          title={
            <span className="d-inline-flex align-items-center gap-2">
              <IconCalendar size={18} /> Leave / Block days
            </span>
          }
          subtitle="Patients will not be able to book appointments on these dates"
        >
          <DataTable columns={columns} rows={blocks.map((b) => ({ ...b, id: b._id }))} />
        </Card>
      </div>
      <div className="col-lg-5">
        <Card title="Add blocked day" subtitle="Mark yourself unavailable" accent="blue">
          <form onSubmit={add}>
            <div className="mb-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Reason (optional)</label>
              <input
                className="form-control"
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                disabled={saving}
                placeholder="e.g. Conference / Leave"
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={saving}>
              {saving ? "Adding..." : "Add blocked day"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

