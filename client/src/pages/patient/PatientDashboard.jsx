import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { fmtDateTime } from "../../services/format";

export default function PatientDashboard() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [aRes, dRes] = await Promise.all([api.get("/appointments/patient"), api.get("/doctors")]);
        if (!mounted) return;
        setAppointments(aRes.data.appointments || []);
        setDoctorsCount((dRes.data.doctors || []).length);
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

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <Card title="Doctors">
          <div className="display-6">{doctorsCount}</div>
          <div className="text-muted">Available specialists</div>
        </Card>
      </div>
      <div className="col-md-4">
        <Card title="Appointments">
          <div className="display-6">{appointments.length}</div>
          <div className="text-muted">Total booked/completed</div>
        </Card>
      </div>
      <div className="col-md-4">
        <Card title="Upcoming">
          <div className="display-6">{upcoming.length}</div>
          <div className="text-muted">Next appointments</div>
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
    </div>
  );
}

