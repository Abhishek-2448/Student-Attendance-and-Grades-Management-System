const API_URL = "http://localhost:3000";

const attendanceForm = document.getElementById("attendanceForm");
const attendanceStudent = document.getElementById("attendanceStudent");
const attendanceDate = document.getElementById("attendanceDate");
const attendanceStatus = document.getElementById("attendanceStatus");
const attendanceSummaryList = document.getElementById("attendanceSummaryList");

const searchAttendance = document.getElementById("searchAttendance");
const filterAttendanceStudent = document.getElementById("filterAttendanceStudent");
const filterAttendanceDate = document.getElementById("filterAttendanceDate");
const filterAttendanceStatus = document.getElementById("filterAttendanceStatus");
const clearAttendanceFilters = document.getElementById("clearAttendanceFilters");

const heatmapStudent = document.getElementById("heatmapStudent");
const attendanceHeatmap = document.getElementById("attendanceHeatmap");
const exportAttendance = document.getElementById("exportAttendance");

let students = [];
let attendance = [];
let editingAttendanceId = null;

function normalizeDate(date) {
    if (!date) return "";

    if (typeof date === "string") {
        return date.substring(0, 10);
    }

    return new Date(date).toISOString().substring(0, 10);
}

function normalizeStudent(student) {
    return {
        ...student,
        id: Number(student.id),
        studentClass: student.studentClass ?? student.class ?? ""
    };
}

function normalizeAttendance(record) {
    return {
        ...record,
        id: Number(record.id),
        studentId: Number(record.studentId ?? record.student_id),
        date: normalizeDate(record.date),
        status: record.status
    };
}

async function apiRequest(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(result.message || result.error || "Request failed.");
    }

    return result;
}

function showMessage(message) {
    alert(message);
}

function getStudentName(studentId) {
    const student = students.find(
        item => Number(item.id) === Number(studentId)
    );

    return student ? student.name : "Unknown";
}

function populateStudentDropdowns() {
    attendanceStudent.innerHTML = '<option value="">Select Student</option>';
    filterAttendanceStudent.innerHTML = '<option value="">All Students</option>';
    heatmapStudent.innerHTML = '<option value="">Select Student</option>';

    students.forEach(student => {
        const options = [
            attendanceStudent,
            filterAttendanceStudent,
            heatmapStudent
        ];

        options.forEach((dropdown, index) => {
            const option = document.createElement("option");
            option.value = student.id;
            option.textContent = student.name;
            dropdown.appendChild(option);
        });
    });
}

async function loadData() {
    try {
        const [studentsData, attendanceData] = await Promise.all([
            apiRequest("/students"),
            apiRequest("/attendance")
        ]);

        students = Array.isArray(studentsData)
            ? studentsData.map(normalizeStudent)
            : [];

        attendance = Array.isArray(attendanceData)
            ? attendanceData.map(normalizeAttendance)
            : [];

        populateStudentDropdowns();
        applyAttendanceFilters();

        if (heatmapStudent.value) {
            displayHeatmap(Number(heatmapStudent.value));
        } else {
            displayHeatmap();
        }
    } catch (error) {
        console.error("Unable to load attendance data:", error);
        attendanceSummaryList.innerHTML = `
            <p class="empty-message">
                Unable to load attendance. Check that the backend and MySQL are running.
            </p>
        `;
    }
}

function getAttendanceData(studentId, records = attendance) {
    const studentRecords = records.filter(
        record => Number(record.studentId) === Number(studentId)
    );

    const total = studentRecords.length;
    const present = studentRecords.filter(
        record => record.status === "Present"
    ).length;

    const absent = studentRecords.filter(
        record => record.status === "Absent"
    ).length;

    const late = studentRecords.filter(
        record => record.status === "Late"
    ).length;

    const percentage = total > 0 ? (present / total) * 100 : 0;

    return { total, present, absent, late, percentage };
}

function displayAttendanceSummary(studentData = students, records = attendance) {
    attendanceSummaryList.innerHTML = "";

    if (studentData.length === 0) {
        attendanceSummaryList.innerHTML = `
            <p class="empty-message">No students found.</p>
        `;
        return;
    }

    studentData.forEach(student => {
        const data = getAttendanceData(student.id, records);
        const row = document.createElement("div");

        row.className = "attendance-summary-row";

        const name = document.createElement("span");
        name.textContent = student.name;

        const total = document.createElement("span");
        total.textContent = data.total;

        const present = document.createElement("span");
        present.textContent = data.present;

        const absent = document.createElement("span");
        absent.textContent = data.absent;

        const percentage = document.createElement("span");
        percentage.className = "attendance-percentage";
        percentage.textContent = `${data.percentage.toFixed(1)}%`;

        const profileContainer = document.createElement("span");
        const profileLink = document.createElement("a");
        profileLink.href = `student-profile.html?id=${student.id}`;
        profileLink.className = "student-profile-link";
        profileLink.textContent = "View Profile";

        profileContainer.appendChild(profileLink);

        [
            name,
            total,
            present,
            absent,
            percentage,
            profileContainer
        ].forEach(element => row.appendChild(element));

        attendanceSummaryList.appendChild(row);
    });
}

function applyAttendanceFilters() {
    const searchValue = searchAttendance.value.toLowerCase().trim();
    const selectedStudent = filterAttendanceStudent.value;
    const selectedDate = filterAttendanceDate.value;
    const selectedStatus = filterAttendanceStatus.value;

    const filteredRecords = attendance.filter(record => {
        const student = students.find(
            item => Number(item.id) === Number(record.studentId)
        );

        if (!student) return false;

        const matchesSearch = student.name
            .toLowerCase()
            .includes(searchValue);

        const matchesStudent =
            !selectedStudent ||
            Number(record.studentId) === Number(selectedStudent);

        const matchesDate =
            !selectedDate || record.date === selectedDate;

        const matchesStatus =
            !selectedStatus || record.status === selectedStatus;

        return (
            matchesSearch &&
            matchesStudent &&
            matchesDate &&
            matchesStatus
        );
    });

    let filteredStudents;

    if (selectedStudent) {
        filteredStudents = students.filter(
            student => Number(student.id) === Number(selectedStudent)
        );
    } else if (selectedDate || selectedStatus) {
        filteredStudents = students.filter(student =>
            filteredRecords.some(
                record => Number(record.studentId) === Number(student.id)
            )
        );
    } else if (searchValue) {
        filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(searchValue)
        );
    } else {
        filteredStudents = students;
    }

    displayAttendanceSummary(filteredStudents, filteredRecords);
}

async function markAttendance(event) {
    event.preventDefault();

    const studentId = Number(attendanceStudent.value);
    const date = attendanceDate.value;
    const status = attendanceStatus.value;

    if (!studentId || !date || !status) {
        showMessage("Please select a student, date, and attendance status.");
        return;
    }

    try {
        /*
         * Find an existing record using student ID + date.
         * If found, update it. Otherwise, insert a new record.
         */
        const existingRecord = attendance.find(
            record =>
                Number(record.studentId) === studentId &&
                normalizeDate(record.date) === date
        );

        if (existingRecord) {
            await apiRequest(`/attendance/${existingRecord.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    studentId,
                    date,
                    status
                })
            });

            showMessage("Existing attendance record updated successfully.");
        } else {
            await apiRequest("/attendance", {
                method: "POST",
                body: JSON.stringify({
                    studentId,
                    date,
                    status
                })
            });

            showMessage("Attendance marked successfully.");
        }

        editingAttendanceId = null;
        attendanceForm.reset();

        await loadData();

        if (heatmapStudent.value) {
            displayHeatmap(Number(heatmapStudent.value));
        }
    } catch (error) {
        console.error("Unable to save attendance:", error);
        showMessage(`Unable to save attendance: ${error.message}`);
    }
}

function displayHeatmap(studentId) {
    attendanceHeatmap.innerHTML = "";

    if (!studentId) {
        attendanceHeatmap.innerHTML = `
            <p>Select a student to view the attendance heatmap.</p>
        `;
        return;
    }

    const studentAttendance = attendance
        .filter(record => Number(record.studentId) === Number(studentId))
        .sort((a, b) => a.date.localeCompare(b.date));

    if (studentAttendance.length === 0) {
        attendanceHeatmap.innerHTML = `
            <p>No attendance records available.</p>
        `;
        return;
    }

    studentAttendance.forEach(record => {
        const day = document.createElement("div");
        day.className = "heatmap-day";

        if (record.status === "Present") {
            day.classList.add("heatmap-present");
        } else if (record.status === "Late") {
            day.classList.add("heatmap-late");
        } else {
            day.classList.add("heatmap-absent");
        }

        const date = document.createElement("strong");
        date.textContent = record.date;

        const status = document.createElement("span");
        status.textContent = record.status;

        day.append(date, status);
        attendanceHeatmap.appendChild(day);
    });
}

function clearFilters() {
    searchAttendance.value = "";
    filterAttendanceStudent.value = "";
    filterAttendanceDate.value = "";
    filterAttendanceStatus.value = "";

    applyAttendanceFilters();
}

function exportAttendanceToExcel() {
    if (attendance.length === 0) {
        showMessage("There is no attendance data to export.");
        return;
    }

    if (typeof XLSX === "undefined") {
        showMessage("Excel export library (XLSX) is not loaded.");
        return;
    }

    const exportData = attendance.map(record => ({
        Student: getStudentName(record.studentId),
        StudentID: record.studentId,
        Date: record.date,
        Status: record.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance.xlsx");
}

attendanceForm.addEventListener("submit", markAttendance);

searchAttendance.addEventListener("input", applyAttendanceFilters);
filterAttendanceStudent.addEventListener("change", applyAttendanceFilters);
filterAttendanceDate.addEventListener("change", applyAttendanceFilters);
filterAttendanceStatus.addEventListener("change", applyAttendanceFilters);

clearAttendanceFilters.addEventListener("click", clearFilters);

heatmapStudent.addEventListener("change", function () {
    displayHeatmap(Number(this.value));
});

exportAttendance.addEventListener("click", exportAttendanceToExcel);

loadData();