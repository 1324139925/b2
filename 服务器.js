// 简单的 HTTP 服务器
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const HOSTNAME = 'localhost';

// 创建服务器
const server = http.createServer((req, res) => {
    // 处理根路径请求，返回 index.html
    let urlWithoutQuery = req.url.split('?')[0];
    let filePath = urlWithoutQuery === '/' ? '/index.html' : decodeURIComponent(urlWithoutQuery);
    
    // 获取文件扩展名
    const extname = path.extname(filePath);
    
    // 设置 MIME 类型
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
    }
    
    // 构建完整的文件路径
    const fullPath = path.join(__dirname, filePath);
    
    // 检查文件是否存在
    fs.exists(fullPath, (exists) => {
        if (exists) {
            // 读取文件并发送响应
            fs.readFile(fullPath, (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end(`服务器错误: ${err.code}`);
                    return;
                }
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            });
        } else {
            // 文件不存在，返回 404 错误
            res.writeHead(404);
            res.end('404 - 未找到文件');
        }
    });
});

// 启动服务器
server.listen(PORT, HOSTNAME, () => {
    console.log(`服务器运行在 http://${HOSTNAME}:${PORT}/`);
});