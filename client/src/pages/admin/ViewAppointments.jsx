import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { fmtDateTime } from "../../services/format";

export default function ViewAppointments() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/admin/appointments");
        if (!mounted) return;
        setAppointments(data.appointments || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load appointments");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const columns = [
    { key: "doctor", header: "Doctor", render: (r) => r.doctorId?.userId?.name || "-" },
    { key: "patient", header: "Patient", render: (r) => r.patientId?.userId?.name || "-" },
    { key: "date", header: "Date", render: (r) => fmtDateTime(r.date) },
    { key: "status", header: "Status", render: (r) => <span className="badge text-bg-light border">{r.status}</span> }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <Card title="All appointments" subtitle="Admin view of all booked/completed appointments">
      <DataTable columns={columns} rows={appointments.map((a) => ({ ...a, id: a._id }))} />
    </Card>
  );
}

