// =============================================
// SCHOOL MANAGEMENT SYSTEM - JAVASCRIPT
// =============================================

// API Base URL
const API_URL = '/api';

// DOM Elements
const loader = document.querySelector('.loader');
const navToggle = document.querySelector('.nav-toggle');
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-link');
const pageSections = document.querySelectorAll('.page-section');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1000);

    loadDashboard();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Navigation Toggle
    navToggle.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });

    // Navigation Links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
            navbar.classList.remove('active');
        });
    });

    // Modal Close
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Add Buttons
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) addStudentBtn.addEventListener('click', () => openStudentModal());

    const addTeacherBtn = document.getElementById('addTeacherBtn');
    if (addTeacherBtn) addTeacherBtn.addEventListener('click', () => openTeacherModal());

    const addCourseBtn = document.getElementById('addCourseBtn');
    if (addCourseBtn) addCourseBtn.addEventListener('click', () => openCourseModal());

    const addMarksBtn = document.getElementById('addMarksBtn');
    if (addMarksBtn) addMarksBtn.addEventListener('click', () => openMarksModal());

    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    if (markAttendanceBtn) markAttendanceBtn.addEventListener('click', () => openAttendanceModal());

    const addFeeBtn = document.getElementById('addFeeBtn');
    if (addFeeBtn) addFeeBtn.addEventListener('click', () => openFeeModal());
}

// Navigation
function navigateTo(page) {
    navLinks.forEach(link => link.classList.remove('active'));
    const navLink = document.querySelector('[data-page="' + page + '"]');
    if (navLink) navLink.classList.add('active');

    pageSections.forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(page);
    if (targetSection) targetSection.classList.add('active');

    // Load data for the page
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'students':
            loadStudents();
            break;
        case 'teachers':
            loadTeachers();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'marks':
            loadMarks();
            break;
        case 'attendance':
            loadAttendance();
            break;
        case 'fees':
            loadFees();
            break;
    }
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        const response = await fetch(API_URL + '/stats');
        const stats = await response.json();

        animateValue('totalStudents', stats.totalStudents);
        animateValue('totalTeachers', stats.totalTeachers);
        animateValue('totalCourses', stats.totalCourses);
        animateValue('totalFees', stats.totalFees, '$');
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function animateValue(elementId, end, prefix) {
    prefix = prefix || '';
    const element = document.getElementById(elementId);
    if (!element) return;

    const duration = 1500;
    const start = 0;
    const increment = end / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = prefix + Math.floor(current).toLocaleString();
    }, 16);
}

// ==================== STUDENTS ====================

async function loadStudents() {
    try {
        const response = await fetch(API_URL + '/students');
        const students = await response.json();

        const tbody = document.querySelector('#studentsTable tbody');
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fas fa-user-graduate"></i><p>No students found</p></td></tr>';
            return;
        }

        tbody.innerHTML = students.map(function(student) {
            return '<tr>' +
                '<td>' + (student.roll_number || '-') + '</td>' +
                '<td>' + student.name + '</td>' +
                '<td>' + (student.class || '-') + '</td>' +
                '<td>' + (student.section || '-') + '</td>' +
                '<td>' + (student.email || '-') + '</td>' +
                '<td>' + (student.phone || '-') + '</td>' +
                '<td><span class="status-badge ' + student.status + '">' + student.status + '</span></td>' +
                '<td>' +
                '<div class="action-buttons">' +
                '<button class="action-btn edit" onclick="openStudentModal(' + student.id + ')">' +
                '<i class="fas fa-edit"></i>' +
                '</button>' +
                '<button class="action-btn delete" onclick="deleteStudent(' + student.id + ')">' +
                '<i class="fas fa-trash"></i>' +
                '</button>' +
                '</div>' +
                '</td>' +
                '</tr>';
        }).join('');
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function openStudentModal(id) {
    if (id) {
        fetch(API_URL + '/students/' + id)
            .then(function(res) { return res.json(); })
            .then(function(student) {
                showStudentForm(student);
            });
    } else {
        showStudentForm();
    }
}

function showStudentForm(student) {
    student = student || {};
    modalTitle.textContent = student.id ? 'Edit Student' : 'Add Student';
    modalBody.innerHTML =
        '<form id="studentForm">' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Full Name *</label>' +
        '<input type="text" name="name" class="form-control" value="' + (student.name || '') + '" required>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Email</label>' +
        '<input type="email" name="email" class="form-control" value="' + (student.email || '') + '">' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Phone</label>' +
        '<input type="tel" name="phone" class="form-control" value="' + (student.phone || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Roll Number</label>' +
        '<input type="text" name="roll_number" class="form-control" value="' + (student.roll_number || '') + '">' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Class</label>' +
        '<select name="class" class="form-control">' +
        '<option value="">Select Class</option>' +
        '<option value="Class 1" ' + (student.class === 'Class 1' ? 'selected' : '') + '>Class 1</option>' +
        '<option value="Class 2" ' + (student.class === 'Class 2' ? 'selected' : '') + '>Class 2</option>' +
        '<option value="Class 3" ' + (student.class === 'Class 3' ? 'selected' : '') + '>Class 3</option>' +
        '<option value="Class 4" ' + (student.class === 'Class 4' ? 'selected' : '') + '>Class 4</option>' +
        '<option value="Class 5" ' + (student.class === 'Class 5' ? 'selected' : '') + '>Class 5</option>' +
        '<option value="Class 6" ' + (student.class === 'Class 6' ? 'selected' : '') + '>Class 6</option>' +
        '<option value="Class 7" ' + (student.class === 'Class 7' ? 'selected' : '') + '>Class 7</option>' +
        '<option value="Class 8" ' + (student.class === 'Class 8' ? 'selected' : '') + '>Class 8</option>' +
        '<option value="Class 9" ' + (student.class === 'Class 9' ? 'selected' : '') + '>Class 9</option>' +
        '<option value="Class 10" ' + (student.class === 'Class 10' ? 'selected' : '') + '>Class 10</option>' +
        '</select>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Section</label>' +
        '<select name="section" class="form-control">' +
        '<option value="">Select Section</option>' +
        '<option value="A" ' + (student.section === 'A' ? 'selected' : '') + '>A</option>' +
        '<option value="B" ' + (student.section === 'B' ? 'selected' : '') + '>B</option>' +
        '<option value="C" ' + (student.section === 'C' ? 'selected' : '') + '>C</option>' +
        '</select>' +
        '</div>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Address</label>' +
        '<input type="text" name="address" class="form-control" value="' + (student.address || '') + '">' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Parent Name</label>' +
        '<input type="text" name="parent_name" class="form-control" value="' + (student.parent_name || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Parent Phone</label>' +
        '<input type="tel" name="parent_phone" class="form-control" value="' + (student.parent_phone || '') + '">' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Admission Date</label>' +
        '<input type="date" name="admission_date" class="form-control" value="' + (student.admission_date || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Status</label>' +
        '<select name="status" class="form-control">' +
        '<option value="active" ' + (student.status === 'active' ? 'selected' : '') + '>Active</option>' +
        '<option value="inactive" ' + (student.status === 'inactive' ? 'selected' : '') + '>Inactive</option>' +
        '</select>' +
        '</div>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">' + (student.id ? 'Update' : 'Add') + ' Student</button>' +
        '</div>' +
        '</form>';

    openModal();
    document.getElementById('studentForm').addEventListener('submit', function(e) { saveStudent(e, student.id); });
}

async function saveStudent(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach(function(value, key) { data[key] = value; });

    var url = id ? API_URL + '/students/' + id : API_URL + '/students';
    var method = id ? 'PUT' : 'POST';

    try {
        var response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            loadStudents();
            showNotification('Student saved successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving student:', error);
    }
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
        await fetch(API_URL + '/students/' + id, { method: 'DELETE' });
        loadStudents();
        showNotification('Student deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting student:', error);
    }
}

// ==================== TEACHERS ====================

async function loadTeachers() {
    try {
        const response = await fetch(API_URL + '/teachers');
        const teachers = await response.json();

        const tbody = document.querySelector('#teachersTable tbody');
        if (teachers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fas fa-chalkboard-teacher"></i><p>No teachers found</p></td></tr>';
            return;
        }

        tbody.innerHTML = teachers.map(function(teacher) {
            return '<tr>' +
                '<td>' + teacher.id + '</td>' +
                '<td>' + teacher.name + '</td>' +
                '<td>' + (teacher.subject || '-') + '</td>' +
                '<td>' + (teacher.email || '-') + '</td>' +
                '<td>' + (teacher.phone || '-') + '</td>' +
                '<td>' + (teacher.qualification || '-') + '</td>' +
                '<td><span class="status-badge ' + teacher.status + '">' + teacher.status + '</span></td>' +
                '<td>' +
                '<div class="action-buttons">' +
                '<button class="action-btn edit" onclick="openTeacherModal(' + teacher.id + ')">' +
                '<i class="fas fa-edit"></i>' +
                '</button>' +
                '<button class="action-btn delete" onclick="deleteTeacher(' + teacher.id + ')">' +
                '<i class="fas fa-trash"></i>' +
                '</button>' +
                '</div>' +
                '</td>' +
                '</tr>';
        }).join('');
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

function openTeacherModal(id) {
    if (id) {
        fetch(API_URL + '/teachers/' + id)
            .then(function(res) { return res.json(); })
            .then(function(teacher) {
                showTeacherForm(teacher);
            });
    } else {
        showTeacherForm();
    }
}

function showTeacherForm(teacher) {
    teacher = teacher || {};
    modalTitle.textContent = teacher.id ? 'Edit Teacher' : 'Add Teacher';
    modalBody.innerHTML =
        '<form id="teacherForm">' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Full Name *</label>' +
        '<input type="text" name="name" class="form-control" value="' + (teacher.name || '') + '" required>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Email</label>' +
        '<input type="email" name="email" class="form-control" value="' + (teacher.email || '') + '">' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Phone</label>' +
        '<input type="tel" name="phone" class="form-control" value="' + (teacher.phone || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Subject</label>' +
        '<input type="text" name="subject" class="form-control" value="' + (teacher.subject || '') + '">' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Qualification</label>' +
        '<input type="text" name="qualification" class="form-control" value="' + (teacher.qualification || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Experience (Years)</label>' +
        '<input type="number" name="experience" class="form-control" value="' + (teacher.experience || '') + '">' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Salary</label>' +
        '<input type="number" name="salary" class="form-control" value="' + (teacher.salary || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Join Date</label>' +
        '<input type="date" name="join_date" class="form-control" value="' + (teacher.join_date || '') + '">' +
        '</div>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Address</label>' +
        '<input type="text" name="address" class="form-control" value="' + (teacher.address || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Status</label>' +
        '<select name="status" class="form-control">' +
        '<option value="active" ' + (teacher.status === 'active' ? 'selected' : '') + '>Active</option>' +
        '<option value="inactive" ' + (teacher.status === 'inactive' ? 'selected' : '') + '>Inactive</option>' +
        '</select>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">' + (teacher.id ? 'Update' : 'Add') + ' Teacher</button>' +
        '</div>' +
        '</form>';

    openModal();
    document.getElementById('teacherForm').addEventListener('submit', function(e) { saveTeacher(e, teacher.id); });
}

async function saveTeacher(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach(function(value, key) { data[key] = value; });
    data.experience = parseInt(data.experience) || 0;
    data.salary = parseFloat(data.salary) || 0;

    var url = id ? API_URL + '/teachers/' + id : API_URL + '/teachers';
    var method = id ? 'PUT' : 'POST';

    try {
        var response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            loadTeachers();
            showNotification('Teacher saved successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving teacher:', error);
    }
}

async function deleteTeacher(id) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
        await fetch(API_URL + '/teachers/' + id, { method: 'DELETE' });
        loadTeachers();
        showNotification('Teacher deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting teacher:', error);
    }
}

// ==================== COURSES ====================

async function loadCourses() {
    try {
        var coursesRes = await fetch(API_URL + '/courses');
        var teachersRes = await fetch(API_URL + '/teachers');
        var courses = await coursesRes.json();
        var teachers = await teachersRes.json();

        const tbody = document.querySelector('#coursesTable tbody');
        if (courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-book"></i><p>No courses found</p></td></tr>';
            return;
        }

        tbody.innerHTML = courses.map(function(course) {
            return '<tr>' +
                '<td>' + (course.code || '-') + '</td>' +
                '<td>' + course.name + '</td>' +
                '<td>' + (course.credits || '-') + '</td>' +
                '<td>' + (course.class || '-') + '</td>' +
                '<td>' + (course.teacher_name || 'Not Assigned') + '</td>' +
                '<td>' +
                '<div class="action-buttons">' +
                '<button class="action-btn edit" onclick="openCourseModal(' + course.id + ')">' +
                '<i class="fas fa-edit"></i>' +
                '</button>' +
                '<button class="action-btn delete" onclick="deleteCourse(' + course.id + ')">' +
                '<i class="fas fa-trash"></i>' +
                '</button>' +
                '</div>' +
                '</td>' +
                '</tr>';
        }).join('');
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

function openCourseModal(id) {
    Promise.all([
        fetch(API_URL + '/teachers').then(function(res) { return res.json(); }),
        id ? fetch(API_URL + '/courses').then(function(res) { return res.json(); }) : Promise.resolve([])
    ]).then(function(results) {
        var teachers = results[0];
        var courses = results[1];
        var course = id ? courses.find(function(c) { return c.id === id; }) : {};
        showCourseForm(course, teachers);
    });
}

function showCourseForm(course, teachers) {
    course = course || {};
    modalTitle.textContent = course.id ? 'Edit Course' : 'Add Course';

    var teacherOptions = teachers.map(function(t) {
        return '<option value="' + t.id + '" ' + (course.teacher_id === t.id ? 'selected' : '') + '>' + t.name + '</option>';
    }).join('');

    modalBody.innerHTML =
        '<form id="courseForm">' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Course Name *</label>' +
        '<input type="text" name="name" class="form-control" value="' + (course.name || '') + '" required>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Course Code</label>' +
        '<input type="text" name="code" class="form-control" value="' + (course.code || '') + '">' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Credits</label>' +
        '<input type="number" name="credits" class="form-control" value="' + (course.credits || '') + '">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Class</label>' +
        '<select name="class" class="form-control">' +
        '<option value="">Select Class</option>' +
        '<option value="Class 1" ' + (course.class === 'Class 1' ? 'selected' : '') + '>Class 1</option>' +
        '<option value="Class 2" ' + (course.class === 'Class 2' ? 'selected' : '') + '>Class 2</option>' +
        '<option value="Class 3" ' + (course.class === 'Class 3' ? 'selected' : '') + '>Class 3</option>' +
        '<option value="Class 4" ' + (course.class === 'Class 4' ? 'selected' : '') + '>Class 4</option>' +
        '<option value="Class 5" ' + (course.class === 'Class 5' ? 'selected' : '') + '>Class 5</option>' +
        '<option value="Class 6" ' + (course.class === 'Class 6' ? 'selected' : '') + '>Class 6</option>' +
        '<option value="Class 7" ' + (course.class === 'Class 7' ? 'selected' : '') + '>Class 7</option>' +
        '<option value="Class 8" ' + (course.class === 'Class 8' ? 'selected' : '') + '>Class 8</option>' +
        '<option value="Class 9" ' + (course.class === 'Class 9' ? 'selected' : '') + '>Class 9</option>' +
        '<option value="Class 10" ' + (course.class === 'Class 10' ? 'selected' : '') + '>Class 10</option>' +
        '</select>' +
        '</div>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Teacher</label>' +
        '<select name="teacher_id" class="form-control">' +
        '<option value="">Select Teacher</option>' +
        teacherOptions +
        '</select>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">' + (course.id ? 'Update' : 'Add') + ' Course</button>' +
        '</div>' +
        '</form>';

    openModal();
    document.getElementById('courseForm').addEventListener('submit', function(e) { saveCourse(e, course.id); });
}

async function saveCourse(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach(function(value, key) { data[key] = value; });
    data.credits = parseInt(data.credits) || 0;
    data.teacher_id = data.teacher_id ? parseInt(data.teacher_id) : null;

    var url = id ? API_URL + '/courses/' + id : API_URL + '/courses';
    var method = id ? 'PUT' : 'POST';

    try {
        var response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            loadCourses();
            showNotification('Course saved successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving course:', error);
    }
}

async function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
        await fetch(API_URL + '/courses/' + id, { method: 'DELETE' });
        loadCourses();
        showNotification('Course deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting course:', error);
    }
}

// ==================== MARKS ====================

async function loadMarks() {
    try {
        var marksRes = await fetch(API_URL + '/marks');
        var studentsRes = await fetch(API_URL + '/students');
        var coursesRes = await fetch(API_URL + '/courses');
        var marks = await marksRes.json();
        var students = await studentsRes.json();
        var courses = await coursesRes.json();

        const tbody = document.querySelector('#marksTable tbody');
        if (marks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-clipboard-check"></i><p>No marks found</p></td></tr>';
            return;
        }

        tbody.innerHTML = marks.map(function(mark) {
            return '<tr>' +
                '<td>' + mark.student_name + '</td>' +
                '<td>' + mark.course_name + '</td>' +
                '<td>' + mark.marks + '</td>' +
                '<td><span class="status-badge ' + getGradeClass(mark.grade) + '">' + (mark.grade || '-') + '</span></td>' +
                '<td>' + (mark.exam_type || '-') + '</td>' +
                '<td>' + (mark.exam_date || '-') + '</td>' +
                '</tr>';
        }).join('');
    } catch (error) {
        console.error('Error loading marks:', error);
    }
}

function getGradeClass(grade) {
    if (grade === 'A+' || grade === 'A') return 'active';
    if (grade === 'B+' || grade === 'B') return 'paid';
    if (grade === 'C' || grade === 'C+' || grade === 'D') return 'unpaid';
    return '';
}

function openMarksModal() {
    Promise.all([
        fetch(API_URL + '/students').then(function(res) { return res.json(); }),
        fetch(API_URL + '/courses').then(function(res) { return res.json(); })
    ]).then(function(results) {
        var students = results[0];
        var courses = results[1];
        showMarksForm(students, courses);
    });
}

function showMarksForm(students, courses) {
    modalTitle.textContent = 'Add Marks';

    var studentOptions = students.map(function(s) {
        return '<option value="' + s.id + '">' + s.name + ' (' + (s.roll_number || s.id) + ')</option>';
    }).join('');

    var courseOptions = courses.map(function(c) {
        return '<option value="' + c.id + '">' + c.name + '</option>';
    }).join('');

    modalBody.innerHTML =
        '<form id="marksForm">' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Student *</label>' +
        '<select name="student_id" class="form-control" required>' +
        '<option value="">Select Student</option>' +
        studentOptions +
        '</select>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Course *</label>' +
        '<select name="course_id" class="form-control" required>' +
        '<option value="">Select Course</option>' +
        courseOptions +
        '</select>' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Marks *</label>' +
        '<input type="number" name="marks" class="form-control" min="0" max="100" required>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Grade</label>' +
        '<select name="grade" class="form-control">' +
        '<option value="">Select Grade</option>' +
        '<option value="A+">A+</option>' +
        '<option value="A">A</option>' +
        '<option value="B+">B+</option>' +
        '<option value="B">B</option>' +
        '<option value="C+">C+</option>' +
        '<option value="C">C</option>' +
        '<option value="D">D</option>' +
        '<option value="F">F</option>' +
        '</select>' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Exam Type</label>' +
        '<select name="exam_type" class="form-control">' +
        '<option value="Mid Term">Mid Term</option>' +
        '<option value="Final">Final</option>' +
        '<option value="Quiz">Quiz</option>' +
        '<option value="Assignment">Assignment</option>' +
        '</select>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Exam Date</label>' +
        '<input type="date" name="exam_date" class="form-control">' +
        '</div>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">Add Marks</button>' +
        '</div>' +
        '</form>';

    openModal();
    document.getElementById('marksForm').addEventListener('submit', saveMarks);
}

async function saveMarks(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach(function(value, key) { data[key] = value; });
    data.student_id = parseInt(data.student_id);
    data.course_id = parseInt(data.course_id);
    data.marks = parseFloat(data.marks);

    try {
        var response = await fetch(API_URL + '/marks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            loadMarks();
            showNotification('Marks added successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving marks:', error);
    }
}

// ==================== ATTENDANCE ====================

async function loadAttendance() {
    try {
        const response = await fetch(API_URL + '/attendance');
        const attendance = await response.json();

        const tbody = document.querySelector('#attendanceTable tbody');
        if (attendance.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><i class="fas fa-calendar-check"></i><p>No attendance records found</p></td></tr>';
            return;
        }

        tbody.innerHTML = attendance.map(function(record) {
            return '<tr>' +
                '<td>' + (record.roll_number || '-') + '</td>' +
                '<td>' + record.student_name + '</td>' +
                '<td>' + record.date + '</td>' +
                '<td><span class="status-badge ' + record.status + '">' + record.status + '</span></td>' +
                '</tr>';
        }).join('');
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

function openAttendanceModal() {
    fetch(API_URL + '/students')
        .then(function(res) { return res.json(); })
        .then(function(students) {
            showAttendanceForm(students);
        });
}

function showAttendanceForm(students) {
    modalTitle.textContent = 'Mark Attendance';

    var studentOptions = students.map(function(s) {
        return '<option value="' + s.id + '">' + s.name + ' (' + (s.roll_number || s.id) + ')</option>';
    }).join('');

    modalBody.innerHTML =
        '<form id="attendanceForm">' +
        '<div class="form-group">' +
        '<label>Student *</label>' +
        '<select name="student_id" class="form-control" required>' +
        '<option value="">Select Student</option>' +
        studentOptions +
        '</select>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Date *</label>' +
        '<input type="date" name="date" class="form-control" value="' + new Date().toISOString().split('T')[0] + '" required>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Status *</label>' +
        '<select name="status" class="form-control" required>' +
        '<option value="present">Present</option>' +
        '<option value="absent">Absent</option>' +
        '</select>' +
        '</div>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">Mark Attendance</button>' +
        '</div>' +
        '</form>';

    openModal();
    document.getElementById('attendanceForm').addEventListener('submit', saveAttendance);
}

async function saveAttendance(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach(function(value, key) { data[key] = value; });
    data.student_id = parseInt(data.student_id);

    try {
        var response = await fetch(API_URL + '/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            loadAttendance();
            showNotification('Attendance marked successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
    }
}

// ==================== FEES ====================

async function loadFees() {
    try {
        var feesRes = await fetch(API_URL + '/fees');
        var studentsRes = await fetch(API_URL + '/students');
        var fees = await feesRes.json();
        var students = await studentsRes.json();

        const tbody = document.querySelector('#feesTable tbody');
        if (fees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-money-bill-wave"></i><p>No fee records found</p></td></tr>';
            return;
        }

        tbody.innerHTML = fees.map(function(fee) {
            var actionButtons = '';
            if (fee.status === 'unpaid') {
                actionButtons = '<button class="action-btn edit" onclick="updateFeeStatus(' + fee.id + ', \'paid\')" title="Mark as Paid"><i class="fas fa-check"></i></button>';
            }

            return '<tr>' +
                '<td>' + fee.student_name + '</td>' +
                '<td>' + (fee.student_class || '-') + '</td>' +
                '<td>$' + fee.amount + '</td>' +
                '<td>' + (fee.due_date || '-') + '</td>' +
                '<td><span class="status-badge ' + fee.status + '">' + fee.status + '</span></td>' +
                '<td><div class="action-buttons">' + actionButtons + '</div></td>' +
                '</tr>';
        }).join('');
    } catch (error) {
        console.error('Error loading fees:', error);
    }
}

function openFeeModal() {
    fetch(API_URL + '/students')
        .then(function(res) { return res.json(); })
        .then(function(students) {
            showFeeForm(students);
        });
}

function showFeeForm(students) {
    modalTitle.textContent = 'Add Fee Record';

    var studentOptions = students.map(function(s) {
        return '<option value="' + s.id + '">' + s.name + ' (' + (s.class || 'N/A') + ')</option>';
    }).join('');

    modalBody.innerHTML =
        '<form id="feeForm">' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Student *</label>' +
        '<select name="student_id" class="form-control" required>' +
        '<option value="">Select Student</option>' +
        studentOptions +
        '</select>' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Amount *</label>' +
        '<input type="number" name="amount" class="form-control" min="0" step="0.01" required>' +
        '</div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group">' +
        '<label>Due Date</label>' +
        '<input type="date" name="due_date" class="form-control">' +
        '</div>' +
        '<div class="form-group">' +
        '<label>Status</label>' +
        '<select name="status" class="form-control">' +
        '<option value="unpaid">Unpaid</option>' +
        '<option value="paid">Paid</option>' +
        '</select>' +
        '</div>' +
        '</div>' +
        '<div class="form-actions">' +
        '<button type="button" class="btn btn-danger" onclick="closeModal()">Cancel</button>' +
        '<button type="submit" class="btn btn-primary">Add Fee</button>' +
        '</div>' +
        '</form>';

    openModal();
    document.getElementById('feeForm').addEventListener('submit', saveFee);
}

async function saveFee(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach(function(value, key) { data[key] = value; });
    data.student_id = parseInt(data.student_id);
    data.amount = parseFloat(data.amount);

    try {
        var response = await fetch(API_URL + '/fees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            loadFees();
            showNotification('Fee record added successfully!', 'success');
        }
    } catch (error) {
        console.error('Error saving fee:', error);
    }
}

async function updateFeeStatus(id, status) {
    try {
        await fetch(API_URL + '/fees/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: status,
                paid_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null
            })
        });
        loadFees();
        showNotification('Fee status updated!', 'success');
    } catch (error) {
        console.error('Error updating fee status:', error);
    }
}

// ==================== MODAL ====================

function openModal() {
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

// ==================== NOTIFICATIONS ====================

function showNotification(message, type) {
    type = type || 'success';
    var notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.style.cssText =
        'position: fixed; top: 20px; right: 20px; padding: 15px 25px; ' +
        'background: ' + (type === 'success' ? '#10b981' : '#ef4444') + '; ' +
        'color: white; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); ' +
        'z-index: 3000; animation: slideIn 0.3s ease;';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() { notification.remove(); }, 300);
    }, 3000);
}

// Add notification animations
var style = document.createElement('style');
style.textContent =
    '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } ' +
    '@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
document.head.appendChild(style);