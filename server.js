const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'users.json');

// Initialize users.json if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

const server = http.createServer((req, res) => {
    const url = req.url === '/' ? '/demo.html' : req.url;
    const method = req.method;

    // Handle API endpoint to save data
    if (url === '/save' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const newData = JSON.parse(body);
                const existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                
                existingData.push({
                    ...newData,
                    timestamp: new Date().toLocaleString()
                });

                fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2));
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Data saved to file successfully!' }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Invalid data format' }));
            }
        });
        return;
    }

    // Handle API endpoint to get data
    if (url === '/get-data' && method === 'GET') {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
        return;
    }

    // Handle static files
    const filePath = path.join(__dirname, url);
    const ext = path.extname(filePath);
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
    };

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Data will be stored in: ${DATA_FILE}`);
});
