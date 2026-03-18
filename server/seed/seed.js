import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import ConsultationNote from "../models/ConsultationNote.js";
import Prescription from "../models/Prescription.js";
import FollowUp from "../models/FollowUp.js";

dotenv.config();

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(10, 0, 0, 0);
  return d;
}

async function seed() {
  await connectDB();

  await Promise.all([
    FollowUp.deleteMany({}),
    Prescription.deleteMany({}),
    ConsultationNote.deleteMany({}),
    Appointment.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    User.deleteMany({})
  ]);

  const admin = await User.create({
    name: "System Admin",
    email: "admin@demo.com",
    password: "Admin@123",
    role: "admin"
  });

  const doctorUsers = await User.create([
    { name: "Dr. Asha Rao", email: "asha.rao@demo.com", password: "Doctor@123", role: "doctor" },
    { name: "Dr. Vikram Singh", email: "vikram.singh@demo.com", password: "Doctor@123", role: "doctor" },
    { name: "Dr. Neha Iyer", email: "neha.iyer@demo.com", password: "Doctor@123", role: "doctor" }
  ]);

  const doctors = await Doctor.create([
    {
      userId: doctorUsers[0]._id,
      specialization: "Cardiologist",
      experience: 12,
      availableSlots: ["Mon 10:00-12:00", "Wed 14:00-16:00", "Fri 10:00-12:00"]
    },
    {
      userId: doctorUsers[1]._id,
      specialization: "Dermatologist",
      experience: 8,
      availableSlots: ["Tue 10:00-12:00", "Thu 14:00-16:00"]
    },
    {
      userId: doctorUsers[2]._id,
      specialization: "General Physician",
      experience: 6,
      availableSlots: ["Mon 15:00-17:00", "Wed 10:00-12:00", "Sat 10:00-12:00"]
    }
  ]);

  const patientUsers = await User.create([
    { name: "Ananya Kumar", email: "ananya@demo.com", password: "Patient@123", role: "patient" },
    { name: "Rahul Mehta", email: "rahul@demo.com", password: "Patient@123", role: "patient" },
    { name: "Sneha Patel", email: "sneha@demo.com", password: "Patient@123", role: "patient" },
    { name: "Arjun Nair", email: "arjun@demo.com", password: "Patient@123", role: "patient" },
    { name: "Priya Sharma", email: "priya@demo.com", password: "Patient@123", role: "patient" }
  ]);

  const patients = await Patient.create([
    {
      userId: patientUsers[0]._id,
      age: 29,
      gender: "female",
      contact: "9999990001",
      medicalDetails: { bloodGroup: "O+", allergies: "Dust", conditions: "None", notes: "Prefers morning appointments." }
    },
    {
      userId: patientUsers[1]._id,
      age: 34,
      gender: "male",
      contact: "9999990002",
      medicalDetails: { bloodGroup: "A+", allergies: "Penicillin", conditions: "Hypertension", notes: "BP monitoring ongoing." }
    },
    {
      userId: patientUsers[2]._id,
      age: 26,
      gender: "female",
      contact: "9999990003",
      medicalDetails: { bloodGroup: "B+", allergies: "Pollen", conditions: "Eczema", notes: "Skin flare-ups in summer." }
    },
    {
      userId: patientUsers[3]._id,
      age: 41,
      gender: "male",
      contact: "9999990004",
      medicalDetails: { bloodGroup: "AB+", allergies: "None", conditions: "Diabetes", notes: "Diet and exercise plan." }
    },
    {
      userId: patientUsers[4]._id,
      age: 31,
      gender: "female",
      contact: "9999990005",
      medicalDetails: { bloodGroup: "O-", allergies: "Seafood", conditions: "Asthma", notes: "Carries inhaler." }
    }
  ]);

  const appointments = await Appointment.create([
    // Completed appointments (with notes + prescriptions)
    { patientId: patients[0]._id, doctorId: doctors[2]._id, date: daysFromNow(-10), status: "completed" },
    { patientId: patients[1]._id, doctorId: doctors[0]._id, date: daysFromNow(-7), status: "completed" },
    { patientId: patients[2]._id, doctorId: doctors[1]._id, date: daysFromNow(-5), status: "completed" },
    // Upcoming booked
    { patientId: patients[3]._id, doctorId: doctors[2]._id, date: daysFromNow(2), status: "booked" },
    { patientId: patients[4]._id, doctorId: doctors[0]._id, date: daysFromNow(4), status: "booked" }
  ]);

  const notes = await ConsultationNote.create([
    {
      appointmentId: appointments[0]._id,
      diagnosis: "Viral fever",
      notes: "Rest, hydration, monitor temperature. Return if symptoms worsen."
    },
    {
      appointmentId: appointments[1]._id,
      diagnosis: "Mild hypertension",
      notes: "Lifestyle changes advised; monitor BP twice daily for 2 weeks."
    },
    {
      appointmentId: appointments[2]._id,
      diagnosis: "Allergic dermatitis",
      notes: "Avoid suspected allergens. Use moisturizers; follow treatment plan."
    }
  ]);

  await Prescription.create([
    {
      noteId: notes[0]._id,
      medicineName: "Paracetamol",
      dosage: "500mg",
      duration: "3 days",
      instructions: "After food, twice daily if fever persists"
    },
    {
      noteId: notes[1]._id,
      medicineName: "Amlodipine",
      dosage: "5mg",
      duration: "30 days",
      instructions: "Once daily, same time each day"
    },
    {
      noteId: notes[2]._id,
      medicineName: "Cetirizine",
      dosage: "10mg",
      duration: "7 days",
      instructions: "Once at night"
    }
  ]);

  await FollowUp.create([
    {
      appointmentId: appointments[1]._id,
      recommendedDate: daysFromNow(14),
      notes: "Review BP log and adjust treatment if needed."
    }
  ]);

  // eslint-disable-next-line no-console
  console.log("Seed completed.");
  // eslint-disable-next-line no-console
  console.log("Demo credentials:");
  // eslint-disable-next-line no-console
  console.log("- Admin: admin@demo.com / Admin@123");
  // eslint-disable-next-line no-console
  console.log("- Doctor: asha.rao@demo.com / Doctor@123");
  // eslint-disable-next-line no-console
  console.log("- Patient: ananya@demo.com / Patient@123");
  // eslint-disable-next-line no-console
  console.log(`Admin user id: ${admin._id}`);
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
  });

