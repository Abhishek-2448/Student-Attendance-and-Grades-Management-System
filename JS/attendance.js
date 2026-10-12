const API_URL = "http://localhost:3000";

const attendanceForm = document.getElementById("attendanceForm");

const attendanceStudent = document.getElementById("attendanceStudent");

const attendanceDate = document.getElementById("attendanceDate");

const attendanceStatus = document.getElementById("attendanceStatus");

const attendanceSummaryList = document.getElementById("attendanceSummaryList");

const searchAttendance = document.getElementById("searchAttendance");

const filterAttendanceStudent = document.getElementById(
  "filterAttendanceStudent",
);

const filterAttendanceDate = document.getElementById("filterAttendanceDate");

const filterAttendanceStatus = document.getElementById(
  "filterAttendanceStatus",
);

const clearAttendanceFilters = document.getElementById(
  "clearAttendanceFilters",
);

const heatmapStudent = document.getElementById("heatmapStudent");

const attendanceHeatmap = document.getElementById("attendanceHeatmap");

let attendance = [];

let students = [];

// ==========================================
// LOAD DATA FROM BACKEND
// ==========================================

async function loadData() {
  try {
    const studentsResponse = await fetch(`${API_URL}/students`);

    if (!studentsResponse.ok) {
      throw new Error("Failed to load students");
    }

    const studentsData = await studentsResponse.json();

    students = studentsData.map((student) => ({
      ...student,

      studentClass: student.class,
    }));

    const attendanceResponse = await fetch(`${API_URL}/attendance`);

    if (!attendanceResponse.ok) {
      throw new Error("Failed to load attendance");
    }

    attendance = await attendanceResponse.json();

    loadStudents();

    applyAttendanceFilters();

    displayHeatmap(Number(heatmapStudent.value));
  } catch (error) {
    console.error(error);

    attendanceSummaryList.innerHTML = `
            <p class="empty-message">
                Unable to connect to the server.
            </p>
        `;
  }
}

// ==========================================
// LOAD STUDENTS
// ==========================================

function loadStudents() {
  attendanceStudent.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;

  filterAttendanceStudent.innerHTML = `
        <option value="">
            All Students
        </option>
    `;

  heatmapStudent.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;

  students.forEach((student) => {
    const option = document.createElement("option");

    option.value = student.id;

    option.textContent = student.name;

    attendanceStudent.appendChild(option);

    const filterOption = document.createElement("option");

    filterOption.value = student.id;

    filterOption.textContent = student.name;

    filterAttendanceStudent.appendChild(filterOption);

    const heatmapOption = document.createElement("option");

    heatmapOption.value = student.id;

    heatmapOption.textContent = student.name;

    heatmapStudent.appendChild(heatmapOption);
  });
}

// ==========================================
// ATTENDANCE DATA
// ==========================================

function getAttendanceData(studentId, records = attendance) {
  const studentRecords = records.filter(
    (record) => Number(record.student_id) === Number(studentId),
  );

  const total = studentRecords.length;

  const present = studentRecords.filter(
    (record) => record.status === "Present",
  ).length;

  const absent = studentRecords.filter(
    (record) => record.status === "Absent",
  ).length;

  const percentage = total > 0 ? (present / total) * 100 : 0;

  return {
    total,

    present,

    absent,

    percentage,
  };
}

// ==========================================
// DISPLAY SUMMARY
// ==========================================

function displayAttendanceSummary(
  studentData = students,
  records = attendance,
) {
  attendanceSummaryList.innerHTML = "";

  if (studentData.length === 0) {
    attendanceSummaryList.innerHTML = `
            <p class="empty-message">
                No students found.
            </p>
        `;

    return;
  }

  studentData.forEach((student) => {
    const data = getAttendanceData(student.id, records);

    const row = document.createElement("div");

    row.className = "attendance-summary-row";

    row.innerHTML = `

                <span>
                    ${student.name}
                </span>

                <span>
                    ${data.total}
                </span>

                <span>
                    ${data.present}
                </span>

                <span>
                    ${data.absent}
                </span>

                <span class="attendance-percentage">
                    ${data.percentage.toFixed(1)}%
                </span>

                <span>

                    <a
                        href="student-profile.html?id=${student.id}"
                        class="student-profile-link"
                    >
                        View Profile
                    </a>

                </span>

            `;

    attendanceSummaryList.appendChild(row);
  });
}

// ==========================================
// APPLY FILTERS
// ==========================================

function applyAttendanceFilters() {
  const searchValue = searchAttendance.value.toLowerCase().trim();

  const selectedStudent = filterAttendanceStudent.value;

  const selectedDate = filterAttendanceDate.value;

  const selectedStatus = filterAttendanceStatus.value;

  const filteredRecords = attendance.filter((record) => {
    const student = students.find(
      (student) => Number(student.id) === Number(record.student_id),
    );

    if (!student) {
      return false;
    }

    const matchesSearch = student.name.toLowerCase().includes(searchValue);

    const matchesStudent =
      !selectedStudent || Number(record.student_id) === Number(selectedStudent);

    const matchesDate = !selectedDate || record.date === selectedDate;

    const matchesStatus = !selectedStatus || record.status === selectedStatus;

    return matchesSearch && matchesStudent && matchesDate && matchesStatus;
  });

  let filteredStudents;

  if (selectedStudent) {
    filteredStudents = students.filter(
      (student) => Number(student.id) === Number(selectedStudent),
    );
  } else {
    filteredStudents = students.filter((student) =>
      filteredRecords.some(
        (record) => Number(record.student_id) === Number(student.id),
      ),
    );
  }

  /*
   * If only search is active,
   * students without attendance
   * should still appear.
   */

  if (searchValue && !selectedDate && !selectedStatus && !selectedStudent) {
    filteredStudents = students.filter((student) =>
      student.name.toLowerCase().includes(searchValue),
    );
  }

  /*
   * If no filters are active,
   * display every student.
   */

  if (!searchValue && !selectedDate && !selectedStatus && !selectedStudent) {
    filteredStudents = students;
  }

  displayAttendanceSummary(filteredStudents, filteredRecords);
}

// ==========================================
// MARK / UPDATE ATTENDANCE
// ==========================================

attendanceForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const studentId = Number(attendanceStudent.value);

  const date = attendanceDate.value;

  const status = attendanceStatus.value;

  if (!studentId || !date || !status) {
    return;
  }

  try {
    /*
     * Check whether attendance
     * already exists for this
     * student and date.
     */

    const existingRecord = attendance.find(
      (record) =>
        Number(record.student_id) === studentId && record.date === date,
    );

    let response;

    /*
     * UPDATE existing attendance
     */

    if (existingRecord) {
      response = await fetch(`${API_URL}/attendance/${existingRecord.id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          studentId: studentId,

          date: date,

          status: status,
        }),
      });
    } else {

    /*
     * ADD new attendance
     */
      response = await fetch(`${API_URL}/attendance`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          studentId: studentId,

          date: date,

          status: status,
        }),
      });
    }

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Unable to save attendance.");

      return;
    }

    if (existingRecord) {
      alert("Attendance updated successfully.");
    } else {
      alert("Attendance marked successfully.");
    }

    /*
     * Reload data from MySQL.
     */

    await loadData();

    /*
     * Keep selected student
     * for heatmap if possible.
     */

    if (heatmapStudent.value) {
      displayHeatmap(Number(heatmapStudent.value));
    }

    attendanceForm.reset();
  } catch (error) {
    console.error(error);

    alert("Unable to connect to the server.");
  }
});

// ==========================================
// SEARCH
// ==========================================

searchAttendance.addEventListener("input", applyAttendanceFilters);

// ==========================================
// STUDENT FILTER
// ==========================================

filterAttendanceStudent.addEventListener("change", applyAttendanceFilters);

// ==========================================
// DATE FILTER
// ==========================================

filterAttendanceDate.addEventListener("change", applyAttendanceFilters);

// ==========================================
// STATUS FILTER
// ==========================================

filterAttendanceStatus.addEventListener("change", applyAttendanceFilters);

// ==========================================
// CLEAR FILTERS
// ==========================================

clearAttendanceFilters.addEventListener("click", function () {
  searchAttendance.value = "";

  filterAttendanceStudent.value = "";

  filterAttendanceDate.value = "";

  filterAttendanceStatus.value = "";

  applyAttendanceFilters();
});

// ==========================================
// HEATMAP
// ==========================================

function displayHeatmap(studentId) {
  attendanceHeatmap.innerHTML = "";

  if (!studentId) {
    attendanceHeatmap.innerHTML = `
            <p>
                Select a student to view the attendance heatmap.
            </p>
        `;

    return;
  }

  const studentAttendance = attendance.filter(
    (record) => Number(record.student_id) === Number(studentId),
  );

  if (studentAttendance.length === 0) {
    attendanceHeatmap.innerHTML = `
            <p>
                No attendance records available.
            </p>
        `;

    return;
  }

  studentAttendance.forEach((record) => {
    const day = document.createElement("div");

    day.className = "heatmap-day";

    if (record.status === "Present") {
      day.classList.add("heatmap-present");
    } else {
      day.classList.add("heatmap-absent");
    }

    day.innerHTML = `

                <strong>
                    ${record.date}
                </strong>

                <span>
                    ${record.status}
                </span>

            `;

    attendanceHeatmap.appendChild(day);
  });
}

heatmapStudent.addEventListener("change", function () {
  displayHeatmap(Number(this.value));
});

// ==========================================
// EXPORT ATTENDANCE
// ==========================================

const exportAttendance = document.getElementById("exportAttendance");

exportAttendance.addEventListener("click", function () {
  if (attendance.length === 0) {
    return;
  }

  const exportData = attendance.map((record) => {
    const student = students.find(
      (student) => Number(student.id) === Number(record.student_id),
    );

    return {
      Student: student ? student.name : "Unknown",

      StudentID: record.student_id,

      Date: record.date,

      Status: record.status,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  XLSX.writeFile(workbook, "attendance.xlsx");
});

// ==========================================
// INITIAL LOAD
// ==========================================

loadData();
