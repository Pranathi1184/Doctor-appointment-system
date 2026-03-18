import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";

export default function DoctorList() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);

  const load = async (s = "") => {
    try {
      setLoading(true);
      const { data } = await api.get("/doctors", { params: s ? { search: s } : {} });
      setDoctors(data.doctors || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="row g-3">
      <div className="col-12">
        <Card
          title="Doctors"
          subtitle="Search and book an appointment"
          right={
            <div className="d-flex gap-2">
              <input
                className="form-control"
                style={{ width: 280 }}
                placeholder="Search specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-primary" onClick={() => load(search)}>
                Search
              </button>
            </div>
          }
        >
          {loading ? (
            <LoadingSpinner />
          ) : doctors.length === 0 ? (
            <div className="text-muted">No doctors found.</div>
          ) : (
            <div className="row g-3">
              {doctors.map((d) => (
                <div className="col-md-4" key={d._id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="fw-semibold">{d.userId?.name}</div>
                      <div className="text-muted small">{d.userId?.email}</div>
                      <hr />
                      <div className="mb-2">
                        <span className="badge text-bg-light border">{d.specialization}</span>
                      </div>
                      <div className="text-muted">Experience: {d.experience} years</div>
                      <div className="mt-3">
                        <div className="text-muted small">Available slots</div>
                        <div className="small">{(d.availableSlots || []).slice(0, 3).join(" · ") || "-"}</div>
                      </div>
                    </div>
                    <div className="card-footer bg-white">
                      <Link className="btn btn-primary w-100" to={`/patient/book?doctorId=${d._id}`}>
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

