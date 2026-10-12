const API_URL = "http://localhost:3000";

const totalStudents = document.getElementById("totalStudents");
const overallAttendance = document.getElementById("overallAttendance");
const averageGrade = document.getElementById("averageGrade");
const studentsAtRisk = document.getElementById("studentsAtRisk");

const recentStudents = document.getElementById("recentStudents");
const warningStudents = document.getElementById("warningStudents");
const excellentStudents = document.getElementById("excellentStudents");
const averageStudents = document.getElementById("averageStudents");
const weakStudents = document.getElementById("weakStudents");
const leaderboardList = document.getElementById("leaderboardList");

let students = [];
let attendance = [];
let grades = [];

async function loadDashboard() {
  try {
    const [studentsResponse, attendanceResponse, gradesResponse] =
      await Promise.all([
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/attendance`),
        fetch(`${API_URL}/grades`),
      ]);

    if (!studentsResponse.ok || !attendanceResponse.ok || !gradesResponse.ok) {
      throw new Error("Unable to fetch dashboard data.");
    }

    students = await studentsResponse.json();
    attendance = await attendanceResponse.json();
    grades = await gradesResponse.json();

    // Normalize MySQL fields for dashboard calculations.
    students = students.map((student) => ({
      ...student,
      studentClass: student.class,
    }));

    attendance = attendance.map((record) => ({
      ...record,
      studentId: Number(record.student_id),
    }));

    grades = grades.map((record) => ({
      ...record,
      studentId: Number(record.student_id),
      subjectId: Number(record.subject_id),
      marks: Number(record.marks),
    }));

    displayDashboardStatistics();
    displayRecentStudents();
    displayWarnings();
    displayLeaderboard();
  } catch (error) {
    console.error("Dashboard error:", error);

    if (recentStudents) {
      recentStudents.textContent =
        "Unable to load dashboard data. Check the backend server.";
    }
  }
}

function getStudentAttendance(studentId) {
  return attendance.filter(
    (record) => Number(record.studentId) === Number(studentId),
  );
}

function getStudentGrades(studentId) {
  return grades.filter(
    (record) => Number(record.studentId) === Number(studentId),
  );
}

function getAttendancePercentage(studentId) {
  const records = getStudentAttendance(studentId);

  if (records.length === 0) return 0;

  const present = records.filter(
    (record) => record.status === "Present",
  ).length;

  return (present / records.length) * 100;
}

function getAverageMarks(studentId) {
  const records = getStudentGrades(studentId);

  if (records.length === 0) return 0;

  const total = records.reduce((sum, record) => sum + Number(record.marks), 0);

  return total / records.length;
}

/* Dashboard Statistics */

function displayDashboardStatistics() {
  totalStudents.textContent = students.length;

  const totalPresent = attendance.filter(
    (record) => record.status === "Present",
  ).length;

  const attendancePercentage =
    attendance.length > 0 ? (totalPresent / attendance.length) * 100 : 0;

  overallAttendance.textContent = `${attendancePercentage.toFixed(1)}%`;

  const totalMarks = grades.reduce(
    (sum, record) => sum + Number(record.marks),
    0,
  );

  const average = grades.length > 0 ? totalMarks / grades.length : 0;

  averageGrade.textContent = `${average.toFixed(1)}%`;

  let excellentCount = 0;
  let averageCount = 0;
  let weakCount = 0;
  let riskCount = 0;

  students.forEach((student) => {
    const studentGrades = getStudentGrades(student.id);
    const studentAttendance = getStudentAttendance(student.id);

    const marks = getAverageMarks(student.id);
    const attendancePercent = getAttendancePercentage(student.id);

    if (studentGrades.length > 0 && marks >= 80) {
      excellentCount++;
    } else if (studentGrades.length > 0 && marks >= 50) {
      averageCount++;
    } else if (studentGrades.length > 0) {
      weakCount++;
    }

    if (
      (studentAttendance.length > 0 && attendancePercent < 75) ||
      (studentGrades.length > 0 && marks < 50)
    ) {
      riskCount++;
    }
  });

  studentsAtRisk.textContent = riskCount;
  excellentStudents.textContent = excellentCount;
  averageStudents.textContent = averageCount;
  weakStudents.textContent = weakCount;
}

/* Recent Students */

function displayRecentStudents() {
  recentStudents.replaceChildren();

  const latestStudents = [...students]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  if (latestStudents.length === 0) {
    recentStudents.textContent = "No students available.";
    return;
  }

  latestStudents.forEach((student) => {
    const row = document.createElement("div");
    row.className = "dashboard-student-row";

    const id = document.createElement("span");
    id.textContent = student.id;

    const name = document.createElement("span");
    name.textContent = student.name;

    const studentClass = document.createElement("span");
    studentClass.textContent = student.studentClass ?? student.class ?? "";

    const section = document.createElement("span");
    section.textContent = student.section ?? "";

    const profileCell = document.createElement("span");
    const link = document.createElement("a");

    link.href = `student-profile.html?id=${encodeURIComponent(student.id)}`;
    link.className = "student-profile-link";
    link.textContent = "View Profile";

    profileCell.appendChild(link);
    row.append(id, name, studentClass, section, profileCell);
    recentStudents.appendChild(row);
  });
}

/* Students Needing Attention */

function displayWarnings() {
  warningStudents.replaceChildren();

  const warnings = [];

  students.forEach((student) => {
    const studentAttendance = getStudentAttendance(student.id);
    const studentGrades = getStudentGrades(student.id);

    const average = getAverageMarks(student.id);
    const attendancePercent = getAttendancePercentage(student.id);

    const reasons = [];

    if (studentAttendance.length > 0 && attendancePercent < 75) {
      reasons.push(`Attendance ${attendancePercent.toFixed(1)}%`);
    }

    if (studentGrades.length > 0 && average < 50) {
      reasons.push(`Average marks ${average.toFixed(1)}%`);
    }

    if (reasons.length > 0) {
      warnings.push({ student, reasons });
    }
  });

  if (warnings.length === 0) {
    warningStudents.textContent = "No students currently need attention.";
    return;
  }

  warnings.forEach(({ student, reasons }) => {
    const item = document.createElement("div");
    item.className = "dashboard-warning";

    const name = document.createElement("strong");
    name.textContent = student.name;

    const reason = document.createElement("span");
    reason.textContent = reasons.join(" | ");

    const link = document.createElement("a");
    link.href = `student-profile.html?id=${encodeURIComponent(student.id)}`;
    link.className = "student-profile-link";
    link.textContent = "View Profile";

    item.append(name, reason, link);
    warningStudents.appendChild(item);
  });
}

/* Leaderboard */

function displayLeaderboard() {
  leaderboardList.replaceChildren();

  const leaderboard = students.map((student) => {
    const studentAttendance = getStudentAttendance(student.id);
    const studentGrades = getStudentGrades(student.id);

    const present = studentAttendance.filter(
      (record) => record.status === "Present",
    ).length;

    const attendancePercent = getAttendancePercentage(student.id);
    const average = getAverageMarks(student.id);

    const points =
      present * 10 +
      studentGrades.reduce((sum, record) => sum + Number(record.marks), 0);

    const badges = [];

    if (studentAttendance.length > 0 && present === studentAttendance.length) {
      badges.push("Perfect Attendance");
    }

    if (studentGrades.length > 0 && average >= 80) {
      badges.push("Consistent Performer");
    }

    return {
      student,
      attendancePercent,
      average,
      points,
      badges: badges.length,
    };
  });

  leaderboard.sort((a, b) => b.points - a.points);

  if (leaderboard.length === 0) {
    leaderboardList.textContent = "No students available.";
    return;
  }

  leaderboard.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";

    const rank = document.createElement("span");
    rank.textContent = index + 1;

    const nameCell = document.createElement("span");
    const link = document.createElement("a");

    link.href = `student-profile.html?id=${encodeURIComponent(item.student.id)}`;
    link.className = "student-profile-link";
    link.textContent = item.student.name;

    nameCell.appendChild(link);

    const attendanceCell = document.createElement("span");
    attendanceCell.textContent = `${item.attendancePercent.toFixed(1)}%`;

    const averageCell = document.createElement("span");
    averageCell.textContent = `${item.average.toFixed(1)}%`;

    const pointsCell = document.createElement("span");
    pointsCell.textContent = item.points;

    const badgesCell = document.createElement("span");
    badgesCell.textContent = item.badges;

    row.append(
      rank,
      nameCell,
      attendanceCell,
      averageCell,
      pointsCell,
      badgesCell,
    );

    leaderboardList.appendChild(row);
  });
}

loadDashboard();
