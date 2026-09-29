const gradeForm =
    document.getElementById(
        "gradeForm"
    );


const gradeStudent =
    document.getElementById(
        "gradeStudent"
    );


const gradeSummaryList =
    document.getElementById(
        "gradeSummaryList"
    );


const searchGrade =
    document.getElementById(
        "searchGrade"
    );


const filterGradeStudent =
    document.getElementById(
        "filterGradeStudent"
    );


const filterGradeSubject =
    document.getElementById(
        "filterGradeSubject"
    );


const filterGradeRange =
    document.getElementById(
        "filterGradeRange"
    );


const clearGradeFilters =
    document.getElementById(
        "clearGradeFilters"
    );


let students =
    JSON.parse(
        localStorage.getItem(
            "students"
        )
    ) || [];


let grades =
    JSON.parse(
        localStorage.getItem(
            "grades"
        )
    ) || [];



/* Load Students */

function loadStudents() {

    students =
        JSON.parse(
            localStorage.getItem(
                "students"
            )
        ) || [];


    gradeStudent.innerHTML = `
        <option value="">
            Select Student
        </option>
    `;


    filterGradeStudent.innerHTML = `
        <option value="">
            All Students
        </option>
    `;


    students.forEach(
        (student) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                student.id;


            option.textContent =
                student.name;


            gradeStudent.appendChild(
                option
            );


            const filterOption =
                document.createElement(
                    "option"
                );


            filterOption.value =
                student.id;


            filterOption.textContent =
                student.name;


            filterGradeStudent.appendChild(
                filterOption
            );

        }
    );

}



/* Calculate Grade */

function calculateGrade(marks) {

    if (marks >= 90) return "A+";

    if (marks >= 80) return "A";

    if (marks >= 70) return "B";

    if (marks >= 60) return "C";

    if (marks >= 50) return "D";

    return "F";

}



/* Get Student Grades */

function getStudentGrades(
    studentId,
    records = grades
) {

    return records.filter(
        (record) =>
            Number(record.studentId) ===
            Number(studentId)
    );

}



/* Grade Range */

function matchesGradeRange(
    marks,
    range
) {

    if (!range) {

        return true;

    }


    if (range === "90") {

        return marks >= 90;

    }


    if (range === "80") {

        return (
            marks >= 80 &&
            marks < 90
        );

    }


    if (range === "70") {

        return (
            marks >= 70 &&
            marks < 80
        );

    }


    if (range === "60") {

        return (
            marks >= 60 &&
            marks < 70
        );

    }


    if (range === "50") {

        return (
            marks >= 50 &&
            marks < 60
        );

    }


    if (range === "below50") {

        return marks < 50;

    }


    return true;

}



/* Display Grade Summary */

function displayGradeSummary(
    studentData = students,
    records = grades
) {

    gradeSummaryList.innerHTML = "";


    if (
        studentData.length === 0
    ) {

        gradeSummaryList.innerHTML = `
            <p class="empty-message">
                No students found.
            </p>
        `;

        return;

    }


    studentData.forEach(
        (student) => {

            const studentGrades =
                getStudentGrades(
                    student.id,
                    records
                );


            const subjectCount =
                studentGrades.length;


            const totalMarks =
                studentGrades.reduce(
                    (total, record) =>
                        total +
                        Number(record.marks),
                    0
                );


            const average =
                subjectCount > 0
                    ? totalMarks /
                        subjectCount
                    : 0;


            const overallGrade =
                calculateGrade(
                    average
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "grade-summary-row";


            row.innerHTML = `

                <span>
                    ${student.name}
                </span>

                <span>
                    ${subjectCount}
                </span>

                <span>
                    ${average.toFixed(1)}%
                </span>

                <span>
                    ${
                        subjectCount > 0
                            ? overallGrade
                            : "-"
                    }
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


            gradeSummaryList.appendChild(
                row
            );

        }
    );

}



/* Apply Grade Filters */

function applyGradeFilters() {

    const searchValue =
        searchGrade.value
            .toLowerCase()
            .trim();


    const selectedStudent =
        filterGradeStudent.value;


    const selectedSubject =
        filterGradeSubject.value;


    const selectedRange =
        filterGradeRange.value;


    const filteredGrades =
        grades.filter(
            (record) => {

                const student =
                    students.find(
                        (student) =>
                            Number(student.id) ===
                            Number(record.studentId)
                    );


                if (!student) {

                    return false;

                }


                const matchesSearch =
                    student.name
                        .toLowerCase()
                        .includes(
                            searchValue
                        );


                const matchesStudent =
                    !selectedStudent ||
                    Number(record.studentId) ===
                        Number(selectedStudent);


                const matchesSubject =
                    !selectedSubject ||
                    record.subject ===
                        selectedSubject;


                const matchesRange =
                    matchesGradeRange(
                        Number(record.marks),
                        selectedRange
                    );


                return (
                    matchesSearch &&
                    matchesStudent &&
                    matchesSubject &&
                    matchesRange
                );

            }
        );


    let filteredStudents;


    if (
        selectedStudent
    ) {

        filteredStudents =
            students.filter(
                (student) =>
                    Number(student.id) ===
                    Number(selectedStudent)
            );

    } else {

        filteredStudents =
            students.filter(
                (student) =>
                    filteredGrades.some(
                        (record) =>
                            Number(
                                record.studentId
                            ) ===
                            Number(student.id)
                    )
            );

    }


    /*
        Search-only filtering should
        still show matching students.
    */

    if (
        searchValue &&
        !selectedStudent &&
        !selectedSubject &&
        !selectedRange
    ) {

        filteredStudents =
            students.filter(
                (student) =>
                    student.name
                        .toLowerCase()
                        .includes(
                            searchValue
                        )
            );

    }


    displayGradeSummary(
        filteredStudents,
        filteredGrades
    );

}



/* Add / Update Grade */

gradeForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const studentId =
            Number(
                gradeStudent.value
            );


        const subject =
            document.getElementById(
                "gradeSubject"
            ).value;


        const marks =
            Number(
                document.getElementById(
                    "gradeMarks"
                ).value
            );


        if (
            !studentId ||
            !subject ||
            marks < 0 ||
            marks > 100
        ) {

            return;

        }


        const existingGrade =
            grades.find(
                (record) =>
                    Number(
                        record.studentId
                    ) === studentId &&
                    record.subject === subject
            );


        if (existingGrade) {

            existingGrade.marks =
                marks;


            existingGrade.grade =
                calculateGrade(
                    marks
                );

        } else {

            grades.push({

                studentId,

                subject,

                marks,

                grade:
                    calculateGrade(
                        marks
                    )

            });

        }


        localStorage.setItem(
            "grades",
            JSON.stringify(
                grades
            )
        );


        applyGradeFilters();


        gradeForm.reset();

    }
);



/* Search */

searchGrade.addEventListener(
    "input",
    applyGradeFilters
);


/* Student Filter */

filterGradeStudent.addEventListener(
    "change",
    applyGradeFilters
);


/* Subject Filter */

filterGradeSubject.addEventListener(
    "change",
    applyGradeFilters
);


/* Marks Filter */

filterGradeRange.addEventListener(
    "change",
    applyGradeFilters
);


/* Clear Filters */

clearGradeFilters.addEventListener(
    "click",
    function () {

        searchGrade.value = "";

        filterGradeStudent.value = "";

        filterGradeSubject.value = "";

        filterGradeRange.value = "";

        displayGradeSummary();

    }
);



/* Initial Load */

loadStudents();

displayGradeSummary();

/* Export Grades */

const exportGrades =
    document.getElementById(
        "exportGrades"
    );


exportGrades.addEventListener(
    "click",
    function () {

        if (grades.length === 0) {

            return;

        }


        const exportData =
            grades.map(
                (record) => {

                    const student =
                        students.find(
                            (student) =>
                                Number(student.id) ===
                                Number(record.studentId)
                        );


                    return {

                        Student:
                            student
                                ? student.name
                                : "Unknown",

                        StudentID:
                            record.studentId,

                        Subject:
                            record.subject,

                        Marks:
                            record.marks,

                        Grade:
                            record.grade

                    };

                }
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
            "Grades"
        );


        XLSX.writeFile(
            workbook,
            "grades.xlsx"
        );

    }
);