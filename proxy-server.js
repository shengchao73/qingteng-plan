const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 获取当前执行目录
const isDev = process.env.NODE_ENV === 'development' || !process.pkg;
const basePath = isDev ? __dirname : path.dirname(process.execPath);

// 代理服务器配置
const PORT = process.env.PORT || 3000;
const TARGET_API = 'https://xingchen-api.xf-yun.com';

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// 创建代理服务器
const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const parsedUrl = url.parse(req.url, true);
    
    // API代理路径
    if (parsedUrl.pathname.startsWith('/api/')) {
        // 移除/api前缀，转发到目标API
        const targetPath = parsedUrl.pathname.replace('/api', '');
        const targetUrl = TARGET_API + targetPath + (parsedUrl.search || '');
        
        console.log(`代理API请求: ${req.method} ${targetUrl}`);
        
        const options = {
            method: req.method,
            headers: {
                ...req.headers,
                'host': url.parse(TARGET_API).host
            }
        };
        
        const proxyReq = https.request(targetUrl, options, (proxyRes) => {
            // 复制响应头
            Object.keys(proxyRes.headers).forEach(key => {
                res.setHeader(key, proxyRes.headers[key]);
            });
            
            console.log(`\n=== API响应开始 ===`);
            console.log(`状态码: ${proxyRes.statusCode}`);
            console.log(`响应头:`, proxyRes.headers);
            console.log(`=== 流式数据 ===`);
            
            res.writeHead(proxyRes.statusCode);
            
            // 监听数据流并在终端显示
            proxyRes.on('data', (chunk) => {
                const data = chunk.toString('utf8');
                console.log('📡 实时数据:', data);
                res.write(chunk);
            });
            
            proxyRes.on('end', () => {
                console.log('\n=== API响应结束 ===\n');
                res.end();
            });
        });
        
        proxyReq.on('error', (err) => {
            console.error('代理请求错误:', err);
            res.writeHead(500);
            res.end('代理服务器错误');
        });
        
        // 转发请求体
        req.pipe(proxyReq);
        
    } else {
        // 静态文件服务
        let filePath = path.join(basePath, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
        
        // 安全检查：防止目录遍历攻击
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(basePath)) {
            res.writeHead(403);
            res.end('禁止访问');
            return;
        }
        
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeType = mimeTypes[extname] || 'application/octet-stream';
        
        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('文件未找到');
                } else {
                    res.writeHead(500);
                    res.end('服务器内部错误: ' + error.code);
                }
            } else {
                res.writeHead(200, { 'Content-Type': mimeType });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`代理服务器运行在 http://localhost:${PORT}`);
    console.log(`API请求将被代理到: ${TARGET_API}`);
    console.log('使用方式: 将API请求发送到 /api/ 路径');
});

server.on('error', (err) => {
    console.error('服务器启动失败:', err);
});