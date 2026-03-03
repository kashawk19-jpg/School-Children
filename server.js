const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup
const db = new sqlite3.Database('./school.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize Database Tables
function initializeDatabase() {
    db.serialize(() => {
        // Students Table
        db.run(`CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            class TEXT,
            section TEXT,
            roll_number TEXT,
            address TEXT,
            parent_name TEXT,
            parent_phone TEXT,
            admission_date TEXT,
            status TEXT DEFAULT 'active'
        )`);

        // Teachers Table
        db.run(`CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            subject TEXT,
            qualification TEXT,
            experience INTEGER,
            address TEXT,
            salary REAL,
            join_date TEXT,
            status TEXT DEFAULT 'active'
        )`);

        // Courses/Subjects Table
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE,
            credits INTEGER,
            teacher_id INTEGER,
            class TEXT,
            FOREIGN KEY (teacher_id) REFERENCES teachers(id)
        )`);

        // Marks/Grades Table
        db.run(`CREATE TABLE IF NOT EXISTS marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            course_id INTEGER,
            marks REAL,
            grade TEXT,
            exam_type TEXT,
            exam_date TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )`);

        // Attendance Table
        db.run(`CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            date TEXT,
            status TEXT,
            FOREIGN KEY (student_id) REFERENCES students(id)
        )`);

        // Fees Table
        db.run(`CREATE TABLE IF NOT EXISTS fees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            amount REAL,
            due_date TEXT,
            paid_date TEXT,
            status TEXT DEFAULT 'unpaid',
            FOREIGN KEY (student_id) REFERENCES students(id)
        )`);

        console.log('Database tables initialized');
    });
}

// ==================== STUDENTS API ====================

// Get all students
app.get('/api/students', (req, res) => {
    db.all('SELECT * FROM students ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get single student
app.get('/api/students/:id', (req, res) => {
    db.get('SELECT * FROM students WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// Add student
app.post('/api/students', (req, res) => {
    const { name, email, phone, class: studentClass, section, roll_number, address, parent_name, parent_phone, admission_date } = req.body;
    const sql = `INSERT INTO students (name, email, phone, class, section, roll_number, address, parent_name, parent_phone, admission_date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, email, phone, studentClass, section, roll_number, address, parent_name, parent_phone, admission_date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Student added successfully' });
    });
});

// Update student
app.put('/api/students/:id', (req, res) => {
    const { name, email, phone, class: studentClass, section, roll_number, address, parent_name, parent_phone, status } = req.body;
    const sql = `UPDATE students SET name = ?, email = ?, phone = ?, class = ?, section = ?, roll_number = ?, 
                 address = ?, parent_name = ?, parent_phone = ?, status = ? WHERE id = ?`;
    db.run(sql, [name, email, phone, studentClass, section, roll_number, address, parent_name, parent_phone, status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Student updated successfully' });
    });
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
    db.run('DELETE FROM students WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Student deleted successfully' });
    });
});

// ==================== TEACHERS API ====================

// Get all teachers
app.get('/api/teachers', (req, res) => {
    db.all('SELECT * FROM teachers ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get single teacher
app.get('/api/teachers/:id', (req, res) => {
    db.get('SELECT * FROM teachers WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// Add teacher
app.post('/api/teachers', (req, res) => {
    const { name, email, phone, subject, qualification, experience, address, salary, join_date } = req.body;
    const sql = `INSERT INTO teachers (name, email, phone, subject, qualification, experience, address, salary, join_date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, email, phone, subject, qualification, experience, address, salary, join_date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Teacher added successfully' });
    });
});

// Update teacher
app.put('/api/teachers/:id', (req, res) => {
    const { name, email, phone, subject, qualification, experience, address, salary, status } = req.body;
    const sql = `UPDATE teachers SET name = ?, email = ?, phone = ?, subject = ?, qualification = ?, 
                 experience = ?, address = ?, salary = ?, status = ? WHERE id = ?`;
    db.run(sql, [name, email, phone, subject, qualification, experience, address, salary, status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Teacher updated successfully' });
    });
});

// Delete teacher
app.delete('/api/teachers/:id', (req, res) => {
    db.run('DELETE FROM teachers WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Teacher deleted successfully' });
    });
});

// ==================== COURSES API ====================

// Get all courses
app.get('/api/courses', (req, res) => {
    db.all('SELECT c.*, t.name as teacher_name FROM courses c LEFT JOIN teachers t ON c.teacher_id = t.id ORDER BY c.id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add course
app.post('/api/courses', (req, res) => {
    const { name, code, credits, teacher_id, class: courseClass } = req.body;
    const sql = `INSERT INTO courses (name, code, credits, teacher_id, class) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, code, credits, teacher_id, courseClass], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Course added successfully' });
    });
});

// Update course
app.put('/api/courses/:id', (req, res) => {
    const { name, code, credits, teacher_id, class: courseClass } = req.body;
    const sql = `UPDATE courses SET name = ?, code = ?, credits = ?, teacher_id = ?, class = ? WHERE id = ?`;
    db.run(sql, [name, code, credits, teacher_id, courseClass, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Course updated successfully' });
    });
});

// Delete course
app.delete('/api/courses/:id', (req, res) => {
    db.run('DELETE FROM courses WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Course deleted successfully' });
    });
});

// ==================== MARKS API ====================

// Get all marks
app.get('/api/marks', (req, res) => {
    const sql = `SELECT m.*, s.name as student_name, c.name as course_name 
                 FROM marks m 
                 LEFT JOIN students s ON m.student_id = s.id 
                 LEFT JOIN courses c ON m.course_id = c.id 
                 ORDER BY m.id DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add marks
app.post('/api/marks', (req, res) => {
    const { student_id, course_id, marks, grade, exam_type, exam_date } = req.body;
    const sql = `INSERT INTO marks (student_id, course_id, marks, grade, exam_type, exam_date) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [student_id, course_id, marks, grade, exam_type, exam_date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Marks added successfully' });
    });
});

// ==================== ATTENDANCE API ====================

// Get attendance
app.get('/api/attendance', (req, res) => {
    const sql = `SELECT a.*, s.name as student_name, s.roll_number 
                 FROM attendance a 
                 LEFT JOIN students s ON a.student_id = s.id 
                 ORDER BY a.date DESC, s.roll_number`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add attendance
app.post('/api/attendance', (req, res) => {
    const { student_id, date, status } = req.body;
    const sql = `INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)`;
    db.run(sql, [student_id, date, status], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Attendance marked successfully' });
    });
});

// ==================== FEES API ====================

// Get all fees
app.get('/api/fees', (req, res) => {
    const sql = `SELECT f.*, s.name as student_name, s.roll_number, s.class as student_class
                 FROM fees f 
                 LEFT JOIN students s ON f.student_id = s.id 
                 ORDER BY f.id DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add fee record
app.post('/api/fees', (req, res) => {
    const { student_id, amount, due_date, paid_date, status } = req.body;
    const sql = `INSERT INTO fees (student_id, amount, due_date, paid_date, status) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [student_id, amount, due_date, paid_date, status], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Fee record added successfully' });
    });
});

// Update fee status
app.put('/api/fees/:id', (req, res) => {
    const { status, paid_date } = req.body;
    const sql = `UPDATE fees SET status = ?, paid_date = ? WHERE id = ?`;
    db.run(sql, [status, paid_date, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Fee status updated successfully' });
    });
});

// ==================== DASHBOARD STATS API ====================

app.get('/api/stats', (req, res) => {
    const stats = {};

    db.get('SELECT COUNT(*) as total FROM students WHERE status = "active"', [], (err, row) => {
        stats.totalStudents = row ? row.total : 0;

        db.get('SELECT COUNT(*) as total FROM teachers WHERE status = "active"', [], (err, row) => {
            stats.totalTeachers = row ? row.total : 0;

            db.get('SELECT COUNT(*) as total FROM courses', [], (err, row) => {
                stats.totalCourses = row ? row.total : 0;

                db.get('SELECT SUM(amount) as total FROM fees WHERE status = "paid"', [], (err, row) => {
                    stats.totalFees = row ? (row.total || 0) : 0;
                    res.json(stats);
                });
            });
        });
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});