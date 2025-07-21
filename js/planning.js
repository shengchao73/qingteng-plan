// 校园AI助手 - 目标规划功能

// 全局变量
let currentPlan = null;
let planningHistory = [];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('目标规划页面初始化开始');
    
    // 检查能力评估状态
    checkAssessmentStatus();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载规划历史
    loadPlanningHistory();
    
    Utils.log('目标规划页面初始化完成');
});

// 检查能力评估状态
function checkAssessmentStatus() {
    Utils.log('检查能力评估状态');
    
    const assessmentData = StorageManager.load('assessment_result');
    const statusText = document.getElementById('statusText');
    const assessmentTime = document.getElementById('assessmentTime');
    const assessmentScore = document.getElementById('assessmentScore');
    const noAssessmentWarning = document.getElementById('noAssessmentWarning');
    
    if (assessmentData && assessmentData.completed) {
        statusText.textContent = '✅ 已完成';
        statusText.className = 'status-value status-completed';
        assessmentTime.textContent = assessmentData.completedTime || '未知';
        assessmentScore.textContent = assessmentData.overallScore || '未评分';
        noAssessmentWarning.style.display = 'none';
        
        Utils.log('能力评估已完成', assessmentData);
    } else {
        statusText.textContent = '❌ 未完成';
        statusText.className = 'status-value status-pending';
        assessmentTime.textContent = '-';
        assessmentScore.textContent = '-';
        noAssessmentWarning.style.display = 'block';
        
        Utils.log('能力评估未完成');
    }
}

// 绑定事件监听器
function bindEventListeners() {
    Utils.log('绑定事件监听器');
    
    // 时间框架选择变化
    const timeFrameSelect = document.getElementById('timeFrame');
    const customTimeGroup = document.getElementById('customTimeGroup');
    
    timeFrameSelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customTimeGroup.style.display = 'block';
            document.getElementById('customTime').required = true;
        } else {
            customTimeGroup.style.display = 'none';
            document.getElementById('customTime').required = false;
        }
    });
    
    // 表单提交
    const planningForm = document.getElementById('planningForm');
    planningForm.addEventListener('submit', handleFormSubmit);
    
    // 导出规划按钮
    const exportPlanBtn = document.getElementById('exportPlanBtn');
    if (exportPlanBtn) {
        exportPlanBtn.addEventListener('click', exportPlan);
    }
    
    // 调整规划按钮
    const adjustPlanBtn = document.getElementById('adjustPlanBtn');
    if (adjustPlanBtn) {
        adjustPlanBtn.addEventListener('click', adjustPlan);
    }
    
    // 刷新历史按钮
    const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
    if (refreshHistoryBtn) {
        refreshHistoryBtn.addEventListener('click', loadPlanningHistory);
    }
    
    // 清空历史按钮
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearPlanningHistory);
    }
}

// 处理表单提交
async function handleFormSubmit(event) {
    event.preventDefault();
    
    Utils.log('开始处理规划表单提交');
    
    const formData = new FormData(event.target);
    const planningData = {
        targetGoal: formData.get('targetGoal'),
        timeFrame: formData.get('timeFrame'),
        customTime: formData.get('customTime'),
        learningStyle: formData.get('learningStyle'),
        difficulty: formData.get('difficulty'),
        timeCommitment: formData.get('timeCommitment'),
        priority: formData.getAll('priority'),
        additionalRequirements: formData.get('additionalRequirements')
    };
    
    Utils.log('收集的规划数据', planningData);
    
    // 验证表单数据
    if (!validatePlanningData(planningData)) {
        return;
    }
    
    // 显示加载状态
    const generateBtn = document.getElementById('generatePlanBtn');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = '🔄 生成中...';
    generateBtn.disabled = true;
    
    try {
        // 构建规划请求
        const planningInput = buildPlanningInput(planningData);
        
        // 发送API请求
        await sendPlanningRequest(planningInput);
        
    } catch (error) {
        Utils.log('规划生成失败', error);
        
        // 创建临时错误提示，不覆盖规划内容
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-error';
        errorMessage.innerHTML = '<strong>错误：</strong> 规划生成失败：' + error.message;
        errorMessage.style.marginBottom = '20px';
        
        const contentDiv = document.getElementById('planContent');
        if (contentDiv && contentDiv.parentNode) {
            contentDiv.parentNode.insertBefore(errorMessage, contentDiv);
            
            // 设置一个定时器，几秒后自动移除错误提示
            setTimeout(() => {
                errorMessage.style.opacity = '0';
                errorMessage.style.transition = 'opacity 0.5s';
                setTimeout(() => errorMessage.remove(), 500);
            }, 3000);
        }
    } finally {
        // 恢复按钮状态
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }
}

// 验证规划数据
function validatePlanningData(data) {
    // 创建显示错误的函数，不覆盖规划内容
    function showValidationError(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-error';
        errorMessage.innerHTML = '<strong>错误：</strong> ' + message;
        errorMessage.style.marginBottom = '20px';
        
        const contentDiv = document.getElementById('planContent');
        if (contentDiv && contentDiv.parentNode) {
            // 清除之前的验证错误消息
            const previousErrors = contentDiv.parentNode.querySelectorAll('.alert.alert-error');
            previousErrors.forEach(error => error.remove());
            
            contentDiv.parentNode.insertBefore(errorMessage, contentDiv);
            
            // 设置一个定时器，几秒后自动移除错误提示
            setTimeout(() => {
                errorMessage.style.opacity = '0';
                errorMessage.style.transition = 'opacity 0.5s';
                setTimeout(() => errorMessage.remove(), 500);
            }, 3000);
        }
    }
    
    if (!data.targetGoal || data.targetGoal.trim().length < 10) {
        showValidationError('请详细描述您的目标（至少10个字符）');
        return false;
    }
    
    if (!data.timeFrame) {
        showValidationError('请选择时间框架');
        return false;
    }
    
    if (data.timeFrame === 'custom' && (!data.customTime || data.customTime.trim().length < 3)) {
        showValidationError('请填写自定义时间要求');
        return false;
    }
    
    if (!data.learningStyle) {
        showValidationError('请选择学习偏好');
        return false;
    }
    
    if (!data.difficulty) {
        showValidationError('请选择难度偏好');
        return false;
    }
    
    if (!data.timeCommitment) {
        showValidationError('请选择每日时间投入');
        return false;
    }
    
    return true;
}

// 构建规划输入
function buildPlanningInput(data) {
    const assessmentData = StorageManager.load('assessment_result');
    
    let input = `请为我制定一个详细的学习规划，要求如下：

目标：${data.targetGoal}

时间框架：${data.timeFrame === 'custom' ? data.customTime : data.timeFrame}

学习偏好：${data.learningStyle}
难度偏好：${data.difficulty}
每日时间投入：${data.timeCommitment}

优先级关注：${data.priority.length > 0 ? data.priority.join('、') : '无特殊要求'}

${data.additionalRequirements ? `额外要求：${data.additionalRequirements}` : ''}

${assessmentData && assessmentData.completed ? 
    `我的能力评估结果：${JSON.stringify(assessmentData.summary || {})}` : 
    '注意：我还没有完成能力评估，请基于一般情况制定规划。'}

请提供：
1. 详细的学习路径和阶段划分
2. 具体的时间安排表（按周或按月）
3. 每个阶段的学习内容和目标
4. 推荐的学习资源和方法
5. 进度检查和调整建议`;

    Utils.log('构建的规划输入', input);
    return input;
}

// 发送规划请求
async function sendPlanningRequest(planningInput) {
    Utils.log('发送规划API请求');
    
    // 检查API配置
    if (!API_CONFIG.BASE_URL || API_CONFIG.BASE_URL.includes('YOUR_')) {
        // 演示模式
        Utils.log('API未配置，使用演示模式');
        await simulatePlanningResponse(planningInput);
        return;
    }
    
    try {
        // 获取正确格式的对话历史
        const history = ChatHistoryManager.getAPIHistory('planning');
        
        // 发送API请求
        const response = await APIManager.sendPlanningRequest(planningInput);
        
        // 处理流式响应
        await APIManager.handleStreamResponse(
            response,
            (chunk, fullContent) => {
                displayPlanningResult(fullContent, false);
            },
            (fullContent) => {
                displayPlanningResult(fullContent, true);
                savePlanningResult(planningInput, fullContent);
                
                // 保存对话记录
                ChatHistoryManager.saveChatByType('planning', planningInput, fullContent);
            },
            (error) => {
                throw error;
            }
        );
        
    } catch (error) {
        Utils.log('API请求失败，使用演示模式', error);
        
        // 创建临时错误提示，不覆盖规划内容
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-error';
        errorMessage.innerHTML = '<strong>错误：</strong> API请求失败，将使用演示模式';
        errorMessage.style.marginBottom = '20px';
        
        const contentDiv = document.getElementById('planContent');
        if (contentDiv && contentDiv.parentNode) {
            contentDiv.parentNode.insertBefore(errorMessage, contentDiv);
            
            // 设置一个定时器，几秒后自动移除错误提示
            setTimeout(() => {
                errorMessage.style.opacity = '0';
                errorMessage.style.transition = 'opacity 0.5s';
                setTimeout(() => errorMessage.remove(), 500);
            }, 3000);
        }
        
        await simulatePlanningResponse(planningInput);
    }
}

// 模拟规划响应
async function simulatePlanningResponse(planningInput) {
    Utils.log('使用演示模式生成规划');
    
    const demoResponse = `**目标完整信息总结**

- **目标内容**：熟悉Python编程，侧重机器人方向（如ROS、机械臂控制、自动化等）。
- **时间框架**：2025年7月1日至2025年8月31日（共2个月）。
- **学习偏好**：以动手实践为主（如项目开发、代码调试、机器人实操）。
- **难度偏好**：高级（深入学习算法、复杂系统开发、高阶框架或工具链）。
- **每日时间投入**：3小时/天。
- **优先级**：高（需优先保障时间与资源投入）。
- **额外要求**：结合机器人领域实际场景，掌握Python在机器人控制、仿真、数据处理等方向的应用。

---

**补充建议**（基于目标信息）：
1. **学习路径**：从基础语法快速过渡到机器人相关库（如rospy、PyRobot、OpenCV），并参与实战项目（如机器人避障、路径规划）。
2. **实践方向**：搭建ROS环境，完成机械臂控制、传感器数据处理等案例；尝试用Python编写机器人仿真（如Gazebo+ROS）。
3. **资源推荐**：高级教程（如《Python机器人实战》）、开源机器人项目（GitHub）、ROS官方文档。
4. **成果验证**：最终实现一个机器人相关完整项目（如自主导航小车、智能机械臂控制）。

#####

# 📘 **Python机器人方向学习规划**（2025.7-2025.8）

---

## 🛠️ **一级拆解：核心子目标**
1. **ROS与机器人控制基础**
2. **计算机视觉与传感器处理**
3. **高级算法与系统集成**
4. **实战项目开发与成果落地**

---

## 🚀 **二级任务 & 三级行动项**

### 1. ROS与机器人控制基础
**任务1：ROS环境搭建与核心API掌握**
- **行动项1**：安装ROS（Noetic）+ MoveIt（机械臂控制）
  - ⏱️ **D1-D3**：虚拟机/Ubuntu环境配置，解决依赖问题
  - 📊 **指标**：完成HelloWorld节点、Service通信测试
  - 💡 **创新点**：记录环境配置陷阱（如网络代理、权限问题）
- **行动项2**：学习rospy高级特性（ActionLib、TF坐标转换）
  - ⏱️ **D4-D10**：每日1小时源码分析 + 1小时实战
  - 📊 **指标**：实现动态地图更新节点（模拟传感器输入）

**任务2：机械臂控制与仿真**
- **行动项1**：基于MoveIt的机械臂轨迹规划
  - ⏱️ **D11-D15**：Python调用MoveIt API，设计避障路径
  - 📊 **指标**：仿真环境中实现机械臂从A点到B点的精准移动（误差<2cm）
- **行动项2**：集成摄像头数据实现视觉伺服控制
  - ⏱️ **D16-D20**：OpenCV图像处理 + ROS话题订阅
  - 📊 **指标**：机械臂根据实时图像调整抓取位置（成功率>80%）

---

### 2. 计算机视觉与传感器处理
**任务1：机器人视觉系统开发**
- **行动项1**：YOLOv5模型训练与ROS集成
  - ⏱️ **D21-D25**：标注数据集（模拟机械臂抓取对象）、训练模型
  - 📊 **指标**：识别准确率>90%，推理延迟<200ms
- **行动项2**：多传感器数据融合（LIDAR + 摄像头）
  - ⏱️ **D26-D30**：编写数据同步节点，实现SLAM初步功能
  - 📊 **指标**：生成房间点云地图，定位误差<10cm

---

### 3. 高级算法与系统集成
**任务1：路径规划与强化学习**
- **行动项1**：A*算法优化与动态避障
  - ⏱️ **D31-D35**：Python实现自适应权重A*（考虑机器人运动学约束）
  - 📊 **指标**：在Gazebo仿真中通过复杂障碍区（耗时<5s）
- **行动项2**：基于Gazebo的机器人仿真系统
  - ⏱️ **D36-D40**：搭建自主导航小车虚拟环境，集成ROS控制逻辑
  - 📊 **指标**：完成10次连续任务（充电-运输-避障）无碰撞

---

### 4. 实战项目开发与成果落地
**任务1：综合项目开发**
- **行动项1**：智能机械臂控制系统（整合所有技术）
  - ⏱️ **D41-D50**：需求分析 → 模块化开发 → 联调测试
  - 📊 **指标**：机械臂完成"识别-定位-抓取-放置"全流程（成功率>95%）
- **行动项2**：技术文档与成果展示
  - ⏱️ **D51-D60**：撰写GitHub Readme、录制演示视频、部署云端仿真
  - 📊 **指标**：GitHub Star>50，技术博客阅读量>1000

---

## ⚠️ **风险预警与应对**
1. **环境配置卡顿**：预留D1-D3完整时间，提前下载离线依赖包。
2. **理论复杂度过高**：优先学习ROS官方教程（https://wiki.ros.org/），跳过数学推导。
3. **项目整合压力**：将大目标拆解为"机械臂控制→视觉识别→系统集成"三阶段。

---

## 🗺️ **学习路径可视化（Mermaid流程图）**
\`\`\`mermaid
graph TD
    A[ROS基础] --> B[机械臂控制]
    A --> C[计算机视觉]
    B --> D[路径规划]
    C --> D
    D --> E[综合项目]
    E --> F[成果输出]
\`\`\`

---

## 📅 **时间分配表**
| 阶段                | 时间跨度    | 每日投入 | 核心目标                          |
|---------------------|------------|----------|-----------------------------------|
| ROS基础与机械臂控制 | D1-D20     | 3h       | 掌握ROS通信、机械臂API开发         |
| 计算机视觉          | D21-D30    | 3h       | 实现视觉识别与多传感器融合         |
| 高级算法            | D31-D40    | 3h       | 完成路径规划与仿真系统搭建         |
| 项目开发            | D41-D60    | 4h       | 交付完整机器人控制系统 + 技术文档  |

---

*注意：这是演示模式生成的规划，实际使用时将调用真实的AI工作流API生成更个性化的内容。*`;

    // 模拟流式输出
    const chunks = demoResponse.split('');
    const resultDiv = document.getElementById('planningResult');
    resultDiv.style.display = 'block';
    
    let currentContent = '';
    for (let i = 0; i < chunks.length; i++) {
        currentContent += chunks[i];
        displayPlanningResult(currentContent, false);
        await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    displayPlanningResult(demoResponse, true);
    savePlanningResult(planningInput, demoResponse);
}

// 解析规划内容并提取mermaid图表（仅在完成时调用）
function parsePlanningContent(content) {
    // 提取mermaid图表
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
    const mermaidMatches = content.match(mermaidRegex);
    
    let dt = '';
    if (mermaidMatches && mermaidMatches.length > 0) {
        dt = mermaidMatches[0]; // 取第一个mermaid图表
        
        // 异步渲染mermaid图表，避免阻塞主流程
        setTimeout(() => {
            const mermaidContent = mermaidMatches[0].replace(/```mermaid\n/, '').replace(/\n```$/, '');
            renderMermaidDiagram(mermaidContent);
        }, 100);
    }
    
    // 提取并格式化主要内容
    const centent = content.replace(mermaidRegex, '').trim();
    
    return {
        dt: dt,
        centent: centent
    };
}

// 渲染mermaid图表
function renderMermaidDiagram(mermaidContent) {
    const mermaidContainer = document.getElementById('mermaidContainer');
    const mermaidDiagram = document.getElementById('mermaidDiagram');
    
    try {
        // 清空之前的图表
        mermaidDiagram.innerHTML = '';
        
        // 生成唯一ID
        const diagramId = 'mermaid-diagram-' + Date.now();
        
        // 使用 mermaid.render 异步渲染图表
        mermaid.render(diagramId, mermaidContent).then((result) => {
            mermaidDiagram.innerHTML = result.svg;
            mermaidContainer.style.display = 'block';
            Utils.log('Mermaid图表渲染成功');
        }).catch((error) => {
            Utils.log('Mermaid图表渲染失败', error);
            mermaidContainer.style.display = 'none';
        });
        
    } catch (error) {
        Utils.log('Mermaid图表渲染失败', error);
        mermaidContainer.style.display = 'none';
    }
}

// 显示规划结果
function displayPlanningResult(content, isComplete) {
    const resultDiv = document.getElementById('planningResult');
    const contentDiv = document.getElementById('planContent');
    
    // 确保规划结果区域始终显示
    resultDiv.style.display = 'block';
    
    // 将Markdown转换为HTML显示
    const htmlContent = Utils.markdownToHtml(content);
    contentDiv.innerHTML = htmlContent;
    
    // 只在流式输出完成后进行解析和图表渲染
    if (isComplete) {
        Utils.log('规划生成完成');
        
        // 解析并保存结构化数据
        const parsedData = parsePlanningContent(content);
        Utils.log('解析后的规划数据', parsedData);
        
        // 将解析后的数据保存到全局变量供导出使用
        if (currentPlan) {
            currentPlan.parsedData = parsedData;
        }
        
        // 添加成功提示，但不覆盖内容
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success';
        successMessage.innerHTML = '<strong>成功：</strong> 规划生成完成！';
        successMessage.style.marginBottom = '20px';
        contentDiv.parentNode.insertBefore(successMessage, contentDiv);
        
        // 设置一个定时器，几秒后自动移除成功提示，但保留规划结果显示
        setTimeout(() => {
            successMessage.style.opacity = '0';
            successMessage.style.transition = 'opacity 0.5s';
            setTimeout(() => successMessage.remove(), 500);
        }, 3000);
    }
    
    // 滚动到结果区域
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 保存规划结果
function savePlanningResult(input, output) {
    const planData = {
        id: Utils.generateId(),
        input: input,
        output: output,
        timestamp: new Date().toISOString(),
        createdTime: Utils.formatDateTime(new Date())
    };
    
    currentPlan = planData;
    
    // 保存到历史记录
    planningHistory.unshift(planData);
    StorageManager.save('planning_history', planningHistory);
    
    // 更新历史显示
    loadPlanningHistory();
    
    Utils.log('规划结果已保存', planData);
}

// 导出规划
function exportPlan() {
    if (!currentPlan) {
        Utils.showError(document.getElementById('planContent'), '没有可导出的规划');
        return;
    }
    
    // 如果有解析后的数据，导出结构化格式
    if (currentPlan.parsedData) {
        const exportData = currentPlan.parsedData;
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `规划结构化数据_${Utils.formatDateTime(new Date(), 'file')}.json`;
        link.click();
        
        Utils.log('结构化规划数据已导出', exportData);
        
        // 创建临时成功提示，不覆盖规划内容
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success';
        successMessage.innerHTML = '<strong>成功：</strong> 规划已导出到下载文件夹';
        successMessage.style.marginBottom = '20px';
        
        const contentDiv = document.getElementById('planContent');
        contentDiv.parentNode.insertBefore(successMessage, contentDiv);
        
        // 设置一个定时器，几秒后自动移除成功提示，但保留规划结果显示
        setTimeout(() => {
            successMessage.style.opacity = '0';
            successMessage.style.transition = 'opacity 0.5s';
            setTimeout(() => successMessage.remove(), 500);
        }, 3000);
    } else {
        // 原有导出逻辑
        const exportData = {
            title: '个性化学习规划',
            createdTime: currentPlan.createdTime,
            content: currentPlan.output
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `学习规划_${Utils.formatDateTime(new Date(), 'file')}.json`;
        link.click();
        
        Utils.log('规划已导出');
        
        // 创建临时成功提示，不覆盖规划内容
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success';
        successMessage.innerHTML = '<strong>成功：</strong> 规划已导出到下载文件夹';
        successMessage.style.marginBottom = '20px';
        
        const contentDiv = document.getElementById('planContent');
        contentDiv.parentNode.insertBefore(successMessage, contentDiv);
        
        // 设置一个定时器，几秒后自动移除成功提示，但保留规划结果显示
        setTimeout(() => {
            successMessage.style.opacity = '0';
            successMessage.style.transition = 'opacity 0.5s';
            setTimeout(() => successMessage.remove(), 500);
        }, 3000);
    }
}

// 获取规划的结构化数据
function getPlanningStructuredData() {
    if (!currentPlan || !currentPlan.parsedData) {
        // 创建临时错误提示，不覆盖规划内容
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-error';
        errorMessage.innerHTML = '<strong>错误：</strong> 没有可获取的结构化规划数据';
        errorMessage.style.marginBottom = '20px';
        
        const contentDiv = document.getElementById('planContent');
        contentDiv.parentNode.insertBefore(errorMessage, contentDiv);
        
        // 设置一个定时器，几秒后自动移除错误提示，但保留规划结果显示
        setTimeout(() => {
            errorMessage.style.opacity = '0';
            errorMessage.style.transition = 'opacity 0.5s';
            setTimeout(() => errorMessage.remove(), 500);
        }, 3000);
        
        return null;
    }
    
    return currentPlan.parsedData;
}

// 调整规划
function adjustPlan() {
    // 滚动回表单区域
    document.getElementById('planningForm').scrollIntoView({ behavior: 'smooth' });
    
    // 创建临时信息提示，不覆盖规划内容
    const infoMessage = document.createElement('div');
    infoMessage.className = 'alert alert-info';
    infoMessage.innerHTML = '<strong>提示：</strong> 请修改表单内容后重新生成规划';
    infoMessage.style.marginBottom = '20px';
    
    const contentDiv = document.getElementById('planContent');
    contentDiv.parentNode.insertBefore(infoMessage, contentDiv);
    
    // 设置一个定时器，几秒后自动移除信息提示，但保留规划结果显示
    setTimeout(() => {
        infoMessage.style.opacity = '0';
        infoMessage.style.transition = 'opacity 0.5s';
        setTimeout(() => infoMessage.remove(), 500);
    }, 3000);
}

// 加载规划历史
function loadPlanningHistory() {
    Utils.log('加载规划历史');
    
    planningHistory = StorageManager.load('planning_history', []);
    const historyDiv = document.getElementById('planningHistory');
    
    if (planningHistory.length === 0) {
        historyDiv.innerHTML = `
            <div class="empty-state">
                <p>📝 暂无规划历史</p>
                <p>制定第一个规划后，这里将显示历史记录</p>
            </div>
        `;
        return;
    }
    
    const historyHtml = planningHistory.map(plan => `
        <div class="planning-history-item" data-plan-id="${plan.id}">
            <div class="history-header">
                <span class="history-title">学习规划</span>
                <span class="history-time">${plan.createdTime}</span>
            </div>
            <div class="history-summary">
                ${plan.input.substring(0, 100)}...
            </div>
            <div class="history-actions">
                <button class="btn btn-sm btn-primary" onclick="viewPlan('${plan.id}')">
                    👁️ 查看
                </button>
                <button class="btn btn-sm btn-secondary" onclick="copyPlan('${plan.id}')">
                    📋 复制
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePlan('${plan.id}')">
                    🗑️ 删除
                </button>
            </div>
        </div>
    `).join('');
    
    historyDiv.innerHTML = historyHtml;
    
    Utils.log(`加载了 ${planningHistory.length} 条规划历史`);
}

// 查看规划
function viewPlan(planId) {
    const plan = planningHistory.find(p => p.id === planId);
    if (!plan) return;
    
    currentPlan = plan;
    displayPlanningResult(plan.output, true);
    
    Utils.log('查看历史规划', planId);
}

// 复制规划
function copyPlan(planId) {
    const plan = planningHistory.find(p => p.id === planId);
    if (!plan) return;
    
    navigator.clipboard.writeText(plan.output).then(() => {
        // 创建临时成功提示，不覆盖历史记录内容
        const historyContainer = document.getElementById('planningHistory');
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success';
        successMessage.innerHTML = '<strong>成功：</strong> 规划内容已复制到剪贴板';
        successMessage.style.marginBottom = '20px';
        
        historyContainer.parentNode.insertBefore(successMessage, historyContainer);
        
        // 设置一个定时器，几秒后自动移除成功提示
        setTimeout(() => {
            successMessage.style.opacity = '0';
            successMessage.style.transition = 'opacity 0.5s';
            setTimeout(() => successMessage.remove(), 500);
        }, 3000);
    }).catch(() => {
        // 创建临时错误提示，不覆盖历史记录内容
        const historyContainer = document.getElementById('planningHistory');
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-error';
        errorMessage.innerHTML = '<strong>错误：</strong> 复制失败，请手动复制';
        errorMessage.style.marginBottom = '20px';
        
        historyContainer.parentNode.insertBefore(errorMessage, historyContainer);
        
        // 设置一个定时器，几秒后自动移除错误提示
        setTimeout(() => {
            errorMessage.style.opacity = '0';
            errorMessage.style.transition = 'opacity 0.5s';
            setTimeout(() => errorMessage.remove(), 500);
        }, 3000);
    });
    
    Utils.log('复制规划', planId);
}

// 删除规划
function deletePlan(planId) {
    if (!confirm('确定要删除这个规划吗？')) return;
    
    planningHistory = planningHistory.filter(p => p.id !== planId);
    StorageManager.save('planning_history', planningHistory);
    loadPlanningHistory();
    
    Utils.log('删除规划', planId);
    
    // 创建临时成功提示，不覆盖历史记录内容
    const historyContainer = document.getElementById('planningHistory');
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success';
    successMessage.innerHTML = '<strong>成功：</strong> 规划已删除';
    successMessage.style.marginBottom = '20px';
    
    historyContainer.parentNode.insertBefore(successMessage, historyContainer);
    
    // 设置一个定时器，几秒后自动移除成功提示
    setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transition = 'opacity 0.5s';
        setTimeout(() => successMessage.remove(), 500);
    }, 3000);
}

// 清空规划历史
function clearPlanningHistory() {
    if (!confirm('确定要清空所有规划历史吗？此操作不可恢复。')) return;
    
    planningHistory = [];
    StorageManager.save('planning_history', []);
    loadPlanningHistory();
    
    Utils.log('清空规划历史');
    
    // 创建临时成功提示，不覆盖历史记录内容
    const historyContainer = document.getElementById('planningHistory');
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success';
    successMessage.innerHTML = '<strong>成功：</strong> 规划历史已清空';
    successMessage.style.marginBottom = '20px';
    
    historyContainer.parentNode.insertBefore(successMessage, historyContainer);
    
    // 设置一个定时器，几秒后自动移除成功提示
    setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transition = 'opacity 0.5s';
        setTimeout(() => successMessage.remove(), 500);
    }, 3000);
}

