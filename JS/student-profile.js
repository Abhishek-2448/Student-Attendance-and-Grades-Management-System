const API_URL = "http://localhost:3000";

const params = new URLSearchParams(window.location.search);
const studentId = Number(params.get("id"));

let student = null;
let attendance = [];
let grades = [];

let subjects = [];

async function loadStudentProfileData() {
  if (!studentId) {
    showStudentNotFound();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/students/${studentId}/profile`);

    if (response.status === 404) {
      showStudentNotFound();
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load student profile");
    }

    const data = await response.json();

    student = data.student;

    if (!student) {
      showStudentNotFound();
      return;
    }

    // Support either the backend's profile aggregates
    // or its detailed attendance and grade history.
    attendance = Array.isArray(data.attendanceHistory)
      ? data.attendanceHistory
      : Array.isArray(data.attendance)
        ? data.attendance
        : [];

    grades = Array.isArray(data.gradeHistory)
      ? data.gradeHistory
      : Array.isArray(data.grades)
        ? data.grades
        : [];

    // Some APIs return attendance and grades as summary objects.
    if (
      !Array.isArray(data.attendanceHistory) &&
      !Array.isArray(data.attendance) &&
      data.attendance &&
      typeof data.attendance === "object"
    ) {
      attendance = [];
    }

    if (
      !Array.isArray(data.gradeHistory) &&
      !Array.isArray(data.grades) &&
      data.grades &&
      typeof data.grades === "object"
    ) {
      grades = [];
    }

    // Normalize API field names for the existing profile logic.
    attendance = attendance.map((record) => ({
      ...record,
      studentId: record.student_id ?? record.studentId,
      date: formatDate(record.date),
      status: record.status,
    }));

    grades = grades.map((record) => ({
      ...record,
      studentId: record.student_id ?? record.studentId,
      subjectId: record.subject_id ?? record.subjectId,
      subject:
        record.subject ??
        record.subject_name ??
        "Subject " + (record.subject_id ?? ""),
      marks: Number(record.marks),
      grade: record.grade ?? calculateGrade(Number(record.marks)),
    }));

    // Load subject names if the profile query did not include them.
    if (grades.some((record) => record.subject.startsWith("Subject "))) {
      const subjectResponse = await fetch(`${API_URL}/subjects`);

      if (subjectResponse.ok) {
        subjects = await subjectResponse.json();

        grades = grades.map((record) => {
          const subject = subjects.find(
            (item) => Number(item.id) === Number(record.subjectId),
          );

          return {
            ...record,
            subject: record.subject.startsWith("Subject ")
              ? (subject?.subject_name ?? record.subject)
              : record.subject,
          };
        });
      }
    }

    loadStudentProfile();
    loadAttendance();
    loadGrades();
    calculatePerformance();
    generateRecommendations();
    generateEarlyWarning();
    generateGamification();
  } catch (error) {
    console.error(error);

    document.body.innerHTML = `
            <main style="padding: 30px;">
                <h2>Unable to load student profile</h2>
                <p>Check that the backend server and MySQL are running.</p>
                <button onclick="location.reload()">Retry</button>
                <p><a href="students.html">Back to Students</a></p>
            </main>
        `;
  }
}

function showStudentNotFound() {
  document.body.innerHTML = `
        <main style="padding: 30px;">
            <h2>Student not found</h2>
            <a href="students.html">Back to Students</a>
        </main>
    `;
}

function formatDate(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return new Date(value).toISOString().slice(0, 10);
}

/* Student Profile */

function loadStudentProfile() {
  document.getElementById("studentName").textContent = student.name ?? "";

  document.getElementById("studentId").textContent = student.id ?? "";

  document.getElementById("studentAge").textContent = student.age ?? "";

  document.getElementById("studentGender").textContent = student.gender ?? "";

  document.getElementById("studentClass").textContent =
    student.studentClass ?? student.class ?? "";

  document.getElementById("studentSection").textContent = student.section ?? "";

  document.getElementById("studentEmail").textContent = student.email ?? "";

  document.getElementById("studentPhone").textContent = student.phone ?? "";
}

/* Attendance */

function getStudentAttendance() {
  return attendance;
}

function loadAttendance() {
  const studentAttendance = getStudentAttendance();

  const total = studentAttendance.length;

  const present = studentAttendance.filter(
    (record) => record.status === "Present",
  ).length;

  const absent = studentAttendance.filter(
    (record) => record.status === "Absent",
  ).length;

  const percentage = total > 0 ? (present / total) * 100 : 0;

  document.getElementById("totalClasses").textContent = total;
  document.getElementById("presentClasses").textContent = present;
  document.getElementById("absentClasses").textContent = absent;
  document.getElementById("attendancePercentage").textContent =
    `${percentage.toFixed(1)}%`;

  const history = document.getElementById("attendanceHistory");
  history.innerHTML = "";

  if (studentAttendance.length === 0) {
    history.innerHTML = "<p>No attendance records available.</p>";
    return;
  }

  studentAttendance.sort((a, b) => b.date.localeCompare(a.date));

  studentAttendance.forEach((record) => {
    const row = document.createElement("div");
    row.className = "profile-record";

    const date = document.createElement("span");
    date.textContent = record.date;

    const status = document.createElement("span");
    status.textContent = record.status;

    row.append(date, status);
    history.appendChild(row);
  });
}

/* Grades */

function getStudentGrades() {
  return grades;
}

function loadGrades() {
  const studentGrades = getStudentGrades();

  const totalSubjects = studentGrades.length;

  const totalMarks = studentGrades.reduce(
    (total, record) => total + Number(record.marks),
    0,
  );

  const average = totalSubjects > 0 ? totalMarks / totalSubjects : 0;

  document.getElementById("totalSubjects").textContent = totalSubjects;

  document.getElementById("averageMarks").textContent =
    `${average.toFixed(1)}%`;

  document.getElementById("overallGrade").textContent =
    totalSubjects > 0 ? calculateGrade(average) : "-";

  const gradeHistory = document.getElementById("gradeHistory");
  gradeHistory.innerHTML = "";

  if (studentGrades.length === 0) {
    gradeHistory.innerHTML = "<p>No grade records available.</p>";
    return;
  }

  studentGrades.forEach((record) => {
    const row = document.createElement("div");
    row.className = "profile-record";

    const subject = document.createElement("span");
    subject.textContent = record.subject;

    const marks = document.createElement("span");
    marks.textContent = record.marks;

    const grade = document.createElement("span");
    grade.textContent = calculateGrade(record.marks);

    row.append(subject, marks, grade);
    gradeHistory.appendChild(row);
  });
}

/* Grade Calculation */

function calculateGrade(marks) {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  if (marks >= 50) return "D";
  if (marks > 0) return "F";
  return "-";
}

/* Performance Prediction */

function calculatePerformance() {
  const studentAttendance = getStudentAttendance();
  const studentGrades = getStudentGrades();

  const container = document.getElementById("performancePrediction");

  if (studentAttendance.length === 0 || studentGrades.length === 0) {
    container.textContent = "Not enough data to predict performance.";
    return;
  }

  const present = studentAttendance.filter(
    (record) => record.status === "Present",
  ).length;

  const attendancePercentage = (present / studentAttendance.length) * 100;

  const average =
    studentGrades.reduce((total, record) => total + Number(record.marks), 0) /
    studentGrades.length;

  if (attendancePercentage >= 85 && average >= 75) {
    container.textContent =
      "Low Risk - The student is showing consistent academic performance.";
  } else if (attendancePercentage >= 70 && average >= 50) {
    container.textContent =
      "Medium Risk - The student may benefit from additional academic support.";
  } else {
    container.textContent =
      "High Risk - The student may need immediate academic and attendance support.";
  }
}

/* Study Recommendations */

function generateRecommendations() {
  const container = document.getElementById("studyRecommendations");

  const studentAttendance = getStudentAttendance();
  const studentGrades = getStudentGrades();
  const recommendations = [];

  if (studentAttendance.length > 0) {
    const present = studentAttendance.filter(
      (record) => record.status === "Present",
    ).length;

    const percentage = (present / studentAttendance.length) * 100;

    if (percentage < 75) {
      recommendations.push("Improve attendance and attend classes regularly.");
    }
  }

  studentGrades.forEach((record) => {
    if (record.marks < 50) {
      recommendations.push(`Spend more study time on ${record.subject}.`);
    } else if (record.marks < 70) {
      recommendations.push(`Practice more questions in ${record.subject}.`);
    }
  });

  if (recommendations.length === 0) {
    recommendations.push(
      "Keep up the current performance and maintain consistent study habits.",
    );
  }

  container.replaceChildren();

  recommendations.forEach((recommendation) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = `• ${recommendation}`;
    container.appendChild(paragraph);
  });
}

/* Early Warning */

function generateEarlyWarning() {
  const container = document.getElementById("earlyWarning");

  const studentAttendance = getStudentAttendance();
  const studentGrades = getStudentGrades();
  const warnings = [];

  if (studentAttendance.length > 0) {
    const present = studentAttendance.filter(
      (record) => record.status === "Present",
    ).length;

    const percentage = (present / studentAttendance.length) * 100;

    if (percentage < 75) {
      warnings.push(`Low attendance: ${percentage.toFixed(1)}%`);
    }
  }

  studentGrades.forEach((record) => {
    if (record.marks < 50) {
      warnings.push(`Low marks in ${record.subject}: ${record.marks}`);
    }
  });

  container.replaceChildren();

  if (warnings.length === 0) {
    const paragraph = document.createElement("p");
    paragraph.textContent = "No current warnings.";
    container.appendChild(paragraph);
    return;
  }

  warnings.forEach((warning) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = `⚠ ${warning}`;
    container.appendChild(paragraph);
  });
}

/* Gamification */

function generateGamification() {
  const studentAttendance = getStudentAttendance();
  const studentGrades = getStudentGrades();

  const present = studentAttendance.filter(
    (record) => record.status === "Present",
  ).length;

  const average =
    studentGrades.length > 0
      ? studentGrades.reduce(
          (total, record) => total + Number(record.marks),
          0,
        ) / studentGrades.length
      : 0;

  let points = present * 10;

  points += studentGrades.reduce(
    (total, record) => total + Number(record.marks),
    0,
  );

  const perfectAttendance =
    studentAttendance.length > 0 && present === studentAttendance.length;

  if (perfectAttendance) points += 50;
  if (average >= 80) points += 50;

  const badges = [];

  if (perfectAttendance) {
    badges.push("Perfect Attendance");
  }

  if (average >= 80) {
    badges.push("Consistent Performer");
  }

  // Keep the original comparison approach for Most Improved.
  if (studentGrades.length >= 2) {
    const firstMark = Number(studentGrades[0].marks);
    const lastMark = Number(studentGrades[studentGrades.length - 1].marks);

    if (lastMark > firstMark) {
      badges.push("Most Improved");
    }
  }

  document.getElementById("studentPoints").textContent = points;
  document.getElementById("studentBadges").textContent = badges.length;

  const badgesList = document.getElementById("badgesList");
  badgesList.replaceChildren();

  if (badges.length === 0) {
    const paragraph = document.createElement("p");
    paragraph.textContent = "No badges earned yet.";
    badgesList.appendChild(paragraph);
    return;
  }

  badges.forEach((badge) => {
    const badgeElement = document.createElement("span");
    badgeElement.className = "badge";
    badgeElement.textContent = badge;
    badgesList.appendChild(badgeElement);
  });
}

/* Initial Load */

loadStudentProfileData();
