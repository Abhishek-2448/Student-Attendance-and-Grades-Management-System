const API_URL = "http://localhost:3000";


const gradeForm =
    document.getElementById(
        "gradeForm"
    );

const gradeStudent =
    document.getElementById(
        "gradeStudent"
    );

const gradeSubject =
    document.getElementById(
        "gradeSubject"
    );

const gradeMarks =
    document.getElementById(
        "gradeMarks"
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


let students = [];

let grades = [];

let subjects = [];


// ==========================================
// LOAD DATA FROM BACKEND
// ==========================================

async function loadData() {

    try {

        const studentsResponse =
            await fetch(
                `${API_URL}/students`
            );


        if (!studentsResponse.ok) {

            throw new Error(
                "Failed to load students"
            );

        }


        const studentsData =
            await studentsResponse.json();


        students =
            studentsData.map(
                (student) => ({

                    ...student,

                    studentClass:
                        student.class

                })
            );


        const subjectsResponse =
            await fetch(
                `${API_URL}/subjects`
            );


        if (!subjectsResponse.ok) {

            throw new Error(
                "Failed to load subjects"
            );

        }


        subjects =
            await subjectsResponse.json();


        const gradesResponse =
            await fetch(
                `${API_URL}/grades`
            );


        if (!gradesResponse.ok) {

            throw new Error(
                "Failed to load grades"
            );

        }


        grades =
            await gradesResponse.json();


        loadStudents();

        loadSubjects();

        applyGradeFilters();


    } catch (error) {

        console.error(error);


        gradeSummaryList.innerHTML = `
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



// ==========================================
// LOAD SUBJECTS
// ==========================================

function loadSubjects() {

    /*
     * Grade form subject dropdown
     */

    gradeSubject.innerHTML = `
        <option value="">
            Select Subject
        </option>
    `;


    /*
     * Subject filter dropdown
     */

    filterGradeSubject.innerHTML = `
        <option value="">
            All Subjects
        </option>
    `;


    subjects.forEach(
        (subject) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                subject.id;


            option.textContent =
                subject.subject_name;


            gradeSubject.appendChild(
                option
            );


            const filterOption =
                document.createElement(
                    "option"
                );


            filterOption.value =
                subject.id;


            filterOption.textContent =
                subject.subject_name;


            filterGradeSubject.appendChild(
                filterOption
            );

        }
    );

}



// ==========================================
// CALCULATE GRADE
// ==========================================

function calculateGrade(marks) {

    if (marks >= 90)
        return "A+";

    if (marks >= 80)
        return "A";

    if (marks >= 70)
        return "B";

    if (marks >= 60)
        return "C";

    if (marks >= 50)
        return "D";

    return "F";

}



// ==========================================
// GET STUDENT GRADES
// ==========================================

function getStudentGrades(
    studentId,
    records = grades
) {

    return records.filter(
        (record) =>
            Number(
                record.student_id
            ) ===
            Number(studentId)
    );

}



// ==========================================
// GET SUBJECT NAME
// ==========================================

function getSubjectName(
    subjectId
) {

    const subject =
        subjects.find(
            (item) =>
                Number(item.id) ===
                Number(subjectId)
        );


    return subject
        ? subject.subject_name
        : "Unknown";

}



// ==========================================
// GRADE RANGE
// ==========================================

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



// ==========================================
// DISPLAY GRADE SUMMARY
// ==========================================

function displayGradeSummary(
    studentData = students,
    records = grades
) {

    gradeSummaryList.innerHTML =
        "";


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
                        Number(
                            record.marks
                        ),
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



// ==========================================
// APPLY GRADE FILTERS
// ==========================================

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
                            Number(
                                student.id
                            ) ===
                            Number(
                                record.student_id
                            )
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
                    Number(
                        record.student_id
                    ) ===
                        Number(
                            selectedStudent
                        );


                const matchesSubject =
                    !selectedSubject ||
                    Number(
                        record.subject_id
                    ) ===
                        Number(
                            selectedSubject
                        );


                const matchesRange =
                    matchesGradeRange(
                        Number(
                            record.marks
                        ),
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
                    Number(
                        student.id
                    ) ===
                    Number(
                        selectedStudent
                    )
            );

    } else {

        filteredStudents =
            students.filter(
                (student) =>
                    filteredGrades.some(
                        (record) =>
                            Number(
                                record.student_id
                            ) ===
                            Number(
                                student.id
                            )
                    )
            );

    }


    /*
     * Search-only filtering should
     * still show matching students.
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


    /*
     * No filters:
     * display every student.
     */

    if (
        !searchValue &&
        !selectedStudent &&
        !selectedSubject &&
        !selectedRange
    ) {

        filteredStudents =
            students;

    }


    displayGradeSummary(
        filteredStudents,
        filteredGrades
    );

}



// ==========================================
// ADD / UPDATE GRADE
// ==========================================

gradeForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const studentId =
            Number(
                gradeStudent.value
            );


        const subjectId =
            Number(
                gradeSubject.value
            );


        const marks =
            Number(
                gradeMarks.value
            );


        if (
            !studentId ||
            !subjectId ||
            marks < 0 ||
            marks > 100
        ) {

            return;

        }


        try {

            /*
             * Check if this student already
             * has a grade for this subject.
             */

            const existingGrade =
                grades.find(
                    (record) =>
                        Number(
                            record.student_id
                        ) === studentId &&
                        Number(
                            record.subject_id
                        ) === subjectId
                );


            let response;


            /*
             * UPDATE existing grade
             */

            if (existingGrade) {

                response =
                    await fetch(
                        `${API_URL}/grades/${existingGrade.id}`,
                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    studentId:
                                        studentId,

                                    subjectId:
                                        subjectId,

                                    marks:
                                        marks

                                })

                        }
                    );

            }


            /*
             * ADD new grade
             */

            else {

                response =
                    await fetch(
                        `${API_URL}/grades`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    studentId:
                                        studentId,

                                    subjectId:
                                        subjectId,

                                    marks:
                                        marks

                                })

                        }
                    );

            }


            const result =
                await response.json();


            if (!response.ok) {

                alert(
                    result.message ||
                    "Unable to save grade."
                );

                return;

            }


            if (existingGrade) {

                alert(
                    "Grade updated successfully."
                );

            } else {

                alert(
                    "Grade added successfully."
                );

            }


            /*
             * Reload everything
             * from MySQL.
             */

            await loadData();


            gradeForm.reset();


        } catch (error) {

            console.error(error);


            alert(
                "Unable to connect to the server."
            );

        }

    }
);



// ==========================================
// SEARCH
// ==========================================

searchGrade.addEventListener(
    "input",
    applyGradeFilters
);



// ==========================================
// STUDENT FILTER
// ==========================================

filterGradeStudent.addEventListener(
    "change",
    applyGradeFilters
);



// ==========================================
// SUBJECT FILTER
// ==========================================

filterGradeSubject.addEventListener(
    "change",
    applyGradeFilters
);



// ==========================================
// MARKS FILTER
// ==========================================

filterGradeRange.addEventListener(
    "change",
    applyGradeFilters
);



// ==========================================
// CLEAR FILTERS
// ==========================================

clearGradeFilters.addEventListener(
    "click",
    function () {

        searchGrade.value =
            "";

        filterGradeStudent.value =
            "";

        filterGradeSubject.value =
            "";

        filterGradeRange.value =
            "";

        applyGradeFilters();

    }
);



// ==========================================
// EXPORT GRADES
// ==========================================

const exportGrades =
    document.getElementById(
        "exportGrades"
    );


exportGrades.addEventListener(
    "click",
    function () {

        if (
            grades.length === 0
        ) {

            return;

        }


        const exportData =
            grades.map(
                (record) => {

                    const student =
                        students.find(
                            (student) =>
                                Number(
                                    student.id
                                ) ===
                                Number(
                                    record.student_id
                                )
                        );


                    return {

                        Student:
                            student
                                ? student.name
                                : "Unknown",

                        StudentID:
                            record.student_id,

                        Subject:
                            getSubjectName(
                                record.subject_id
                            ),

                        Marks:
                            record.marks,

                        Grade:
                            calculateGrade(
                                Number(
                                    record.marks
                                )
                            )

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



// ==========================================
// INITIAL LOAD
// ==========================================

loadData();