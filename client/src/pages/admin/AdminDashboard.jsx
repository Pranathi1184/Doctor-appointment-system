import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, doctors: 0, appointments: 0 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [uRes, dRes, aRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/doctors"),
          api.get("/admin/appointments")
        ]);
        if (!mounted) return;
        setStats({
          users: (uRes.data.users || []).length,
          doctors: (dRes.data.doctors || []).length,
          appointments: (aRes.data.appointments || []).length
        });
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <Card title="Users">
          <div className="display-6">{stats.users}</div>
          <div className="text-muted">All roles</div>
        </Card>
      </div>
      <div className="col-md-4">
        <Card title="Doctors">
          <div className="display-6">{stats.doctors}</div>
          <div className="text-muted">Registered doctors</div>
        </Card>
      </div>
      <div className="col-md-4">
        <Card title="Appointments">
          <div className="display-6">{stats.appointments}</div>
          <div className="text-muted">Total booked/completed</div>
        </Card>
      </div>
      <div className="col-12">
        <Card title="Quick actions" subtitle="Use the sidebar to manage doctors, users, and appointments">
          <div className="text-muted">Seed data includes doctors and patients to demo the workflow.</div>
        </Card>
      </div>
    </div>
  );
}

