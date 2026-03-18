import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { fmtDateTime } from "../../services/format";
import { IconCalendar, IconStethoscope } from "../../components/Icons";

export default function PatientDashboard() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [reminders, setReminders] = useState({ overdue: [], upcoming: [] });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [aRes, dRes, rRes] = await Promise.all([
          api.get("/appointments/patient"),
          api.get("/doctors"),
          api.get("/followups/me/reminders")
        ]);
        if (!mounted) return;
        setAppointments(aRes.data.appointments || []);
        setDoctorsCount((dRes.data.doctors || []).length);
        setReminders({ overdue: rRes.data.overdue || [], upcoming: rRes.data.upcoming || [] });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const upcoming = useMemo(
    () => appointments.filter((a) => a.status === "booked").slice(0, 5),
    [appointments]
  );

  if (loading) return <LoadingSpinner />;

  const formatDateOnly = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <Card
          title={
            <span className="d-inline-flex align-items-center gap-2">
              <IconStethoscope size={18} /> Doctors
            </span>
          }
        >
          <div className="display-6">{doctorsCount}</div>
          <div className="text-muted">Available specialists</div>
        </Card>
      </div>
      <div className="col-md-4">
        <Card
          title={
            <span className="d-inline-flex align-items-center gap-2">
              <IconCalendar size={18} /> Appointments
            </span>
          }
          accent="blue"
        >
          <div className="display-6">{appointments.length}</div>
          <div className="text-muted">Total booked/completed</div>
        </Card>
      </div>
      <div className="col-md-4">
        <Card title="Follow-up reminders" subtitle="Next 7 days + overdue" accent="teal">
          <div className="d-flex align-items-end justify-content-between">
            <div>
              <div className="display-6">{(reminders.upcoming?.length || 0) + (reminders.overdue?.length || 0)}</div>
              <div className="text-muted">Items to review</div>
            </div>
            <div className="text-end small">
              <div>
                <span className="badge text-bg-warning me-1">Overdue</span>
                {reminders.overdue?.length || 0}
              </div>
              <div className="mt-1">
                <span className="badge text-bg-info me-1">Upcoming</span>
                {reminders.upcoming?.length || 0}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12">
        <Card title="Upcoming appointments" subtitle="Your next 5 booked appointments">
          {upcoming.length === 0 ? (
            <div className="text-muted">No upcoming appointments.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((a) => (
                    <tr key={a._id}>
                      <td>{a.doctorId?.userId?.name}</td>
                      <td>{a.doctorId?.specialization}</td>
                      <td>{fmtDateTime(a.date)}</td>
                      <td>
                        <span className="badge text-bg-primary">{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <div className="col-12">
        <Card title="Follow-up reminders" subtitle="Book recommended follow-ups directly from here" accent="blue">
          {reminders.overdue.length === 0 && reminders.upcoming.length === 0 ? (
            <div className="text-muted">No reminders right now.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Recommended date</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...reminders.overdue, ...reminders.upcoming].slice(0, 8).map((f) => {
                    const doctor = f.appointmentId?.doctorId;
                    const docName = doctor?.userId?.name || "Doctor";
                    const dateOnly = formatDateOnly(f.recommendedDate);
                    const status = reminders.overdue.some((o) => o._id === f._id) ? "overdue" : "upcoming";
                    return (
                      <tr key={f._id}>
                        <td>
                          <div className="fw-semibold">{docName}</div>
                          <div className="text-muted small">{doctor?.specialization || "-"}</div>
                        </td>
                        <td>{fmtDateTime(f.recommendedDate)}</td>
                        <td>
                          <span className={`badge ${status === "overdue" ? "text-bg-warning" : "text-bg-info"}`}>
                            {status}
                          </span>
                        </td>
                        <td className="text-muted">{f.notes}</td>
                        <td className="text-end">
                          {doctor?._id ? (
                            <Link
                              className="btn btn-sm btn-primary"
                              to={`/patient/book?doctorId=${doctor._id}&date=${dateOnly}`}
                            >
                              Book follow-up
                            </Link>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="small text-muted mt-2">Showing up to 8 reminders.</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

