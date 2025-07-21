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
const basePath = isDev ? __dirname : process.resourcesPath;

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
                    
                    res.writeHead(proxyRes.statusCode);
                    proxyRes.pipe(res);
                });
                
                proxyReq.on('error', (err) => {
                    console.error('代理请求错误:', err);
                    res.writeHead(500);
                    res.end('代理服务器错误');
                });
                
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

        server.listen(PORT, 'localhost', () => {
            console.log(`内部服务器运行在 http://localhost:${PORT}`);
            resolve();
        });

        server.on('error', (err) => {
            console.error('服务器启动失败:', err);
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
        icon: path.join(__dirname, 'assets/icon.png'), // 如果有图标文件
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true
        },
        title: '校园AI助手',
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
            label: '文件',
            submenu: [
                {
                    label: '退出',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '编辑',
            submenu: [
                { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
            ]
        },
        {
            label: '视图',
            submenu: [
                { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { type: 'separator' },
                { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '关于校园AI助手',
                            message: '校园AI助手 v1.0.0',
                            detail: '基于星辰Agent工作流的智能学习规划平台\\n为您提供个性化的目标拆解、计划调整、能力分析和资源推荐'
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
        console.error('应用启动失败:', error);
        dialog.showErrorBox('启动错误', '应用启动失败，请重试');
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