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

const specializations = [
  "Cardiologist",
  "Dermatologist",
  "General Physician",
  "Orthopedic",
  "Neurologist",
  "Pediatrician",
  "Psychiatrist",
  "ENT Specialist",
  "Ophthalmologist",
  "Dentist"
];

const firstNames = [
  "Asha", "Vikram", "Neha", "Rajesh", "Priya",
  "Amit", "Sneha", "Arjun", "Deepa", "Sanjay"
];

const lastNames = [
  "Rao", "Singh", "Iyer", "Patel", "Sharma",
  "Kumar", "Gupta", "Nair", "Reddy", "Verma"
];

const patientFirstNames = [
  "Ananya", "Rahul", "Sneha", "Arjun", "Priya",
  "Rohan", "Divya", "Aditya", "Pooja", "Vikram",
  "Nisha", "Harshit", "Isha", "Kabir", "Meera",
  "Nikhil", "Shreya", "Varun", "Zara", "Jatin"
];

const patientLastNames = [
  "Kumar", "Mehta", "Patel", "Nair", "Sharma",
  "Gupta", "Singh", "Reddy", "Verma", "Desai",
  "Iyer", "Bhat", "Malhotra", "Kapoor", "Chopra",
  "Bhatt", "Ahuja", "Saxena", "Yadav", "Tiwari"
];

const allergies = [
  "Dust", "Penicillin", "Pollen", "Seafood", "Nuts",
  "Dairy", "Gluten", "Aspirin", "Latex", "None"
];

const conditions = [
  "None", "Hypertension", "Eczema", "Diabetes", "Asthma",
  "Migraine", "Arthritis", "Thyroid", "Anxiety", "Sleep Apnea"
];

const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

const availableSlots = [
  ["Mon 10:00-12:00", "Wed 14:00-16:00", "Fri 10:00-12:00"],
  ["Tue 10:00-12:00", "Thu 14:00-16:00"],
  ["Mon 15:00-17:00", "Wed 10:00-12:00", "Sat 10:00-12:00"],
  ["Tue 09:00-11:00", "Thu 15:00-17:00", "Sat 14:00-16:00"],
  ["Mon 11:00-13:00", "Wed 16:00-18:00"],
  ["Tue 13:00-15:00", "Fri 10:00-12:00", "Sun 10:00-12:00"],
  ["Wed 09:00-11:00", "Fri 14:00-16:00"],
  ["Thu 10:00-12:00", "Sat 11:00-13:00"],
  ["Mon 13:00-15:00", "Fri 15:00-17:00"],
  ["Tue 14:00-16:00", "Thu 11:00-13:00", "Sat 15:00-17:00"]
];

async function seed() {
  await connectDB();

  // Clear all collections
  await Promise.all([
    FollowUp.deleteMany({}),
    Prescription.deleteMany({}),
    ConsultationNote.deleteMany({}),
    Appointment.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    User.deleteMany({})
  ]);

  console.log("Creating 2 admin users...");
  const admins = await User.create([
    {
      name: "System Admin",
      email: "admin@demo.com",
      password: "Admin@123",
      role: "admin"
    },
    {
      name: "Administrator",
      email: "admin2@demo.com",
      password: "Admin@123",
      role: "admin"
    }
  ]);

  console.log("Creating 10 doctor users and profiles...");
  const doctorUsers = await User.create(
    Array.from({ length: 10 }, (_, i) => ({
      name: `Dr. ${firstNames[i]} ${lastNames[i]}`,
      email: `doctor${i + 1}@demo.com`,
      password: "Doctor@123",
      role: "doctor"
    }))
  );

  const doctors = await Doctor.create(
    doctorUsers.map((user, i) => ({
      userId: user._id,
      specialization: specializations[i],
      experience: Math.floor(Math.random() * 20) + 3,
      availableSlots: availableSlots[i]
    }))
  );

  console.log("Creating 20 patient users and profiles...");
  const patientUsers = await User.create(
    Array.from({ length: 20 }, (_, i) => ({
      name: `${patientFirstNames[i]} ${patientLastNames[i]}`,
      email: `patient${i + 1}@demo.com`,
      password: "Patient@123",
      role: "patient"
    }))
  );

  const patients = await Patient.create(
    patientUsers.map((user, i) => ({
      userId: user._id,
      age: Math.floor(Math.random() * 50) + 18,
      gender: Math.random() > 0.5 ? "male" : "female",
      contact: `999999${String(i + 1).padStart(4, "0")}`,
      medicalDetails: {
        bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
        allergies: allergies[Math.floor(Math.random() * allergies.length)],
        conditions: conditions[Math.floor(Math.random() * conditions.length)],
        notes: "Patient registered in the system."
      }
    }))
  );

  console.log("Creating sample appointments...");
  const appointments = await Appointment.create([
    // Completed appointments
    ...Array.from({ length: 15 }, (_, i) => ({
      patientId: patients[i % 20]._id,
      doctorId: doctors[i % 10]._id,
      date: daysFromNow(Math.floor(Math.random() * -20) - 1),
      status: "completed"
    })),
    // Upcoming appointments
    ...Array.from({ length: 15 }, (_, i) => ({
      patientId: patients[(i + 5) % 20]._id,
      doctorId: doctors[(i + 2) % 10]._id,
      date: daysFromNow(Math.floor(Math.random() * 20) + 1),
      status: "booked"
    }))
  ]);

  console.log("Creating consultation notes...");
  const diagnoses = [
    "Viral fever",
    "Mild hypertension",
    "Allergic dermatitis",
    "Common cold",
    "Migraine",
    "Anxiety disorder",
    "Skin allergy",
    "Respiratory infection",
    "Gastroenteritis",
    "Muscle strain"
  ];

  const notes = await ConsultationNote.create(
    appointments.slice(0, 15).map((appointment, i) => ({
      appointmentId: appointment._id,
      diagnosis: diagnoses[i % diagnoses.length],
      notes: "Patient reviewed and advised appropriate treatment. Follow-up recommended if symptoms persist."
    }))
  );

  console.log("Creating prescriptions...");
  const medicines = [
    { name: "Paracetamol", dosage: "500mg", duration: "3 days" },
    { name: "Amlodipine", dosage: "5mg", duration: "30 days" },
    { name: "Cetirizine", dosage: "10mg", duration: "7 days" },
    { name: "Ibuprofen", dosage: "400mg", duration: "5 days" },
    { name: "Amoxicillin", dosage: "500mg", duration: "7 days" },
    { name: "Loratadine", dosage: "10mg", duration: "14 days" },
    { name: "Omeprazole", dosage: "20mg", duration: "30 days" },
    { name: "Vitamin D", dosage: "1000IU", duration: "90 days" }
  ];

  await Prescription.create(
    notes.map((note, i) => {
      const medicine = medicines[i % medicines.length];
      return {
        noteId: note._id,
        medicineName: medicine.name,
        dosage: medicine.dosage,
        duration: medicine.duration,
        instructions: "As directed by doctor. Take with food if needed."
      };
    })
  );

  console.log("Creating follow-ups...");
  await FollowUp.create(
    appointments.slice(0, 8).map((appointment, i) => ({
      appointmentId: appointment._id,
      recommendedDate: daysFromNow(14 + i * 7),
      notes: "Review patient progress and adjust treatment if needed.",
      status: "pending"
    }))
  );

  // Print summary
  console.log("\n");
  console.log("═".repeat(60));
  console.log("✅ SEED DATA CREATED SUCCESSFULLY");
  console.log("═".repeat(60));
  console.log("\n📊 SUMMARY:");
  console.log(`   • Admins: 2`);
  console.log(`   • Doctors: 10`);
  console.log(`   • Patients: 20`);
  console.log(`   • Appointments: 30`);
  console.log(`   • Consultation Notes: 15`);
  console.log(`   • Prescriptions: 15`);
  console.log(`   • Follow-ups: 8`);
  console.log("\n🔐 ADMIN CREDENTIALS:");
  console.log("   • Email: admin@demo.com");
  console.log("   • Password: Admin@123");
  console.log("   • Email: admin2@demo.com");
  console.log("   • Password: Admin@123");
  console.log("\n👨‍⚕️ DOCTOR CREDENTIALS (Examples):");
  console.log("   • Email: doctor1@demo.com");
  console.log("   • Password: Doctor@123");
  console.log("   • Email: doctor5@demo.com");
  console.log("   • Password: Doctor@123");
  console.log("\n👤 PATIENT CREDENTIALS (Examples):");
  console.log("   • Email: patient1@demo.com");
  console.log("   • Password: Patient@123");
  console.log("   • Email: patient10@demo.com");
  console.log("   • Password: Patient@123");
  console.log("\n" + "═".repeat(60) + "\n");
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("❌ Seed Error:", err);
    await mongoose.disconnect();
    process.exit(1);
  });