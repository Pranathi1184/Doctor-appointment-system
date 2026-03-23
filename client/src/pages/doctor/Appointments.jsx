import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { fmtDateTime } from "../../services/format";
import Modal from "../../components/Modal";
import { IconUsers } from "../../components/Icons";

export default function DoctorAppointments() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null); // note | rx | followup
  const [noteId, setNoteId] = useState(null);
  const [patientModal, setPatientModal] = useState({ loading: false, data: null });

  const [noteForm, setNoteForm] = useState({ diagnosis: "", notes: "" });
  const [rxForm, setRxForm] = useState({ medicineName: "", dosage: "", duration: "", instructions: "" });
  const [fuForm, setFuForm] = useState({ recommendedDate: "", notes: "" });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/appointments/doctor");
      setAppointments(data.appointments || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => appointments.map((a) => ({ ...a, id: a._id })), [appointments]);

  const startNote = (a) => {
    setSelected(a);
    setMode("note");
    setNoteId(null);
    setNoteForm({ diagnosis: "", notes: "" });
  };

  const startRx = async (a) => {
    try {
      setSaving(true);
      const { data } = await api.get(`/notes/${a._id}`);
      if (!data.note) {
        toast.info("Add consultation note first, then create prescription.");
        return;
      }
      setSelected(a);
      setMode("rx");
      setNoteId(data.note._id);
      setRxForm({ medicineName: "", dosage: "", duration: "", instructions: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load note");
    } finally {
      setSaving(false);
    }
  };

  const startFollowUp = (a) => {
    setSelected(a);
    setMode("followup");
    setFuForm({ recommendedDate: "", notes: "" });
  };

  const viewPatient = async (a) => {
    try {
      setPatientModal({ loading: true, data: null });
      const patientId = a.patientId?._id;
      const { data } = await api.get(`/patients/${patientId}`);
      setPatientModal({ loading: false, data: data.patient });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load patient profile");
      setPatientModal({ loading: false, data: null });
    }
  };

  const saveNote = async (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!noteForm.diagnosis.trim() || !noteForm.notes.trim()) {
      toast.error("Diagnosis and notes are required.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/notes", { appointmentId: selected._id, ...noteForm });
      toast.success("Consultation note saved.");
      setMode(null);
      setSelected(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const saveRx = async (e) => {
    e.preventDefault();
    if (!noteId) return toast.error("Note not found for this appointment.");
    const { medicineName, dosage, duration, instructions } = rxForm;
    if (!medicineName || !dosage || !duration || !instructions) {
      toast.error("All prescription fields are required.");
      return;
    }
    try {
      setSaving(true);
      await api.post("/prescriptions", { noteId, ...rxForm });
      toast.success("Prescription added.");
      setMode(null);
      setSelected(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add prescription");
    } finally {
      setSaving(false);
    }
  };

  const saveFollowUp = async (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!fuForm.recommendedDate || !fuForm.notes.trim()) {
      toast.error("Recommended date and notes are required.");
      return;
    }
    try {
      setSaving(true);
      const { data } = await api.post("/followups", { appointmentId: selected._id, ...fuForm });
      toast.success(data.message || "Follow-up added.");
      setMode(null);
      setSelected(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add follow-up");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "patient", header: "Patient", render: (r) => r.patientId?.userId?.name || "-" },
    { key: "date", header: "Date", render: (r) => fmtDateTime(r.date) },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span className={`badge ${r.status === "completed" ? "text-bg-success" : "text-bg-primary"}`}>
          {r.status}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-end",
      render: (r) => (
        <div className="d-flex justify-content-end gap-2 flex-wrap">
          <button
            className="btn btn-outline-dark btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#patientProfileModal"
            onClick={() => viewPatient(r)}
            disabled={saving}
          >
            <span className="d-inline-flex align-items-center gap-1">
              <IconUsers size={16} /> Patient
            </span>
          </button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => startNote(r)} disabled={saving}>
            Add Note
          </button>
          <button className="btn btn-outline-success btn-sm" onClick={() => startRx(r)} disabled={saving}>
            Add Prescription
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => startFollowUp(r)} disabled={saving}>
            Add Follow-up
          </button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <Card title="Appointments" subtitle="Your booked and completed appointments">
          <DataTable columns={columns} rows={rows} />
        </Card>
      </div>
      <div className="col-lg-4">
        <Card
          title={
            mode === "note" ? "Add consultation note" : mode === "rx" ? "Add prescription" : mode === "followup" ? "Add follow-up" : "Action panel"
          }
          subtitle={selected ? `For: ${selected.patientId?.userId?.name} · ${fmtDateTime(selected.date)}` : "Select an action from the table"}
        >
          {!mode ? (
            <div className="text-muted">Use the action buttons to add notes, prescriptions, or follow-ups.</div>
          ) : mode === "note" ? (
            <form onSubmit={saveNote}>
              <div className="mb-3">
                <label className="form-label">Diagnosis</label>
                <input
                  className="form-control"
                  value={noteForm.diagnosis}
                  onChange={(e) => setNoteForm((f) => ({ ...f, diagnosis: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={noteForm.notes}
                  onChange={(e) => setNoteForm((f) => ({ ...f, notes: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <button className="btn btn-primary w-100" disabled={saving} type="submit">
                {saving ? "Saving..." : "Save Note"}
              </button>
            </form>
          ) : mode === "rx" ? (
            <form onSubmit={saveRx}>
              <div className="mb-3">
                <label className="form-label">Medicine name</label>
                <input
                  className="form-control"
                  value={rxForm.medicineName}
                  onChange={(e) => setRxForm((f) => ({ ...f, medicineName: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Dosage</label>
                <input
                  className="form-control"
                  value={rxForm.dosage}
                  onChange={(e) => setRxForm((f) => ({ ...f, dosage: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Duration</label>
                <input
                  className="form-control"
                  value={rxForm.duration}
                  onChange={(e) => setRxForm((f) => ({ ...f, duration: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Instructions</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={rxForm.instructions}
                  onChange={(e) => setRxForm((f) => ({ ...f, instructions: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <button className="btn btn-success w-100" disabled={saving} type="submit">
                {saving ? "Saving..." : "Add Prescription"}
              </button>
            </form>
          ) : (
            <form onSubmit={saveFollowUp}>
              <div className="mb-3">
                <label className="form-label">Recommended date</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={fuForm.recommendedDate}
                  onChange={(e) => setFuForm((f) => ({ ...f, recommendedDate: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={fuForm.notes}
                  onChange={(e) => setFuForm((f) => ({ ...f, notes: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="small text-muted mb-3">
                If this date falls outside your configured slots, the patient will be told to book at the next
                available timing.
              </div>
              <button className="btn btn-secondary w-100" disabled={saving} type="submit">
                {saving ? "Saving..." : "Add Follow-up"}
              </button>
            </form>
          )}
          {mode ? (
            <button className="btn btn-link w-100 mt-2" type="button" onClick={() => setMode(null)} disabled={saving}>
              Cancel
            </button>
          ) : null}
        </Card>
      </div>

      <Modal
        id="patientProfileModal"
        title="Patient profile"
        footer={
          <button type="button" className="btn btn-light" data-bs-dismiss="modal">
            Close
          </button>
        }
      >
        {patientModal.loading ? (
          <LoadingSpinner />
        ) : patientModal.data ? (
          <div className="row g-3">
            <div className="col-md-6">
              <div className="text-muted small">Name</div>
              <div className="fw-semibold">{patientModal.data.userId?.name}</div>
            </div>
            <div className="col-md-6">
              <div className="text-muted small">Email</div>
              <div className="fw-semibold">{patientModal.data.userId?.email}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small">Age</div>
              <div className="fw-semibold">{patientModal.data.age}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small">Gender</div>
              <div className="fw-semibold">{patientModal.data.gender}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small">Contact</div>
              <div className="fw-semibold">{patientModal.data.contact}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small">Blood group</div>
              <div className="fw-semibold">{patientModal.data.medicalDetails?.bloodGroup || "-"}</div>
            </div>
            <div className="col-md-8">
              <div className="text-muted small">Allergies</div>
              <div className="fw-semibold">{patientModal.data.medicalDetails?.allergies || "-"}</div>
            </div>
            <div className="col-12">
              <div className="text-muted small">Conditions</div>
              <div className="fw-semibold">{patientModal.data.medicalDetails?.conditions || "-"}</div>
            </div>
            <div className="col-12">
              <div className="text-muted small">Medical notes</div>
              <div className="text-muted">{patientModal.data.medicalDetails?.notes || "-"}</div>
            </div>
          </div>
        ) : (
          <div className="text-muted">No data.</div>
        )}
      </Modal>
    </div>
  );
}

