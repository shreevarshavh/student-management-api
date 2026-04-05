const http = require('http');
const url = require('url');

let students = [];

function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function generateId() {
  return Date.now().toString();
}

function validateStudent(student) {
  const { name, email, course, year } = student;

  if (!name || !email || !course || !year) {
    return 'All fields are required';
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  if (year < 1 || year > 4) {
    return 'Year must be between 1 and 4';
  }

  return null;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  if (method === 'POST' && path === '/students') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const data = JSON.parse(body);

      const error = validateStudent(data);
      if (error) {
        return sendResponse(res, 400, {
          success: false,
          message: error
        });
      }

      const newStudent = {
        id: generateId(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      students.push(newStudent);

      return sendResponse(res, 201, {
        success: true,
        data: newStudent
      });
    });

    return;
  }

  if (method === 'GET' && path === '/students') {
    return sendResponse(res, 200, {
      success: true,
      data: students
    });
  }

  if (method === 'GET' && path.startsWith('/students/')) {
    const id = path.split('/')[2];

    const student = students.find(s => s.id === id);

    if (!student) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Student not found'
      });
    }

    return sendResponse(res, 200, {
      success: true,
      data: student
    });
  }

  if (method === 'PUT' && path.startsWith('/students/')) {
    const id = path.split('/')[2];

    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const updatedData = JSON.parse(body);

      const error = validateStudent(updatedData);
      if (error) {
        return sendResponse(res, 400, {
          success: false,
          message: error
        });
      }

      const index = students.findIndex(s => s.id === id);

      if (index === -1) {
        return sendResponse(res, 404, {
          success: false,
          message: 'Student not found'
        });
      }

      students[index] = {
        id,
        ...updatedData,
        createdAt: students[index].createdAt,
        updatedAt: new Date()
      };

      return sendResponse(res, 200, {
        success: true,
        data: students[index]
      });
    });

    return;
  }

  if (method === 'DELETE' && path.startsWith('/students/')) {
    const id = path.split('/')[2];

    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Student not found'
      });
    }

    const deletedStudent = students.splice(index, 1);

    return sendResponse(res, 200, {
      success: true,
      message: 'Student deleted successfully',
      data: deletedStudent[0]
    });
  }

  sendResponse(res, 404, {
    success: false,
    message: 'Route not found'
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});