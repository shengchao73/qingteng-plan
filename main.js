const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');

// 代理服务器配置
const PORT = 3000;
const TARGET_API = 'https://xingchen-api.xf-yun.com';

// 获取资源路径
const isDev = process.env.NODE_ENV === 'development';
const basePath = isDev ? __dirname : path.join(process.resourcesPath, 'app');

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
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

let mainWindow;
let server;

// 创建HTTP服务器
function createServer() {
    return new Promise((resolve, reject) => {
        server = http.createServer((req, res) => {
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
                
                console.log(`API Request: ${req.method} ${targetUrl}`);
                
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
                    
                    res.writeHead(proxyRes.statusCode);
                    proxyRes.pipe(res);
                });
                
                proxyReq.on('error', (err) => {
                    console.error('Proxy request error:', err);
                    res.writeHead(500);
                    res.end('Proxy server error');
                });
                
                req.pipe(proxyReq);
                
            } else {
                // 静态文件服务
                let filePath;
                
                // 尝试多个可能的路径
                if (parsedUrl.pathname === '/') {
                    const possiblePaths = [
                        path.join(basePath, 'index.html'),
                        path.join(__dirname, 'index.html'),
                        path.join(process.cwd(), 'index.html')
                    ];
                    
                    for (const possiblePath of possiblePaths) {
                        if (fs.existsSync(possiblePath)) {
                            filePath = possiblePath;
                            break;
                        }
                    }
                } else {
                    const possiblePaths = [
                        path.join(basePath, parsedUrl.pathname),
                        path.join(__dirname, parsedUrl.pathname),
                        path.join(process.cwd(), parsedUrl.pathname)
                    ];
                    
                    for (const possiblePath of possiblePaths) {
                        if (fs.existsSync(possiblePath)) {
                            filePath = possiblePath;
                            break;
                        }
                    }
                }
                
                if (!filePath) {
                    console.error('File not found:', parsedUrl.pathname);
                    console.error('Searched paths:', [
                        path.join(basePath, parsedUrl.pathname),
                        path.join(__dirname, parsedUrl.pathname),
                        path.join(process.cwd(), parsedUrl.pathname)
                    ]);
                    res.writeHead(404);
                    res.end('File not found');
                    return;
                }
                
                const extname = String(path.extname(filePath)).toLowerCase();
                const mimeType = mimeTypes[extname] || 'application/octet-stream';
                
                fs.readFile(filePath, (error, content) => {
                    if (error) {
                        console.error('Error reading file:', error);
                        res.writeHead(500);
                        res.end('Internal server error: ' + error.code);
                    } else {
                        res.writeHead(200, { 'Content-Type': mimeType });
                        res.end(content);
                    }
                });
            }
        });

        server.listen(PORT, 'localhost', () => {
            console.log(`Internal server running at http://localhost:${PORT}`);
            console.log('Base path:', basePath);
            console.log('__dirname:', __dirname);
            console.log('process.cwd():', process.cwd());
            console.log('process.resourcesPath:', process.resourcesPath);
            console.log('isDev:', isDev);
            resolve();
        });

        server.on('error', (err) => {
            console.error('Server startup failed:', err);
            reject(err);
        });
    });
}

// 创建主窗口
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true
        },
        title: 'Campus AI Assistant',
        show: false // 先隐藏窗口，等加载完成后再显示
    });

    // 窗口准备好后显示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // 开发环境下打开开发者工具
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // 加载应用
    mainWindow.loadURL(`http://localhost:${PORT}`);

    // 处理窗口关闭
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // 拦截新窗口打开，使用默认浏览器
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // 创建菜单
    createMenu();
}

// 创建应用菜单
function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                { label: 'Toggle DevTools', accelerator: 'F12', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { type: 'separator' },
                { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Campus AI Assistant',
                            message: 'Campus AI Assistant v1.0.0',
                            detail: 'AI-powered learning planning platform based on Xingchen Agent workflow'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// 应用准备就绪
app.whenReady().then(async () => {
    try {
        // 启动内部服务器
        await createServer();
        
        // 创建窗口
        createWindow();
        
        // macOS特定处理
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
        
    } catch (error) {
        console.error('Application startup failed:', error);
        dialog.showErrorBox('Startup Error', 'Application startup failed, please try again');
        app.quit();
    }
});

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
    if (server) {
        server.close();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 应用退出前清理
app.on('before-quit', () => {
    if (server) {
        server.close();
    }
});

// 处理应用安全
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});