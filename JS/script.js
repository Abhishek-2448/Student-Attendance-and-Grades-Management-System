const totalStudents =
    document.getElementById("totalStudents");

const overallAttendance =
    document.getElementById("overallAttendance");

const averageGrade =
    document.getElementById("averageGrade");

const studentsAtRisk =
    document.getElementById("studentsAtRisk");

const recentStudents =
    document.getElementById("recentStudents");

const warningStudents =
    document.getElementById("warningStudents");

const excellentStudents =
    document.getElementById("excellentStudents");

const averageStudents =
    document.getElementById("averageStudents");

const weakStudents =
    document.getElementById("weakStudents");

const leaderboardList =
    document.getElementById("leaderboardList");

let students =
    JSON.parse(localStorage.getItem("students")) || [];

let attendance =
    JSON.parse(localStorage.getItem("attendance")) || [];

let grades =
    JSON.parse(localStorage.getItem("grades")) || [];



/* Total Students */

totalStudents.textContent =
    students.length;



/* Overall Attendance */

const totalAttendanceRecords =
    attendance.length;

const totalPresent =
    attendance.filter(
        (record) =>
            record.status === "Present"
    ).length;

const attendancePercentage =
    totalAttendanceRecords > 0
        ? (totalPresent / totalAttendanceRecords) * 100
        : 0;

overallAttendance.textContent =
    `${attendancePercentage.toFixed(1)}%`;



/* Average Grade */

if (grades.length > 0) {

    const totalMarks =
        grades.reduce(
            (total, record) =>
                total + Number(record.marks),
            0
        );

    const average =
        totalMarks / grades.length;

    averageGrade.textContent =
        `${average.toFixed(1)}%`;

} else {

    averageGrade.textContent =
        "0%";

}



/* Student Performance */

let excellentCount = 0;

let averageCount = 0;

let weakCount = 0;

let riskCount = 0;


students.forEach((student) => {

    const studentGrades =
        grades.filter(
            (record) =>
                Number(record.studentId) ===
                Number(student.id)
        );


    const studentAttendance =
        attendance.filter(
            (record) =>
                Number(record.studentId) ===
                Number(student.id)
        );


    const marks =
        studentGrades.length > 0
            ? studentGrades.reduce(
                (total, record) =>
                    total + Number(record.marks),
                0
            ) / studentGrades.length
            : 0;


    const present =
        studentAttendance.filter(
            (record) =>
                record.status === "Present"
        ).length;


    const attendancePercentage =
        studentAttendance.length > 0
            ? (present / studentAttendance.length) * 100
            : 0;


    if (
        studentGrades.length > 0 &&
        marks >= 80
    ) {

        excellentCount++;

    } else if (
        studentGrades.length > 0 &&
        marks >= 50
    ) {

        averageCount++;

    } else if (
        studentGrades.length > 0
    ) {

        weakCount++;

    }


    if (
        (
            studentAttendance.length > 0 &&
            attendancePercentage < 75
        ) ||
        (
            studentGrades.length > 0 &&
            marks < 50
        )
    ) {

        riskCount++;

    }

});


studentsAtRisk.textContent =
    riskCount;


excellentStudents.textContent =
    excellentCount;

averageStudents.textContent =
    averageCount;

weakStudents.textContent =
    weakCount;



/* Recent Students */

function displayRecentStudents() {

    recentStudents.innerHTML = "";


    const latestStudents =
        students
            .slice(-5)
            .reverse();


    if (latestStudents.length === 0) {

        recentStudents.innerHTML = `
            <p>No students available.</p>
        `;

        return;

    }


    latestStudents.forEach((student) => {

        const row =
            document.createElement("div");


        row.className =
            "dashboard-student-row";


        row.innerHTML = `

            <span>
                ${student.id}
            </span>

            <span>
                ${student.name}
            </span>

            <span>
                ${student.studentClass}
            </span>

            <span>
                ${student.section}
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


        recentStudents.appendChild(row);

    });

}


displayRecentStudents();



/* Students Needing Attention */

function displayWarnings() {

    warningStudents.innerHTML = "";


    const warnings = [];


    students.forEach((student) => {

        const studentGrades =
            grades.filter(
                (record) =>
                    Number(record.studentId) ===
                    Number(student.id)
            );


        const studentAttendance =
            attendance.filter(
                (record) =>
                    Number(record.studentId) ===
                    Number(student.id)
            );


        const average =
            studentGrades.length > 0
                ? studentGrades.reduce(
                    (total, record) =>
                        total + Number(record.marks),
                    0
                ) / studentGrades.length
                : 0;


        const present =
            studentAttendance.filter(
                (record) =>
                    record.status === "Present"
            ).length;


        const attendancePercentage =
            studentAttendance.length > 0
                ? (present / studentAttendance.length) * 100
                : 0;


        const reasons = [];


        if (
            studentAttendance.length > 0 &&
            attendancePercentage < 75
        ) {

            reasons.push(
                `Attendance ${attendancePercentage.toFixed(1)}%`
            );

        }


        if (
            studentGrades.length > 0 &&
            average < 50
        ) {

            reasons.push(
                `Average marks ${average.toFixed(1)}%`
            );

        }


        if (reasons.length > 0) {

            warnings.push({
                student,
                reasons
            });

        }

    });


    if (warnings.length === 0) {

        warningStudents.innerHTML = `
            <p>
                No students currently need attention.
            </p>
        `;

        return;

    }


    warnings.forEach((warning) => {

        const item =
            document.createElement("div");


        item.className =
            "dashboard-warning";


        item.innerHTML = `

            <strong>
                ${warning.student.name}
            </strong>

            <span>
                ${warning.reasons.join(" | ")}
            </span>

            <a
                href="student-profile.html?id=${warning.student.id}"
                class="student-profile-link"
            >
                View Profile
            </a>

        `;


        warningStudents.appendChild(item);

    });

}


displayWarnings();

function displayLeaderboard() {

    leaderboardList.innerHTML = "";

    const leaderboard = [];


    students.forEach((student) => {

        const studentAttendance =
            attendance.filter(
                (record) =>
                    Number(record.studentId) ===
                    Number(student.id)
            );


        const studentGrades =
            grades.filter(
                (record) =>
                    Number(record.studentId) ===
                    Number(student.id)
            );


        const present =
            studentAttendance.filter(
                (record) =>
                    record.status === "Present"
            ).length;


        const attendancePercentage =
            studentAttendance.length > 0
                ? (present / studentAttendance.length) * 100
                : 0;


        const average =
            studentGrades.length > 0
                ? studentGrades.reduce(
                    (total, record) =>
                        total + Number(record.marks),
                    0
                ) / studentGrades.length
                : 0;


        const points =
            (present * 10) +
            studentGrades.reduce(
                (total, record) =>
                    total + Number(record.marks),
                0
            );


        const badges = [];


        if (
            studentAttendance.length > 0 &&
            present === studentAttendance.length
        ) {

            badges.push("Perfect Attendance");

        }


        if (average >= 80) {

            badges.push("Consistent Performer");

        }


        leaderboard.push({

            student,

            attendancePercentage,

            average,

            points,

            badges: badges.length

        });

    });


    leaderboard.sort(
        (a, b) =>
            b.points - a.points
    );


    leaderboard.forEach(
        (item, index) => {

            const row =
                document.createElement("div");


            row.className =
                "leaderboard-row";


            row.innerHTML = `

                <span>
                    ${index + 1}
                </span>

                <span>

                    <a
                        href="student-profile.html?id=${item.student.id}"
                        class="student-profile-link"
                    >
                        ${item.student.name}
                    </a>

                </span>

                <span>
                    ${item.attendancePercentage.toFixed(1)}%
                </span>

                <span>
                    ${item.average.toFixed(1)}%
                </span>

                <span>
                    ${item.points}
                </span>

                <span>
                    ${item.badges}
                </span>

            `;


            leaderboardList.appendChild(row);

        }
    );

}


displayLeaderboard();