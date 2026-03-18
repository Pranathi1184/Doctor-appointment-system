import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { fmtDateTime } from "../../services/format";
import Modal from "../../components/Modal";
import { IconCalendar, IconTrash } from "../../components/Icons";

const DAY_ALIASES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map((x) => Number(x));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function parseSlot(slot) {
  const raw = String(slot || "").trim();
  const [dayPart, timePart] = raw.split(/\s+/, 2);
  if (!dayPart || !timePart) return null;
  const day = dayPart.slice(0, 3).toLowerCase();
  const [startStr, endStr] = timePart.split("-");
  const start = timeToMinutes(startStr);
  const end = timeToMinutes(endStr);
  if (!DAY_ALIASES.includes(day) || start === null || end === null || end <= start) return null;
  return { day, start, end };
}

function buildTimeOptionsForDay(availableSlots, dayAlias, stepMinutes = 30) {
  const parsed = (availableSlots || []).map(parseSlot).filter(Boolean).filter((s) => s.day === dayAlias);
  const options = [];
  parsed.forEach((s) => {
    for (let t = s.start; t + stepMinutes <= s.end; t += stepMinutes) options.push(minutesToHHMM(t));
  });
  return Array.from(new Set(options)).sort();
}

export default function MyAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reschedule, setReschedule] = useState({ appt: null, dateOnly: "", timeOnly: "" });

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

  const cancel = async (a) => {
    try {
      setSaving(true);
      await api.patch(`/appointments/${a._id}/cancel`);
      toast.success("Appointment cancelled.");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setSaving(false);
    }
  };

  const openReschedule = (a) => {
    const d = new Date(a.date);
    const dateOnly = Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
    setReschedule({ appt: a, dateOnly, timeOnly: "" });
  };

  const timeOptions = useMemo(() => {
    const a = reschedule.appt;
    if (!a || !reschedule.dateOnly) return [];
    const d = new Date(`${reschedule.dateOnly}T00:00`);
    if (Number.isNaN(d.getTime())) return [];
    const dayAlias = DAY_ALIASES[d.getDay()];
    return buildTimeOptionsForDay(a.doctorId?.availableSlots, dayAlias, 30);
  }, [reschedule.appt, reschedule.dateOnly]);

  useEffect(() => {
    if (!reschedule.timeOnly && timeOptions.length) {
      setReschedule((s) => ({ ...s, timeOnly: timeOptions[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeOptions.join("|")]);

  const saveReschedule = async () => {
    const a = reschedule.appt;
    if (!a) return;
    if (!reschedule.dateOnly || !reschedule.timeOnly) return toast.error("Please choose date and time.");
    try {
      setSaving(true);
      const date = `${reschedule.dateOnly}T${reschedule.timeOnly}`;
      await api.patch(`/appointments/${a._id}/reschedule`, { date });
      toast.success("Appointment rescheduled.");
      setReschedule({ appt: null, dateOnly: "", timeOnly: "" });
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reschedule appointment");
    } finally {
      setSaving(false);
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
        <span
          className={`badge ${
            r.status === "completed" ? "text-bg-success" : r.status === "cancelled" ? "text-bg-secondary" : "text-bg-primary"
          }`}
        >
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
          <button className="btn btn-outline-secondary btn-sm" onClick={() => viewNote(r._id)} disabled={noteLoading}>
            View Note
          </button>
          {r.status === "booked" ? (
            <>
              <button
                className="btn btn-outline-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#rescheduleModal"
                onClick={() => openReschedule(r)}
                disabled={saving}
              >
                Reschedule
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => cancel(r)} disabled={saving}>
                <span className="d-inline-flex align-items-center gap-1">
                  <IconTrash size={16} /> Cancel
                </span>
              </button>
            </>
          ) : null}
        </div>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <Card
          title={
            <span className="d-inline-flex align-items-center gap-2">
              <IconCalendar size={18} /> My appointments
            </span>
          }
          subtitle="Booked, completed, and cancelled appointments"
        >
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

      <Modal
        id="rescheduleModal"
        title="Reschedule appointment"
        footer={
          <>
            <button type="button" className="btn btn-light" data-bs-dismiss="modal" disabled={saving}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-bs-dismiss="modal"
              onClick={saveReschedule}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        {!reschedule.appt ? (
          <div className="text-muted">Select an appointment to reschedule.</div>
        ) : (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">New date</label>
              <input
                type="date"
                className="form-control"
                value={reschedule.dateOnly}
                onChange={(e) => setReschedule((s) => ({ ...s, dateOnly: e.target.value, timeOnly: "" }))}
                disabled={saving}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">New time</label>
              <select
                className="form-select"
                value={reschedule.timeOnly}
                onChange={(e) => setReschedule((s) => ({ ...s, timeOnly: e.target.value }))}
                disabled={saving || !reschedule.dateOnly}
              >
                <option value="">{timeOptions.length ? "Select time..." : "No available times"}</option>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="small text-muted mt-1">Validated against doctor slots and leave days.</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

