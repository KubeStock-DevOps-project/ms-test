const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', service: 'ms-test' }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Hello from ms-test microservice!',
      version: '1.0.1',
      timestamp: new Date().toISOString()
    }));
  }
});

server.listen(PORT, () => {
  console.log(`ms-test microservice running on port ${PORT}`);
});
