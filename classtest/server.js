import http from 'http';
import fs from 'fs';
import path from 'path';
import querystring from 'querystring';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const FILE_PATH = path.join(__dirname, 'students.json');

if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    const { method, url } = req;

    if (url === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Student Record Management</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 30px; }
                    .form-group { margin-bottom: 15px; }
                    label { display: inline-block; width: 120px; }
                    input { padding: 6px; width: 220px; }
                    button { padding: 8px 16px; cursor: pointer; }
                </style>
            </head>
            <body>
                <h1>Welcome to Student Records System</h1>
                <form action="/add-student" method="POST">
                    <div class="form-group">
                        <label>Student Name:</label>
                        <input type="text" name="name" required />
                    </div>
                    <div class="form-group">
                        <label>Roll Number:</label>
                        <input type="text" name="rollNo" required />
                    </div>
                    <div class="form-group">
                        <label>Course:</label>
                        <input type="text" name="course" required />
                    </div>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" name="email" required />
                    </div>
                    <button type="submit">Add Student</button>
                </form>
                <br>
                <a href="/students">View All Students</a>
            </body>
            </html>
        `);
    } else if (url === '/add-student' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const formData = querystring.parse(body);

            fs.readFile(FILE_PATH, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Internal Server Error');
                }

                let students = [];
                try {
                    students = JSON.parse(data);
                } catch (e) {
                    students = [];
                }

                students.push(formData);

                fs.writeFile(FILE_PATH, JSON.stringify(students, null, 2), err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        return res.end('Failed to save student record');
                    }

                    res.writeHead(302, { Location: '/students' });
                    res.end();
                });
            });
        });
    } else if (url === '/students' && method === 'GET') {
        fs.readFile(FILE_PATH, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Internal Server Error');
            }

            const students = JSON.parse(data || '[]');

            let tableRows = students
                .map(
                    s => `
                <tr>
                    <td>${s.name || ''}</td>
                    <td>${s.rollNo || ''}</td>
                    <td>${s.course || ''}</td>
                    <td>${s.email || ''}</td>
                </tr>`
                )
                .join('');

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>All Students</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 30px; }
                        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h2>Student Records</h2>
                    <a href="/">← Back to Form</a>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Roll Number</th>
                                <th>Course</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows || '<tr><td colspan="4">No records found.</td></tr>'}
                        </tbody>
                    </table>
                </body>
                </html>
            `);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});