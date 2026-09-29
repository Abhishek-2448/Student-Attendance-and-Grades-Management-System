const studentForm =
    document.getElementById("studentForm");

const studentList =
    document.getElementById("studentList");

const searchStudent =
    document.getElementById("searchStudent");

const filterClass =
    document.getElementById("filterClass");

const filterSection =
    document.getElementById("filterSection");

const filterGender =
    document.getElementById("filterGender");

const clearStudentFilters =
    document.getElementById(
        "clearStudentFilters"
    );


let students =
    JSON.parse(
        localStorage.getItem("students")
    ) || [];


let editingId = null;



/* Generate Student ID */

function generateStudentId() {

    if (students.length === 0) {

        return 1;

    }


    return Math.max(
        ...students.map(
            (student) =>
                Number(student.id)
        )
    ) + 1;

}



/* Load Class Filters */

function loadClassFilters() {

    const classes =
        [
            ...new Set(
                students.map(
                    (student) =>
                        student.studentClass
                )
            )
        ];


    filterClass.innerHTML = `
        <option value="">
            All Classes
        </option>
    `;


    classes
        .sort()
        .forEach(
            (studentClass) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    studentClass;


                option.textContent =
                    `Class ${studentClass}`;


                filterClass.appendChild(
                    option
                );

            }
        );

}



/* Display Students */

function displayStudents(
    studentData = students
) {

    studentList.innerHTML = "";


    if (
        studentData.length === 0
    ) {

        studentList.innerHTML = `
            <p class="empty-message">
                No students found.
            </p>
        `;

        return;

    }


    studentData.forEach(
        (student) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "student-row";


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


            studentList.appendChild(
                row
            );

        }
    );

}



/* Apply Filters */

function applyFilters() {

    const searchValue =
        searchStudent.value
            .toLowerCase()
            .trim();


    const selectedClass =
        filterClass.value;


    const selectedSection =
        filterSection.value;


    const selectedGender =
        filterGender.value;


    const filteredStudents =
        students.filter(
            (student) => {

                const matchesSearch =
                    student.name
                        .toLowerCase()
                        .includes(
                            searchValue
                        );


                const matchesClass =
                    !selectedClass ||
                    student.studentClass ===
                        selectedClass;


                const matchesSection =
                    !selectedSection ||
                    student.section ===
                        selectedSection;


                const matchesGender =
                    !selectedGender ||
                    student.gender ===
                        selectedGender;


                return (
                    matchesSearch &&
                    matchesClass &&
                    matchesSection &&
                    matchesGender
                );

            }
        );


    displayStudents(
        filteredStudents
    );

}



/* Add / Edit Student */

studentForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const studentData = {

            name:
                document.getElementById(
                    "studentName"
                ).value.trim(),

            age:
                document.getElementById(
                    "studentAge"
                ).value,

            gender:
                document.getElementById(
                    "studentGender"
                ).value,

            studentClass:
                document.getElementById(
                    "studentClass"
                ).value.trim(),

            section:
                document.getElementById(
                    "studentSection"
                ).value,

            email:
                document.getElementById(
                    "studentEmail"
                ).value.trim(),

            phone:
                document.getElementById(
                    "studentPhone"
                ).value.trim()

        };


        if (
            editingId === null
        ) {

            students.push({

                id:
                    generateStudentId(),

                ...studentData

            });

        } else {

            students =
                students.map(
                    (student) => {

                        if (
                            Number(student.id) ===
                            Number(editingId)
                        ) {

                            return {

                                id:
                                    editingId,

                                ...studentData

                            };

                        }


                        return student;

                    }
                );


            editingId = null;

        }


        localStorage.setItem(
            "students",
            JSON.stringify(students)
        );


        loadClassFilters();

        applyFilters();

        studentForm.reset();

    }
);



/* Edit Student */

function editStudent(id) {

    const student =
        students.find(
            (student) =>
                Number(student.id) ===
                Number(id)
        );


    if (!student) {

        return;

    }


    document.getElementById(
        "studentName"
    ).value =
        student.name;


    document.getElementById(
        "studentAge"
    ).value =
        student.age;


    document.getElementById(
        "studentGender"
    ).value =
        student.gender;


    document.getElementById(
        "studentClass"
    ).value =
        student.studentClass;


    document.getElementById(
        "studentSection"
    ).value =
        student.section;


    document.getElementById(
        "studentEmail"
    ).value =
        student.email;


    document.getElementById(
        "studentPhone"
    ).value =
        student.phone;


    editingId = id;

}



/* Delete Student */

function deleteStudent(id) {

    students =
        students.filter(
            (student) =>
                Number(student.id) !==
                Number(id)
        );


    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );


    let attendance =
        JSON.parse(
            localStorage.getItem(
                "attendance"
            )
        ) || [];


    attendance =
        attendance.filter(
            (record) =>
                Number(record.studentId) !==
                Number(id)
        );


    localStorage.setItem(
        "attendance",
        JSON.stringify(attendance)
    );


    let grades =
        JSON.parse(
            localStorage.getItem(
                "grades"
            )
        ) || [];


    grades =
        grades.filter(
            (record) =>
                Number(record.studentId) !==
                Number(id)
        );


    localStorage.setItem(
        "grades",
        JSON.stringify(grades)
    );


    loadClassFilters();

    applyFilters();

}



/* Search */

searchStudent.addEventListener(
    "input",
    applyFilters
);


/* Class Filter */

filterClass.addEventListener(
    "change",
    applyFilters
);


/* Section Filter */

filterSection.addEventListener(
    "change",
    applyFilters
);


/* Gender Filter */

filterGender.addEventListener(
    "change",
    applyFilters
);


/* Clear Filters */

clearStudentFilters.addEventListener(
    "click",
    function () {

        searchStudent.value = "";

        filterClass.value = "";

        filterSection.value = "";

        filterGender.value = "";

        displayStudents();

    }
);



/* Initial Load */

loadClassFilters();

displayStudents();
/* Export Students */

const exportStudents =
    document.getElementById(
        "exportStudents"
    );


exportStudents.addEventListener(
    "click",
    function () {

        if (students.length === 0) {

            return;

        }


        const exportData =
            students.map(
                (student) => ({

                    ID: student.id,

                    Name: student.name,

                    Age: student.age,

                    Gender: student.gender,

                    Class: student.studentClass,

                    Section: student.section,

                    Email: student.email,

                    Phone: student.phone

                })
            );


        const worksheet =
            XLSX.utils.json_to_sheet(
                exportData
            );


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Students"
        );


        XLSX.writeFile(
            workbook,
            "students.xlsx"
        );

    }
);