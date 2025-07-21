# 青藤计划-校园AI领航员Demo 🎓

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow.svg)
![HTML5](https://img.shields.io/badge/HTML-5-orange.svg)

**基于星辰Agent工作流API的智能校园助手系统**

一个基于星辰Agent工作流API的校园场景智能助手系统，专为目标拆解、计划调整、能力分析和资源推荐而设计。

[🚀 快速开始](#-安装和配置) • [📚 功能介绍](#-功能模块) • [🛠️ 技术架构](#️-技术架构) • [📖 使用指南](#-使用说明)

</div>


## 📋 项目概述

### 🎯 项目目标
为校园用户提供一个简单易用的AI助手平台，帮助学生进行学习规划、能力评估、目标制定和资源搜索。

### ✨ 核心特色
- **🎨 简约设计**：采用现代化UI设计，界面简洁大气
- **📱 响应式布局**：完美适配桌面端和移动端设备
- **🔧 技术简单**：使用原生HTML/CSS/JavaScript，便于维护
- **🛡️ 隐私保护**：所有数据本地存储，保护用户隐私
- **🔄 流式输出**：支持实时流式对话显示
- **📊 数据可视化**：直观展示评估结果和规划内容

## 🚀 功能模块

### 1. 🤖 AI智能对话
- **功能描述**：与AI助手进行自然语言对话
- **主要特性**：
  - 实时流式对话显示
  - 对话历史管理和导出
  - 快捷问题模板
  - 字符计数和输入提示
- **技术实现**：集成星辰Agent对话工作流API

### 2. 📊 能力评估分析
- **功能描述**：通过AI对话量化分析用户的技能水平和能力特征
- **主要特性**：
  - 多维度能力评估对话
  - 实时提取和保存"存储变量"
  - 可视化能力分析结果
  - 评估历史记录管理
- **技术实现**：专用评估工作流API + 结果解析

### 3. 🎯 目标规划制定
- **功能描述**：基于能力评估结果制定个性化学习和发展计划
- **主要特性**：
  - 能力评估状态检查
  - 详细的规划表单设计
  - 个性化时间安排表生成
  - 规划历史管理和调整
- **技术实现**：结合评估结果的规划工作流API

### 4. 🔮 人生发展预测
- **功能描述**：基于科学问卷分析影响人生发展的多元因素
- **主要特性**：
  - 50题深度调查问卷
  - 问答对自动收集整理
  - 个性化发展预测报告
  - 测试历史对比分析
- **技术实现**：问卷数据处理 + 预测工作流API

### 5. 🔍 深度搜索
- **功能描述**：智能搜索引擎，支持普通搜索和学术论文搜索
- **主要特性**：
  - 双模式搜索切换（普通/学术）
  - 快捷搜索模板
  - 搜索历史管理
  - 结果导出功能
- **技术实现**：搜索模式状态管理 + 搜索工作流API

## 🛠️ 技术架构

### 技术栈选择
```
前端：HTML5 + CSS3 + 原生JavaScript
API：星辰Agent工作流API
存储：LocalStorage（本地存储）
部署：静态文件部署
```

### 为什么选择这个技术栈？
1. **学习成本低**：团队无技术背景，原生技术更易理解
2. **维护简单**：无复杂框架依赖，代码直观易懂
3. **部署便捷**：静态文件可直接部署到任何Web服务器
4. **调试友好**：详细的日志系统，便于问题排查

### 项目结构
```
campus-ai-demo/
├── index.html              # 主页
├── chat.html              # AI对话页面
├── assessment.html        # 能力评估页面
├── planning.html          # 目标规划页面
├── prediction.html        # 人生预测页面
├── search.html            # 深度搜索页面
├── css/
│   └── style.css          # 统一样式文件
├── js/
│   ├── config.js          # API配置和通用函数
│   ├── main.js            # 主页逻辑
│   ├── chat.js            # 对话功能
│   ├── assessment.js      # 能力评估功能
│   ├── planning.js        # 目标规划功能
│   ├── prediction.js      # 人生预测功能
│   └── search.js          # 深度搜索功能
├── assets/                # 静态资源目录
├── docs/                  # 文档目录
└── README.md              # 项目说明
```

## 🔧 安装和配置

### 环境/系统要求
- Node.js 18.0+
- 现代Web浏览器（Chrome、Firefox、Safari、Edge）
- 星辰Agent API访问权限
- 内存：建议 4GB 以上
- 存储：约 100MB 空间


### 快速开始

#### 1. 下载项目文件
```bash
# 解压项目文件到本地目录
unzip qingteng-plan.zip
cd qingteng-plan
```

#### 2. 配置API参数
编辑 `js/config.js` 文件，更新以下配置（如需）：

```javascript
const API_CONFIG = {
    BASE_URL: 'https://xingchen-api.xf-yun.com/workflow/v1/chat/completions',
    API_KEY: 'your_api_key',
    API_SECRET: 'your_api_secret',
    WORKFLOW_IDS: {
        CHAT: 'your_chat_workflow_id',
        ASSESSMENT: 'your_assessment_workflow_id',
        PLANNING: 'your_planning_workflow_id',
        PREDICTION: 'your_prediction_workflow_id',
        SEARCH_GENERAL: 'your_search_workflow_id',
        SEARCH_PAPER: 'your_paper_search_workflow_id'
    }
};
```

#### 3. 本地测试

**推荐方式：双击运行 `start.bat`**
- 自动检查运行环境
- 自动安装依赖
- 自动启动服务器和浏览器

其他启动方式：
```bash
# 方法1：使用Node.js（推荐）
npm install  # 首次运行需要安装依赖
npm start    # 启动服务器，默认端口3000

# 方法2：使用Python内置服务器
python -m http.server 3000

# 方法3：使用Node.js serve
npx serve . -l 3000

# 方法4：直接用浏览器打开index.html（功能受限）
```

#### 4. 访问应用
打开浏览器访问：`http://localhost:3000`

### 生产部署

#### 静态文件部署
1. 将所有文件上传到Web服务器
2. 确保API配置正确
3. 配置HTTPS（推荐）
4. 设置适当的缓存策略

#### 注意事项
- 确保服务器支持CORS或配置代理
- API密钥请妥善保管，避免泄露
- 建议使用HTTPS协议保护数据传输

## 📖 使用说明

### 基本使用流程

#### 1. 首次使用
1. 打开主页，查看功能介绍
2. 点击"查看指南"了解使用方法
3. 建议先进行"能力评估"建立基础档案
4. 根据需要使用其他功能模块

#### 2. 能力评估
1. 进入"能力评估"页面
2. 与AI助手进行评估对话
3. 系统自动提取和保存能力数据
4. 查看可视化的评估结果

#### 3. 目标规划
1. 确保已完成能力评估（推荐）
2. 填写详细的规划表单
3. 系统生成个性化学习规划
4. 可导出或调整规划内容

#### 4. 人生预测
1. 开始50题深度问卷调查
2. 根据真实情况选择答案
3. 提交后获得发展预测报告
4. 可重复测试对比变化

#### 5. 深度搜索
1. 选择搜索模式（普通/学术）
2. 输入搜索问题或关键词
3. 查看AI生成的搜索结果
4. 可导出重要信息

### 高级功能

#### 数据管理
- **导出功能**：支持对话、评估、规划等数据导出
- **历史记录**：自动保存所有操作历史
- **数据清理**：可选择性清空特定数据

#### 个性化设置
- **快捷问题**：自定义常用问题模板
- **界面主题**：支持浅色/深色主题切换（开发中）
- **通知设置**：配置提醒和通知选项（开发中）

## 🔍 故障排除

### 常见问题


#### 1. 页面无法访问
**问题**：显示异常无法访问
**解决方案**：   
- 检查Node.js是否正确安装
- 确认端口3000是否被占用
- 验证防火墙设置

#### 2. API调用失败
**问题**：显示"发送失败: Failed to fetch"
**解决方案**：
- 检查API配置是否正确
- 确认网络连接正常
- 验证API密钥和工作流ID
- 检查CORS设置

#### 3. 页面显示异常
**问题**：样式错乱或功能不正常
**解决方案**：
- 清除浏览器缓存
- 检查JavaScript控制台错误
- 确认所有文件完整上传
- 使用现代浏览器访问

#### 4. 数据丢失
**问题**：历史记录或评估结果丢失
**解决方案**：
- 检查浏览器LocalStorage设置
- 避免使用隐私模式
- 定期导出重要数据
- 检查浏览器存储限制

#### 5. 移动端适配问题
**问题**：手机端显示不正常
**解决方案**：
- 确认viewport设置正确
- 检查CSS媒体查询
- 测试不同屏幕尺寸
- 更新到最新版本

### 调试模式

#### 开启调试日志
在 `js/config.js` 中设置：
```javascript
const DEBUG_CONFIG = {
    ENABLE_LOGGING: true,
    LOG_LEVEL: 'DEBUG'
};
```

#### 查看调试信息
1. 打开浏览器开发者工具（F12）
2. 切换到Console标签
3. 查看详细的操作日志
4. 根据错误信息定位问题

## 🔒 安全和隐私

### 数据安全
- **本地存储**：所有用户数据仅保存在本地浏览器
- **传输加密**：API通信使用HTTPS加密
- **密钥保护**：API密钥需妥善保管
- **访问控制**：建议设置适当的访问权限

### 隐私保护
- **数据最小化**：仅收集必要的功能数据
- **用户控制**：用户可随时删除本地数据
- **透明度**：明确说明数据使用方式
- **合规性**：遵循相关隐私保护法规

## 🚀 扩展开发

### 添加新功能模块

#### 1. 创建页面文件
```html
<!-- new-feature.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>新功能 - 校园AI助手</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- 页面内容 -->
    <script src="js/config.js"></script>
    <script src="js/new-feature.js"></script>
</body>
</html>
```

#### 2. 创建功能脚本
```javascript
// js/new-feature.js
document.addEventListener('DOMContentLoaded', function() {
    // 功能初始化
    initNewFeature();
});

function initNewFeature() {
    // 功能逻辑实现
}
```

#### 3. 更新导航菜单
在所有页面的导航栏中添加新功能链接。

#### 4. 配置API工作流
在 `js/config.js` 中添加新的工作流ID配置。

### 自定义样式

#### 修改主题色彩
在 `css/style.css` 中更新CSS变量：
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
    /* 其他颜色变量 */
}
```

#### 添加新组件样式
```css
/* 新组件样式 */
.new-component {
    /* 样式定义 */
}
```

### API集成

#### 添加新的工作流
```javascript
// 在APIManager中添加新方法
sendNewFeatureRequest: async function(input, history = []) {
    return await this.request(
        API_CONFIG.WORKFLOW_IDS.NEW_FEATURE, 
        input, 
        history
    );
}
```

## 📞 技术支持

### 联系方式
- **项目文档**：查看docs目录下的详细文档
- **问题反馈**：通过GitHub Issues提交问题
- **在线指南**：主页点击"查看指南"获得使用帮助
- **调试信息**：主页点击"系统信息"查看运行状态

### 更新日志
- **v1.0.0**：初始版本发布，包含所有核心功能
- **v1.1.0**：优化API集成，增强错误处理（计划中）
- **v1.2.0**：添加主题切换，改进移动端体验（计划中）

### 贡献指南
欢迎提交Bug报告、功能建议和代码贡献。请遵循以下步骤：
1. Fork项目仓库
2. 创建功能分支
3. 提交代码更改
4. 发起Pull Request

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

---

<div align="center">

**🎓 青藤计划 - 让AI成为你的学习伙伴 ✨**

如有任何问题或建议，欢迎随时联系我们！

[⭐ 项目主页](.) • [🐛 问题反馈](.) • [💬 使用交流](.)

**祝您学习进步，青春无悔！** 🚀

</div>


