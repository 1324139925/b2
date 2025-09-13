const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 8000;
const HOSTNAME = 'localhost';
const PUBLIC_DIR = __dirname;

// 创建服务器
const server = http.createServer(async (req, res) => {
    try {
        // 提取URL路径部分，忽略查询参数，并解码URL编码的中文字符
        const urlWithoutQuery = req.url.split('?')[0];
        const pathWithoutQuery = decodeURIComponent(urlWithoutQuery);
        
        // 忽略Vite客户端请求
        if (pathWithoutQuery === '/@vite/client') {
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end('');
            return;
        }
        
        // 处理根路径请求和特定文件
        let filePath;
        if (pathWithoutQuery === '/' || pathWithoutQuery.startsWith('/?')) {
            filePath = '/index.html';
        } else if (pathWithoutQuery === '/fenling_modifiers.html') {
            filePath = '/fenling_modifiers.html';
        } else {
            filePath = pathWithoutQuery;
        }
        
        // 防止路径遍历攻击
        const safePath = path.normalize(path.join(PUBLIC_DIR, filePath));
        if (!safePath.startsWith(PUBLIC_DIR)) {
            res.writeHead(403);
            res.end('403 - 禁止访问');
            return;
        }
        
        console.log(`请求文件: ${filePath}`);
        
        // 获取文件扩展名
        const extname = path.extname(filePath).toLowerCase();
        
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
        
        // 读取文件内容
        const content = await fs.readFile(safePath);
        
        // 发送响应
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        console.log(`成功返回: ${filePath}`);
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`文件不存在: ${req.url}`);
            res.writeHead(404);
            res.end(`404 - 未找到文件: ${req.url}`);
        } else {
            console.error(`服务器错误: ${error.message}`);
            res.writeHead(500);
            res.end(`服务器错误: ${error.message}`);
        }
    }
});

// 启动服务器
server.listen(PORT, HOSTNAME, () => {
    console.log(`服务器运行在 http://${HOSTNAME}:${PORT}/`);
    console.log(`提供目录: ${PUBLIC_DIR}`);
});