import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { fmtDateTime } from "../../services/format";

export default function MyAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [noteLoading, setNoteLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/appointments/patient");
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

  const viewNote = async (appointmentId) => {
    try {
      setNoteLoading(true);
      const { data } = await api.get(`/notes/${appointmentId}`);
      setActiveNote(data.note);
      if (!data.note) toast.info("No consultation note for this appointment yet.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load note");
    } finally {
      setNoteLoading(false);
    }
  };

  const columns = [
    { key: "doctor", header: "Doctor", render: (r) => r.doctorId?.userId?.name || "-" },
    { key: "specialization", header: "Specialization", render: (r) => r.doctorId?.specialization || "-" },
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
        <button className="btn btn-outline-secondary btn-sm" onClick={() => viewNote(r._id)} disabled={noteLoading}>
          View Note
        </button>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <Card title="My appointments" subtitle="Booked and completed appointments">
          <DataTable columns={columns} rows={appointments.map((a) => ({ ...a, id: a._id }))} />
        </Card>
      </div>
      <div className="col-lg-4">
        <Card title="Consultation note">
          {noteLoading ? (
            <LoadingSpinner />
          ) : activeNote ? (
            <>
              <div className="fw-semibold mb-1">Diagnosis</div>
              <div className="mb-3">{activeNote.diagnosis}</div>
              <div className="fw-semibold mb-1">Notes</div>
              <div className="text-muted">{activeNote.notes}</div>
            </>
          ) : (
            <div className="text-muted">Select an appointment to view its consultation note.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

