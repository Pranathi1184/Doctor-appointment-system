import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { fmtDateTime } from "../../services/format";

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [appointmentRes, notificationRes] = await Promise.all([
          api.get("/appointments/doctor"),
          api.get("/notifications/me")
        ]);
        if (!mounted) return;
        setAppointments(appointmentRes.data.appointments || []);
        setNotifications(notificationRes.data.notifications || []);
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

  const counts = useMemo(() => {
    const booked = appointments.filter((a) => a.status === "booked").length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    return { total: appointments.length, booked, completed };
  }, [appointments]);

  const next = useMemo(
    () => appointments.filter((a) => a.status === "booked").slice(0, 5),
    [appointments]
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row g-3">
      {notifications.length > 0 ? (
        <div className="col-12">
          <Card title="Notifications" subtitle="Important availability updates" accent="blue">
            <div className="d-flex flex-column gap-2">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification._id} className="alert alert-warning mb-0">
                  {notification.message}
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
      <div className="col-md-4">
        <Card title="Appointments">
          <div className="display-6">{counts.total}</div>
          <div className="text-muted">Total assigned</div>
        </Card>
      </div>
      <div className="col-md-4">
        <Card title="Booked">
          <div className="display-6">{counts.booked}</div>
          <div className="text-muted">Pending consultations</div>
        </Card>
      </div>
      <div className="col-md-4">
        <Card title="Completed">
          <div className="display-6">{counts.completed}</div>
          <div className="text-muted">Notes added</div>
        </Card>
      </div>

      <div className="col-12">
        <Card title="Next appointments" subtitle="Your next 5 booked appointments">
          {next.length === 0 ? (
            <div className="text-muted">No upcoming appointments.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {next.map((a) => (
                    <tr key={a._id}>
                      <td>{a.patientId?.userId?.name}</td>
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
    </div>
  );
}

