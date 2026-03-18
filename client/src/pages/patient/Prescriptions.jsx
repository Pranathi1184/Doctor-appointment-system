import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { getProfile } from "../../services/auth";
import { fmtDateTime } from "../../services/format";

export default function Prescriptions() {
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [followUps, setFollowUps] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const profile = getProfile();
        const patientId = profile?.patientId;
        if (!patientId) {
          toast.error("Patient profile not found. Please log in again.");
          return;
        }

        const [pRes, fRes] = await Promise.all([
          api.get(`/prescriptions/${patientId}`),
          api.get(`/followups/${patientId}`)
        ]);
        if (!mounted) return;
        setPrescriptions(pRes.data.prescriptions || []);
        setFollowUps(fRes.data.followUps || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load prescriptions");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  const rxColumns = [
    { key: "medicineName", header: "Medicine" },
    { key: "dosage", header: "Dosage" },
    { key: "duration", header: "Duration" },
    { key: "instructions", header: "Instructions" },
    { key: "createdAt", header: "Created", render: (r) => fmtDateTime(r.createdAt) }
  ];

  const fuColumns = [
    { key: "recommendedDate", header: "Recommended date", render: (r) => fmtDateTime(r.recommendedDate) },
    { key: "notes", header: "Notes" }
  ];

  return (
    <div className="row g-3">
      <div className="col-12">
        <Card title="Prescriptions" subtitle="Your prescriptions from completed consultations">
          <DataTable columns={rxColumns} rows={prescriptions.map((p) => ({ ...p, id: p._id }))} />
        </Card>
      </div>
      <div className="col-12">
        <Card title="Follow-ups" subtitle="Recommended follow-up appointments (if any)">
          <DataTable columns={fuColumns} rows={followUps.map((f) => ({ ...f, id: f._id }))} />
        </Card>
      </div>
    </div>
  );
}

