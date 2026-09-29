const params =
    new URLSearchParams(window.location.search);

const studentId =
    Number(params.get("id"));


const students =
    JSON.parse(
        localStorage.getItem("students")
    ) || [];


const attendance =
    JSON.parse(
        localStorage.getItem("attendance")
    ) || [];


const grades =
    JSON.parse(
        localStorage.getItem("grades")
    ) || [];


const student =
    students.find(
        (student) =>
            Number(student.id) === studentId
    );


if (!student) {

    document.body.innerHTML = `
        <h2>Student not found</h2>

        <a href="students.html">
            Back to Students
        </a>
    `;

} else {

    loadStudentProfile();

    loadAttendance();

    loadGrades();

    calculatePerformance();

    generateRecommendations();

    generateEarlyWarning();

    generateGamification();

}



/* Student Profile */

function loadStudentProfile() {

    document.getElementById("studentName").textContent =
        student.name;

    document.getElementById("studentId").textContent =
        student.id;

    document.getElementById("studentAge").textContent =
        student.age;

    document.getElementById("studentGender").textContent =
        student.gender;

    document.getElementById("studentClass").textContent =
        student.studentClass;

    document.getElementById("studentSection").textContent =
        student.section;

    document.getElementById("studentEmail").textContent =
        student.email;

    document.getElementById("studentPhone").textContent =
        student.phone;
}



/* Attendance */

function loadAttendance() {

    const studentAttendance =
        attendance.filter(
            (record) =>
                Number(record.studentId) ===
                studentId
        );


    const total =
        studentAttendance.length;


    const present =
        studentAttendance.filter(
            (record) =>
                record.status === "Present"
        ).length;


    const absent =
        studentAttendance.filter(
            (record) =>
                record.status === "Absent"
        ).length;


    const percentage =
        total > 0
            ? (present / total) * 100
            : 0;


    document.getElementById(
        "totalClasses"
    ).textContent = total;


    document.getElementById(
        "presentClasses"
    ).textContent = present;


    document.getElementById(
        "absentClasses"
    ).textContent = absent;


    document.getElementById(
        "attendancePercentage"
    ).textContent =
        `${percentage.toFixed(1)}%`;


    const history =
        document.getElementById(
            "attendanceHistory"
        );


    history.innerHTML = "";


    if (studentAttendance.length === 0) {

        history.innerHTML = `
            <p>No attendance records available.</p>
        `;

        return;

    }


    studentAttendance.forEach(
        (record) => {

            const row =
                document.createElement("div");


            row.className =
                "profile-record";


            row.innerHTML = `

                <span>
                    ${record.date}
                </span>

                <span>
                    ${record.status}
                </span>

            `;


            history.appendChild(row);

        }
    );

}



/* Grades */

function loadGrades() {

    const studentGrades =
        grades.filter(
            (record) =>
                Number(record.studentId) ===
                studentId
        );


    const totalSubjects =
        studentGrades.length;


    const totalMarks =
        studentGrades.reduce(
            (total, record) =>
                total + Number(record.marks),
            0
        );


    const average =
        totalSubjects > 0
            ? totalMarks / totalSubjects
            : 0;


    document.getElementById(
        "totalSubjects"
    ).textContent =
        totalSubjects;


    document.getElementById(
        "averageMarks"
    ).textContent =
        `${average.toFixed(1)}%`;


    document.getElementById(
        "overallGrade"
    ).textContent =
        calculateGrade(average);


    const gradeHistory =
        document.getElementById(
            "gradeHistory"
        );


    gradeHistory.innerHTML = "";


    if (studentGrades.length === 0) {

        gradeHistory.innerHTML = `
            <p>No grade records available.</p>
        `;

        return;

    }


    studentGrades.forEach(
        (record) => {

            const row =
                document.createElement("div");


            row.className =
                "profile-record";


            row.innerHTML = `

                <span>
                    ${record.subject}
                </span>

                <span>
                    ${record.marks}
                </span>

                <span>
                    ${record.grade}
                </span>

            `;


            gradeHistory.appendChild(row);

        }
    );

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

    const studentAttendance =
        attendance.filter(
            (record) =>
                Number(record.studentId) ===
                studentId
        );


    const studentGrades =
        grades.filter(
            (record) =>
                Number(record.studentId) ===
                studentId
        );


    if (
        studentAttendance.length === 0 ||
        studentGrades.length === 0
    ) {

        document.getElementById(
            "performancePrediction"
        ).textContent =
            "Not enough data to predict performance.";

        return;

    }


    const present =
        studentAttendance.filter(
            (record) =>
                record.status === "Present"
        ).length;


    const attendancePercentage =
        (
            present /
            studentAttendance.length
        ) * 100;


    const average =
        studentGrades.reduce(
            (total, record) =>
                total + Number(record.marks),
            0
        ) /
        studentGrades.length;


    let prediction;


    if (
        attendancePercentage >= 85 &&
        average >= 75
    ) {

        prediction =
            "Low Risk - The student is showing consistent academic performance.";

    } else if (
        attendancePercentage >= 70 &&
        average >= 50
    ) {

        prediction =
            "Medium Risk - The student may benefit from additional academic support.";

    } else {

        prediction =
            "High Risk - The student may need immediate academic and attendance support.";

    }


    document.getElementById(
        "performancePrediction"
    ).textContent =
        prediction;

}



/* Study Recommendations */

function generateRecommendations() {

    const container =
        document.getElementById(
            "studyRecommendations"
        );


    const studentAttendance =
        attendance.filter(
            (record) =>
                Number(record.studentId) ===
                studentId
        );


    const studentGrades =
        grades.filter(
            (record) =>
                Number(record.studentId) ===
                studentId
        );


    const recommendations = [];


    if (studentAttendance.length > 0) {

        const present =
            studentAttendance.filter(
                (record) =>
                    record.status === "Present"
            ).length;


        const percentage =
            (
                present /
                studentAttendance.length
            ) * 100;


        if (percentage < 75) {

            recommendations.push(
                "Improve attendance and attend classes regularly."
            );

        }

    }


    studentGrades.forEach(
        (record) => {

            if (record.marks < 50) {

                recommendations.push(
                    `Spend more study time on ${record.subject}.`
                );

            } else if (record.marks < 70) {

                recommendations.push(
                    `Practice more questions in ${record.subject}.`
                );

            }

        }
    );


    if (recommendations.length === 0) {

        recommendations.push(
            "Keep up the current performance and maintain consistent study habits."
        );

    }


    container.innerHTML =
        recommendations
            .map(
                (recommendation) =>
                    `<p>• ${recommendation}</p>`
            )
            .join("");

}



/* Early Warning */

function generateEarlyWarning() {

    const container =
        document.getElementById(
            "earlyWarning"
        );


    const studentAttendance =
        attendance.filter(
            (record) =>
                Number(record.studentId) ===
                studentId
        );


    const studentGrades =
        grades.filter(
            (record) =>
                Number(record.studentId) ===
                studentId
        );


    const warnings = [];


    if (studentAttendance.length > 0) {

        const present =
            studentAttendance.filter(
                (record) =>
                    record.status === "Present"
            ).length;


        const percentage =
            (
                present /
                studentAttendance.length
            ) * 100;


        if (percentage < 75) {

            warnings.push(
                `Low attendance: ${percentage.toFixed(1)}%`
            );

        }

    }


    studentGrades.forEach(
        (record) => {

            if (record.marks < 50) {

                warnings.push(
                    `Low marks in ${record.subject}: ${record.marks}`
                );

            }

        }
    );


    if (warnings.length === 0) {

        container.innerHTML =
            "<p>No current warnings.</p>";

    } else {

        container.innerHTML =
            warnings
                .map(
                    (warning) =>
                        `<p>⚠ ${warning}</p>`
                )
                .join("");

    }

}



/* Gamification */

function generateGamification() {

    const studentAttendance =
        attendance.filter(
            (record) =>
                Number(record.studentId) ===
                studentId
        );


    const studentGrades =
        grades.filter(
            (record) =>
                Number(record.studentId) ===
                studentId
        );


    const present =
        studentAttendance.filter(
            (record) =>
                record.status === "Present"
        ).length;


    /* Calculate Average */

    const average =
        studentGrades.length > 0
            ? studentGrades.reduce(
                (total, record) =>
                    total + Number(record.marks),
                0
            ) /
            studentGrades.length
            : 0;


    /* Calculate Points */

    let points = 0;


    /*
        Attendance points

        10 points for every
        Present attendance record
    */

    points += present * 10;


    /*
        Academic points

        Marks are added to
        the student's points
    */

    points += studentGrades.reduce(
        (total, record) =>
            total + Number(record.marks),
        0
    );


    /*
        Perfect attendance bonus
    */

    if (
        studentAttendance.length > 0 &&
        present === studentAttendance.length
    ) {

        points += 50;

    }


    /*
        High performance bonus
    */

    if (average >= 80) {

        points += 50;

    }


    /* Badges */

    const badges = [];


    /*
        Perfect Attendance
    */

    if (
        studentAttendance.length > 0 &&
        present === studentAttendance.length
    ) {

        badges.push(
            "Perfect Attendance"
        );

    }


    /*
        Consistent Performer
    */

    if (average >= 80) {

        badges.push(
            "Consistent Performer"
        );

    }


    /*
        Most Improved

        Compare the first and
        latest grade records.
    */

    if (
        studentGrades.length >= 2
    ) {

        const firstMark =
            Number(
                studentGrades[0].marks
            );


        const lastMark =
            Number(
                studentGrades[
                    studentGrades.length - 1
                ].marks
            );


        if (
            lastMark > firstMark
        ) {

            badges.push(
                "Most Improved"
            );

        }

    }


    /* Display Points */

    document.getElementById(
        "studentPoints"
    ).textContent =
        points;


    /* Display Badge Count */

    document.getElementById(
        "studentBadges"
    ).textContent =
        badges.length;


    /* Display Badges */

    document.getElementById(
        "badgesList"
    ).innerHTML =
        badges.length > 0

            ? badges
                .map(
                    (badge) =>
                        `<span class="badge">${badge}</span>`
                )
                .join("")

            : "<p>No badges earned yet.</p>";

}