import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { IconCalendar, IconUsers } from "../../components/Icons";

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
  // Example: "Mon 10:00-12:00"
  const raw = String(slot || "").trim();
  const [dayPart, timePart] = raw.split(/\s+/, 2);
  if (!dayPart || !timePart) return null;
  const day = dayPart.slice(0, 3).toLowerCase();
  const [startStr, endStr] = timePart.split("-");
  const start = timeToMinutes(startStr);
  const end = timeToMinutes(endStr);
  if (!DAY_ALIASES.includes(day) || start === null || end === null || end <= start) return null;
  return { day, start, end, label: raw };
}

function buildTimeOptionsForDay(availableSlots, dayAlias, stepMinutes = 30) {
  const parsed = (availableSlots || []).map(parseSlot).filter(Boolean).filter((s) => s.day === dayAlias);
  const options = [];
  parsed.forEach((s) => {
    for (let t = s.start; t + stepMinutes <= s.end; t += stepMinutes) {
      options.push(minutesToHHMM(t));
    }
  });
  // unique + sorted
  return Array.from(new Set(options)).sort();
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const query = useQuery();
  const preDoctorId = query.get("doctorId") || "";
  const preDate = query.get("date") || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: preDoctorId, dateOnly: preDate, timeOnly: "" });
  const [errors, setErrors] = useState({});

  const selectedDoctor = useMemo(
    () => doctors.find((d) => String(d._id) === String(form.doctorId)) || null,
    [doctors, form.doctorId]
  );

  const timeOptions = useMemo(() => {
    if (!selectedDoctor || !form.dateOnly) return [];
    const d = new Date(`${form.dateOnly}T00:00`);
    if (Number.isNaN(d.getTime())) return [];
    const dayAlias = DAY_ALIASES[d.getDay()];
    return buildTimeOptionsForDay(selectedDoctor.availableSlots, dayAlias, 30);
  }, [selectedDoctor, form.dateOnly]);

  useEffect(() => {
    // If date/doctor is prefilled (or changed), auto-pick the first available time
    if (!form.timeOnly && timeOptions.length) {
      setForm((f) => ({ ...f, timeOnly: timeOptions[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeOptions.join("|")]);

  const appointmentDateTime = useMemo(() => {
    if (!form.dateOnly || !form.timeOnly) return "";
    // "YYYY-MM-DDTHH:mm" (works well with backend new Date(...))
    return `${form.dateOnly}T${form.timeOnly}`;
  }, [form.dateOnly, form.timeOnly]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/doctors");
        if (!mounted) return;
        setDoctors(data.doctors || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load doctors");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // reset time when doctor/date changes so user can't keep an invalid time
    setForm((f) => ({ ...f, timeOnly: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.doctorId, form.dateOnly]);

  const validate = () => {
    const next = {};
    if (!form.doctorId) next.doctorId = "Please select a doctor";
    if (!form.dateOnly) next.dateOnly = "Please pick a date";
    if (!form.timeOnly) next.timeOnly = "Please select a time";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      await api.post("/appointments", { doctorId: form.doctorId, date: appointmentDateTime });
      toast.success("Appointment booked!");
      navigate("/patient/appointments");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Booking failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <Card
          title={
            <span className="d-inline-flex align-items-center gap-2">
              <IconCalendar size={18} /> Book appointment
            </span>
          }
          subtitle="Choose a doctor and a time within their available slots"
        >
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Doctor <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors.doctorId ? "is-invalid" : ""}`}
                value={form.doctorId}
                onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
                disabled={saving}
              >
                <option value="">Select a doctor...</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.userId?.name} — {d.specialization}
                  </option>
                ))}
              </select>
              {errors.doctorId ? <div className="invalid-feedback">{errors.doctorId}</div> : null}
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Appointment date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${errors.dateOnly ? "is-invalid" : ""}`}
                  value={form.dateOnly}
                  onChange={(e) => setForm((f) => ({ ...f, dateOnly: e.target.value }))}
                  disabled={saving}
                />
                {errors.dateOnly ? <div className="invalid-feedback">{errors.dateOnly}</div> : null}
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Appointment time <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.timeOnly ? "is-invalid" : ""}`}
                  value={form.timeOnly}
                  onChange={(e) => setForm((f) => ({ ...f, timeOnly: e.target.value }))}
                  disabled={saving || !selectedDoctor || !form.dateOnly}
                >
                  <option value="">
                    {!selectedDoctor
                      ? "Select doctor first"
                      : !form.dateOnly
                        ? "Select date first"
                        : timeOptions.length
                          ? "Select a time..."
                          : "No available times"}
                  </option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.timeOnly ? <div className="invalid-feedback">{errors.timeOnly}</div> : null}
                {selectedDoctor && form.dateOnly && timeOptions.length === 0 ? (
                  <div className="small text-muted mt-1">
                    No slots match this day. Try another date or doctor.
                  </div>
                ) : null}
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Booking..." : "Book"}
            </button>
          </form>
        </Card>
      </div>

      <div className="col-lg-4">
        <Card
          title={
            <span className="d-inline-flex align-items-center gap-2">
              <IconUsers size={18} /> Doctor availability
            </span>
          }
          subtitle={selectedDoctor ? `${selectedDoctor.userId?.name} · ${selectedDoctor.specialization}` : "Select a doctor"}
        >
          {!selectedDoctor ? (
            <div className="text-muted small">Pick a doctor to see their available slots.</div>
          ) : (
            <>
              <div className="text-muted small mb-2">Available slots</div>
              <div className="d-flex flex-wrap gap-2">
                {(selectedDoctor.availableSlots || []).length === 0 ? (
                  <span className="text-muted small">No slots configured.</span>
                ) : (
                  selectedDoctor.availableSlots.map((s) => (
                    <span key={s} className="badge text-bg-light border">
                      {s}
                    </span>
                  ))
                )}
              </div>
              <div className="small text-muted mt-3">
                If you choose a time outside these slots, booking will be rejected with a message.
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

