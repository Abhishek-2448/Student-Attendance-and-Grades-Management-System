const API_URL = "https://student-management-backend-nbol.onrender.com";

const attendanceForm = document.getElementById("attendanceForm");
const attendanceStudent = document.getElementById("attendanceStudent");
const attendanceStudentPicker = new SearchableDropdown({
    input: document.getElementById("attendanceStudentSearch"),
    select: attendanceStudent,
    list: document.getElementById("attendanceStudentOptions")
});
const attendanceDate = document.getElementById("attendanceDate");
const attendanceStatus = document.getElementById("attendanceStatus");
const attendanceSummaryList = document.getElementById("attendanceSummaryList");

const searchAttendance = document.getElementById("searchAttendance");
const filterAttendanceStudent = document.getElementById("filterAttendanceStudent");
const filterAttendanceStudentPicker = new SearchableDropdown({
    input: document.getElementById("filterAttendanceStudentSearch"),
    select: filterAttendanceStudent,
    list: document.getElementById("filterAttendanceStudentOptions"),
    allowAll: true
});
const filterAttendanceDate = document.getElementById("filterAttendanceDate");
const filterAttendanceStatus = document.getElementById("filterAttendanceStatus");
const clearAttendanceFilters = document.getElementById("clearAttendanceFilters");

const attendancePagination = document.getElementById("attendancePagination");

const heatmapSearchBox = document.getElementById("heatmapSearchBox");
const heatmapSearch = document.getElementById("heatmapSearch");
const heatmapStudent = document.getElementById("heatmapStudent"); 
const heatmapOptions = document.getElementById("heatmapOptions");
const heatmapClear = document.getElementById("heatmapClear");
const heatmapSummary = document.getElementById("heatmapSummary");
const heatmapPagination = document.getElementById("heatmapPagination");
const attendanceHeatmap = document.getElementById("attendanceHeatmap");
const exportAttendance = document.getElementById("exportAttendance");

document.getElementById("attendanceForm").addEventListener("reset", () => {
  document.getElementById("attendanceStudentSearch").value = "";
});

let students = [];
let attendance = [];
let editingAttendanceId = null;

let attendancePage = 1;
let heatmapPage = 1;
let heatmapMatches = [];
let heatmapActiveIndex = -1;

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
    const text = String(message).toLowerCase();
    const type = text.includes("successfully") || text.includes("marked successfully")
        ? "success"
        : text.includes("please select") || text.includes("no attendance") || text.includes("not loaded")
            ? "warning"
            : "error";
    showToast(message, type);
}

function getStudentName(studentId) {
    const student = students.find(
        item => Number(item.id) === Number(studentId)
    );

    return student ? student.name : "Unknown";
}

function populateStudentDropdowns() {
    attendanceStudentPicker.setItems(students);
    filterAttendanceStudentPicker.setItems(students);
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

        syncHeatmapSelection();

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

        renderPagination(attendancePagination, getPageItems([], 1), () => {});

        return;
    }

    /* Only 50 rows are shown at a time */
    const pageInfo = getPageItems(studentData, attendancePage);

    attendancePage = pageInfo.page;

    pageInfo.items.forEach(student => {
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

    renderPagination(attendancePagination, pageInfo, page => {
        attendancePage = page;

        displayAttendanceSummary(studentData, records);
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

/* ==========================================
   HEATMAP - SEARCHABLE STUDENT PICKER
   ========================================== */

function getSelectedHeatmapStudent() {
    const id = Number(heatmapStudent.value);

    if (!id) return null;

    return students.find(student => Number(student.id) === id) || null;
}

function updateHeatmapClearButton() {
    heatmapClear.hidden = !heatmapStudent.value;
}

/* Keep the picker in step with freshly loaded data */
function syncHeatmapSelection() {
    const selected = getSelectedHeatmapStudent();

    if (selected) {
        heatmapSearch.value = selected.name;
    } else {
        heatmapStudent.value = "";
        heatmapSearch.value = "";
    }

    updateHeatmapClearButton();
}

function openHeatmapOptions() {
    heatmapOptions.hidden = false;
    heatmapSearch.setAttribute("aria-expanded", "true");
}

function closeHeatmapOptions() {
    heatmapOptions.hidden = true;
    heatmapSearch.setAttribute("aria-expanded", "false");
    heatmapActiveIndex = -1;

    /* Put the selected name back if the user typed something else */
    const selected = getSelectedHeatmapStudent();
    heatmapSearch.value = selected ? selected.name : "";
}

function setHeatmapActiveOption(index) {
    const items = heatmapOptions.querySelectorAll(".heatmap-option");

    items.forEach(item => item.classList.remove("active"));

    heatmapActiveIndex = index;

    if (index >= 0 && items[index]) {
        items[index].classList.add("active");
        items[index].scrollIntoView({ block: "nearest" });
    }
}

function renderHeatmapOptions() {
    const rawQuery = heatmapSearch.value;
    const query = rawQuery.toLowerCase().trim();
    const selected = getSelectedHeatmapStudent();

    /* While the box still shows the chosen name, list everyone */
    const showAll = !query || (selected && rawQuery === selected.name);

    const matches = showAll
        ? students
        : students.filter(student =>
              [
                  student.name,
                  student.id,
                  student.studentClass,
                  student.section
              ].some(value =>
                  String(value ?? "").toLowerCase().includes(query)
              )
          );

    heatmapMatches = matches.slice(0, PAGE_SIZE);
    heatmapOptions.innerHTML = "";

    if (matches.length === 0) {
        const empty = document.createElement("li");
        empty.className = "heatmap-option-empty";
        empty.textContent = "No students found";
        heatmapOptions.appendChild(empty);
        heatmapActiveIndex = -1;
        openHeatmapOptions();
        return;
    }

    heatmapMatches.forEach(student => {
        const item = document.createElement("li");
        item.className = "heatmap-option";
        item.setAttribute("role", "option");

        if (selected && Number(selected.id) === Number(student.id)) {
            item.classList.add("selected");
            item.setAttribute("aria-selected", "true");
        }

        const name = document.createElement("span");
        name.className = "heatmap-option-name";
        name.textContent = student.name;

        const meta = document.createElement("span");
        meta.className = "heatmap-option-meta";
        meta.textContent =
            `ID ${student.id}` +
            (student.studentClass
                ? ` | Class ${student.studentClass}${student.section ? "-" + student.section : ""}`
                : "");

        item.append(name, meta);

        /* mousedown fires before the input loses focus */
        item.addEventListener("mousedown", event => {
            event.preventDefault();
            selectHeatmapStudent(student);
        });

        heatmapOptions.appendChild(item);
    });

    if (matches.length > heatmapMatches.length) {
        const hint = document.createElement("li");
        hint.className = "heatmap-option-hint";
        hint.textContent =
            `Showing first ${heatmapMatches.length} of ${matches.length} - keep typing to narrow the list`;
        heatmapOptions.appendChild(hint);
    }

    const selectedIndex = heatmapMatches.findIndex(
        student => selected && Number(student.id) === Number(selected.id)
    );

    openHeatmapOptions();
    setHeatmapActiveIndexSafe(selectedIndex >= 0 ? selectedIndex : 0);
}

function setHeatmapActiveIndexSafe(index) {
    if (heatmapMatches.length === 0) return;

    const last = heatmapMatches.length - 1;

    setHeatmapActiveOption(Math.min(Math.max(index, 0), last));
}

function selectHeatmapStudent(student) {
    heatmapStudent.value = student.id;
    heatmapSearch.value = student.name;
    heatmapPage = 1;

    heatmapOptions.hidden = true;
    heatmapSearch.setAttribute("aria-expanded", "false");
    heatmapActiveIndex = -1;

    updateHeatmapClearButton();
    displayHeatmap(Number(student.id));
}

function clearHeatmapSelection() {
    heatmapStudent.value = "";
    heatmapSearch.value = "";
    heatmapPage = 1;

    updateHeatmapClearButton();
    displayHeatmap();

    heatmapSearch.focus();
}

/* ==========================================
   HEATMAP - DISPLAY
   ========================================== */

function showHeatmapMessage(message) {
    attendanceHeatmap.innerHTML = "";

    const text = document.createElement("p");
    text.className = "heatmap-empty";
    text.textContent = message;

    attendanceHeatmap.appendChild(text);
}

function displayHeatmapSummary(student, studentId) {
    const data = getAttendanceData(studentId);

    heatmapSummary.innerHTML = "";

    const name = document.createElement("strong");
    name.className = "heatmap-summary-name";
    name.textContent = student ? student.name : "Student";

    const chips = document.createElement("div");
    chips.className = "heatmap-summary-chips";

    const items = [
        ["Present", data.present, "chip-present"],
        ["Absent", data.absent, "chip-absent"]
    ];

    if (data.late > 0) {
        items.push(["Late", data.late, "chip-late"]);
    }

    items.push(["Attendance", `${data.percentage.toFixed(1)}%`, "chip-rate"]);

    items.forEach(([label, value, className]) => {
        const chip = document.createElement("span");
        chip.className = `heatmap-chip ${className}`;
        chip.textContent = `${label}: ${value}`;
        chips.appendChild(chip);
    });

    heatmapSummary.append(name, chips);
    heatmapSummary.hidden = false;
}

function displayHeatmap(studentId) {
    attendanceHeatmap.innerHTML = "";
    heatmapSummary.hidden = true;
    heatmapSummary.innerHTML = "";

    if (!studentId) {
        showHeatmapMessage("Search and select a student to view the attendance heatmap.");
        renderPagination(heatmapPagination, getPageItems([], 1), () => {});
        return;
    }

    const student = students.find(
        item => Number(item.id) === Number(studentId)
    );

    /* Newest day first, 50 days per page */
    const studentAttendance = attendance
        .filter(record => Number(record.studentId) === Number(studentId))
        .sort((a, b) => b.date.localeCompare(a.date));

    if (studentAttendance.length === 0) {
        showHeatmapMessage("No attendance records available.");
        renderPagination(heatmapPagination, getPageItems([], 1), () => {});
        return;
    }

    displayHeatmapSummary(student, studentId);

    const pageInfo = getPageItems(studentAttendance, heatmapPage);

    heatmapPage = pageInfo.page;

    pageInfo.items.forEach(record => {
        const day = document.createElement("div");
        day.className = "heatmap-day";
        day.title = `${record.date} - ${record.status}`;

        if (record.status === "Present") {
            day.classList.add("heatmap-present");
        } else if (record.status === "Late") {
            day.classList.add("heatmap-late");
        } else {
            day.classList.add("heatmap-absent");
        }

        const date = document.createElement("strong");
        date.textContent = record.date;

        const weekday = document.createElement("small");
        weekday.textContent = new Date(`${record.date}T00:00:00`)
            .toLocaleDateString(undefined, { weekday: "short" });

        const status = document.createElement("span");
        status.textContent = record.status;

        day.append(date, weekday, status);
        attendanceHeatmap.appendChild(day);
    });

    renderPagination(heatmapPagination, pageInfo, page => {
        heatmapPage = page;

        displayHeatmap(studentId);
    });
}

function clearFilters() {
    searchAttendance.value = "";
    filterAttendanceStudent.value = "";
    document.getElementById("filterAttendanceStudentSearch").value = "";
    filterAttendanceDate.value = "";
    filterAttendanceStatus.value = "";

    attendancePage = 1;

    applyAttendanceFilters();
}

/* Any filter change goes back to the first page */
function onAttendanceFilterChange() {
    attendancePage = 1;

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

searchAttendance.addEventListener("input", onAttendanceFilterChange);
filterAttendanceStudent.addEventListener("change", onAttendanceFilterChange);
filterAttendanceDate.addEventListener("change", onAttendanceFilterChange);
filterAttendanceStatus.addEventListener("change", onAttendanceFilterChange);

clearAttendanceFilters.addEventListener("click", clearFilters);

/* Heatmap search picker */

heatmapSearch.addEventListener("focus", function () {
    this.select();
    renderHeatmapOptions();
});

heatmapSearch.addEventListener("input", renderHeatmapOptions);

heatmapSearch.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();

        if (heatmapOptions.hidden) {
            renderHeatmapOptions();
            return;
        }

        const step = event.key === "ArrowDown" ? 1 : -1;
        setHeatmapActiveIndexSafe(heatmapActiveIndex + step);
    } else if (event.key === "Enter") {
        if (!heatmapOptions.hidden && heatmapMatches[heatmapActiveIndex]) {
            event.preventDefault();
            selectHeatmapStudent(heatmapMatches[heatmapActiveIndex]);
        }
    } else if (event.key === "Escape") {
        closeHeatmapOptions();
        heatmapSearch.blur();
    }
});

heatmapClear.addEventListener("click", clearHeatmapSelection);

/* Close when the box loses focus (Tab or click elsewhere) */
heatmapSearch.addEventListener("blur", closeHeatmapOptions);

/* Keep focus in the box while using the list (e.g. dragging its scrollbar) */
heatmapOptions.addEventListener("mousedown", function (event) {
    event.preventDefault();
});

exportAttendance.addEventListener("click", exportAttendanceToExcel);

loadData();
