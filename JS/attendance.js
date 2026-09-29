const attendanceForm =
    document.getElementById(
        "attendanceForm"
    );


const attendanceStudent =
    document.getElementById(
        "attendanceStudent"
    );


const attendanceDate =
    document.getElementById(
        "attendanceDate"
    );


const attendanceStatus =
    document.getElementById(
        "attendanceStatus"
    );


const attendanceSummaryList =
    document.getElementById(
        "attendanceSummaryList"
    );


const searchAttendance =
    document.getElementById(
        "searchAttendance"
    );


const filterAttendanceStudent =
    document.getElementById(
        "filterAttendanceStudent"
    );


const filterAttendanceDate =
    document.getElementById(
        "filterAttendanceDate"
    );


const filterAttendanceStatus =
    document.getElementById(
        "filterAttendanceStatus"
    );


const clearAttendanceFilters =
    document.getElementById(
        "clearAttendanceFilters"
    );


const heatmapStudent =
    document.getElementById(
        "heatmapStudent"
    );


const attendanceHeatmap =
    document.getElementById(
        "attendanceHeatmap"
    );


let attendance =
    JSON.parse(
        localStorage.getItem(
            "attendance"
        )
    ) || [];


let students =
    JSON.parse(
        localStorage.getItem(
            "students"
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


            attendanceStudent.appendChild(
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


            filterAttendanceStudent.appendChild(
                filterOption
            );


            const heatmapOption =
                document.createElement(
                    "option"
                );


            heatmapOption.value =
                student.id;


            heatmapOption.textContent =
                student.name;


            heatmapStudent.appendChild(
                heatmapOption
            );

        }
    );

}



/* Attendance Data */

function getAttendanceData(
    studentId,
    records = attendance
) {

    const studentRecords =
        records.filter(
            (record) =>
                Number(record.studentId) ===
                Number(studentId)
        );


    const total =
        studentRecords.length;


    const present =
        studentRecords.filter(
            (record) =>
                record.status === "Present"
        ).length;


    const absent =
        studentRecords.filter(
            (record) =>
                record.status === "Absent"
        ).length;


    const percentage =
        total > 0
            ? (present / total) * 100
            : 0;


    return {

        total,

        present,

        absent,

        percentage

    };

}



/* Display Summary */

function displayAttendanceSummary(
    studentData = students,
    records = attendance
) {

    attendanceSummaryList.innerHTML = "";


    if (
        studentData.length === 0
    ) {

        attendanceSummaryList.innerHTML = `
            <p class="empty-message">
                No students found.
            </p>
        `;

        return;

    }


    studentData.forEach(
        (student) => {

            const data =
                getAttendanceData(
                    student.id,
                    records
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "attendance-summary-row";


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


            attendanceSummaryList.appendChild(
                row
            );

        }
    );

}



/* Apply Filters */

function applyAttendanceFilters() {

    const searchValue =
        searchAttendance.value
            .toLowerCase()
            .trim();


    const selectedStudent =
        filterAttendanceStudent.value;


    const selectedDate =
        filterAttendanceDate.value;


    const selectedStatus =
        filterAttendanceStatus.value;


    const filteredRecords =
        attendance.filter(
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


                const matchesDate =
                    !selectedDate ||
                    record.date ===
                        selectedDate;


                const matchesStatus =
                    !selectedStatus ||
                    record.status ===
                        selectedStatus;


                return (
                    matchesSearch &&
                    matchesStudent &&
                    matchesDate &&
                    matchesStatus
                );

            }
        );


    /*
        Find students represented
        by the filtered attendance.
    */

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
                    filteredRecords.some(
                        (record) =>
                            Number(
                                record.studentId
                            ) ===
                            Number(student.id)
                    )
            );

    }


    /*
        If only search is active and
        there are no attendance records,
        still allow matching students.
    */

    if (
        searchValue &&
        !selectedDate &&
        !selectedStatus &&
        !selectedStudent
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


    displayAttendanceSummary(
        filteredStudents,
        filteredRecords
    );

}



/* Mark Attendance */

attendanceForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const studentId =
            Number(
                attendanceStudent.value
            );


        const date =
            attendanceDate.value;


        const status =
            attendanceStatus.value;


        if (
            !studentId ||
            !date ||
            !status
        ) {

            return;

        }


        const existingRecord =
            attendance.find(
                (record) =>
                    Number(record.studentId) ===
                        studentId &&
                    record.date === date
            );


        if (existingRecord) {

            existingRecord.status =
                status;

        } else {

            attendance.push({

                studentId,

                date,

                status

            });

        }


        localStorage.setItem(
            "attendance",
            JSON.stringify(
                attendance
            )
        );


        applyAttendanceFilters();


        displayHeatmap(
            Number(
                heatmapStudent.value
            )
        );


        attendanceForm.reset();

    }
);



/* Search */

searchAttendance.addEventListener(
    "input",
    applyAttendanceFilters
);


/* Student Filter */

filterAttendanceStudent.addEventListener(
    "change",
    applyAttendanceFilters
);


/* Date Filter */

filterAttendanceDate.addEventListener(
    "change",
    applyAttendanceFilters
);


/* Status Filter */

filterAttendanceStatus.addEventListener(
    "change",
    applyAttendanceFilters
);


/* Clear Filters */

clearAttendanceFilters.addEventListener(
    "click",
    function () {

        searchAttendance.value = "";

        filterAttendanceStudent.value = "";

        filterAttendanceDate.value = "";

        filterAttendanceStatus.value = "";

        displayAttendanceSummary();

    }
);



/* Heatmap */

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


    const studentAttendance =
        attendance.filter(
            (record) =>
                Number(record.studentId) ===
                Number(studentId)
        );


    if (
        studentAttendance.length === 0
    ) {

        attendanceHeatmap.innerHTML = `
            <p>
                No attendance records available.
            </p>
        `;

        return;

    }


    studentAttendance.forEach(
        (record) => {

            const day =
                document.createElement(
                    "div"
                );


            day.className =
                "heatmap-day";


            if (
                record.status === "Present"
            ) {

                day.classList.add(
                    "heatmap-present"
                );

            } else {

                day.classList.add(
                    "heatmap-absent"
                );

            }


            day.innerHTML = `

                <strong>
                    ${record.date}
                </strong>

                <span>
                    ${record.status}
                </span>

            `;


            attendanceHeatmap.appendChild(
                day
            );

        }
    );

}



heatmapStudent.addEventListener(
    "change",
    function () {

        displayHeatmap(
            Number(this.value)
        );

    }
);



/* Initial Load */

loadStudents();

displayAttendanceSummary();

displayHeatmap();

/* Export Attendance */

const exportAttendance =
    document.getElementById(
        "exportAttendance"
    );


exportAttendance.addEventListener(
    "click",
    function () {

        if (attendance.length === 0) {

            return;

        }


        const exportData =
            attendance.map(
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

                        Date:
                            record.date,

                        Status:
                            record.status

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
            "Attendance"
        );


        XLSX.writeFile(
            workbook,
            "attendance.xlsx"
        );

    }
);