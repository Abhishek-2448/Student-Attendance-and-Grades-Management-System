const API_URL = "https://student-management-backend-nbol.onrender.com";

const studentForm = document.getElementById("studentForm");

const studentList = document.getElementById("studentList");

const studentPagination = document.getElementById("studentPagination");

const searchStudent = document.getElementById("searchStudent");

const filterClass = document.getElementById("filterClass");

const filterSection = document.getElementById("filterSection");

const filterGender = document.getElementById("filterGender");

const clearStudentFilters = document.getElementById("clearStudentFilters");

let students = [];

let editingId = null;

let currentPage = 1;

/* Load Students from Backend */

async function loadStudents() {
  try {
    const response = await fetch(`${API_URL}/students`);

    if (!response.ok) {
      throw new Error("Failed to load students");
    }

    const data = await response.json();

    /*
     * Backend uses "class".
     * Frontend uses "studentClass".
     * Convert it so the rest of the
     * existing frontend continues
     * working.
     */

    students = data.map((student) => ({
      ...student,

      studentClass: student.class,
    }));

    loadClassFilters();

    applyFilters();
  } catch (error) {
    console.error(error);

    studentList.innerHTML = `
            <p class="empty-message">
                Unable to connect to the server.
            </p>
        `;
  }
}

/* Load Class Filters */

function loadClassFilters() {
  const classes = [...new Set(students.map((student) => student.studentClass))];

  filterClass.innerHTML = `
        <option value="">
            All Classes
        </option>
    `;

  classes.sort().forEach((studentClass) => {
    const option = document.createElement("option");

    option.value = studentClass;

    option.textContent = `Class ${studentClass}`;

    filterClass.appendChild(option);
  });
}

/* Display Students */

function displayStudents(studentData = students) {
  studentList.innerHTML = "";

  if (studentData.length === 0) {
    studentList.innerHTML = `
            <p class="empty-message">
                No students found.
            </p>
        `;

    renderPagination(studentPagination, getPageItems([], 1), () => {});

    return;
  }

  /* Only 50 rows are shown at a time */

  const pageInfo = getPageItems(studentData, currentPage);

  currentPage = pageInfo.page;

  pageInfo.items.forEach((student) => {
    const row = document.createElement("div");

    row.className = "student-row";

    row.innerHTML = `

                <span class="actions">

                    <button
                        onclick="editStudent(${student.id})"
                    >
                        Edit
                    </button>

                    <button
                        onclick="deleteStudent(${student.id})"
                    >
                        Delete
                    </button>

                </span>


                <span>
                    ${student.id}
                </span>


                <span>

                    <a
                        href="student-profile.html?id=${student.id}"
                        class="student-profile-link"
                    >
                        ${student.name}
                    </a>

                </span>


                <span>
                    ${student.studentClass}
                </span>


                <span>
                    ${student.section}
                </span>


                <span>
                    ${student.email}
                </span>


                <span>
                    ${student.phone}
                </span>

            `;

    studentList.appendChild(row);
  });

  renderPagination(studentPagination, pageInfo, (page) => {
    currentPage = page;

    displayStudents(studentData);
  });
}

/* Apply Filters */

function applyFilters() {
  const searchValue = searchStudent.value.toLowerCase().trim();

  const selectedClass = filterClass.value;

  const selectedSection = filterSection.value;

  const selectedGender = filterGender.value;

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchValue);

    const matchesClass =
      !selectedClass || student.studentClass === selectedClass;

    const matchesSection =
      !selectedSection || student.section === selectedSection;

    const matchesGender = !selectedGender || student.gender === selectedGender;

    return matchesSearch && matchesClass && matchesSection && matchesGender;
  });

  displayStudents(filteredStudents);
}

/* Add / Edit Student */

studentForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const studentData = {
    name: document.getElementById("studentName").value.trim(),

    age: document.getElementById("studentAge").value,

    gender: document.getElementById("studentGender").value,

    studentClass: document.getElementById("studentClass").value.trim(),

    section: document.getElementById("studentSection").value,

    email: document.getElementById("studentEmail").value.trim(),

    phone: document.getElementById("studentPhone").value.trim(),
  };



  try {
    let response;

    /* ADD STUDENT */

    if (editingId === null) {
      response = await fetch(`${API_URL}/students`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(studentData),
      });
    } else {

    /* UPDATE STUDENT */
      response = await fetch(`${API_URL}/students/${editingId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(studentData),
      });
    }

    const result = await response.json();

    if (!response.ok) {
      showToast(result.message || "Operation failed", "error");

      return;
    }

    if (editingId === null) {
      showToast("Student added successfully.", "success");
    } else {
      showToast("Student updated successfully.", "success");
    }

    editingId = null;

    studentForm.reset();

    await loadStudents();
  } catch (error) {
    console.error(error);

    showToast("Unable to connect to the server.", "error");
  }
});

/* Edit Student */

function editStudent(id) {
  const student = students.find((student) => Number(student.id) === Number(id));

  if (!student) {
    return;
  }

  document.getElementById("studentName").value = student.name;

  document.getElementById("studentAge").value = student.age;

  document.getElementById("studentGender").value = student.gender;

  document.getElementById("studentClass").value = student.studentClass;

  document.getElementById("studentSection").value = student.section;

  document.getElementById("studentEmail").value = student.email;

  document.getElementById("studentPhone").value = student.phone;

  editingId = id;
}

/* Delete Student */

async function deleteStudent(id) {
  const confirmDelete = await confirmPopup(
    "This action cannot be undone. The student's record will be permanently deleted.",
    "Delete student?",
    "Delete student"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.message || "Unable to delete student", "error");

      return;
    }

    showToast("Student deleted successfully.", "success");

   

    if (Number(editingId) === Number(id)) {
      editingId = null;

      studentForm.reset();
    }

    await loadStudents();
  } catch (error) {
    console.error(error);

    showToast("Unable to connect to the server.", "error");
  }
}

/* Any filter change goes back to the first page */

function onFilterChange() {
  currentPage = 1;

  applyFilters();
}

/* Search */

searchStudent.addEventListener("input", onFilterChange);

/* Class Filter */

filterClass.addEventListener("change", onFilterChange);

/* Section Filter */

filterSection.addEventListener("change", onFilterChange);

/* Gender Filter */

filterGender.addEventListener("change", onFilterChange);

/* Clear Filters */

clearStudentFilters.addEventListener("click", function () {
  searchStudent.value = "";

  filterClass.value = "";

  filterSection.value = "";

  filterGender.value = "";

  currentPage = 1;

  applyFilters();
});

/* Export Students */

const exportStudents = document.getElementById("exportStudents");

exportStudents.addEventListener("click", function () {
  if (students.length === 0) {
    showToast("No students available to export.", "warning");

    return;
  }

  const exportData = students.map((student) => ({
    ID: student.id,

    Name: student.name,

    Age: student.age,

    Gender: student.gender,

    Class: student.studentClass,

    Section: student.section,

    Email: student.email,

    Phone: student.phone,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  XLSX.writeFile(workbook, "students.xlsx");
});

/* Initial Load */

loadStudents();
