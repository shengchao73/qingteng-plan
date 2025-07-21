// 校园AI助手 - 能力评估功能

// 全局变量
let currentAssessmentId = null;
let assessmentStartTime = null;
let conversationRounds = 0;
let isAssessing = false;
let assessmentData = {
    cognitive_ability: 0,      // 认知能力
    learning_ability: 0,       // 学习能力
    innovation_ability: 0,     // 创新能力
    social_ability: 0,         // 社交能力
    technical_skills: [],      // 技术技能
    interests: [],             // 兴趣领域
    strengths: [],             // 优势特长
    improvement_areas: []      // 改进领域
};

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('能力评估页面初始化开始');
    
    // 初始化页面
    initializeAssessmentPage();
    
    // 设置事件监听器
    setupAssessmentEventListeners();
    
    // 加载评估历史
    loadAssessmentHistory();
    
    // 检查API状态
    checkAssessmentAPIStatus();
    
    // 设置欢迎消息时间
    document.getElementById('assessment-welcome-time').textContent = Utils.formatTimestamp(new Date().toISOString());
    
    // 检查是否有现有评估结果
    loadExistingAssessmentResult();
    
    Utils.log('能力评估页面初始化完成');
});

// 初始化评估页面
function initializeAssessmentPage() {
    Utils.log('初始化能力评估页面');
    
    // 开始新评估
    startNewAssessment();
    
    // 更新状态显示
    updateAssessmentStatus();
}

// 设置事件监听器
function setupAssessmentEventListeners() {
    Utils.log('设置评估页面事件监听器');
    
    const chatInput = document.getElementById('assessment-chat-input');
    const sendButton = document.getElementById('assessment-send-button');
    
    // 输入框事件
    chatInput.addEventListener('input', function() {
        // 更新字符计数
        const counter = document.getElementById('assessment-input-counter');
        counter.textContent = `${this.value.length}/3000`;
        
        // 自动调整高度
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        
        // 启用/禁用发送按钮
        sendButton.disabled = this.value.trim().length === 0 || isAssessing;
    });
    
    // 快捷键支持
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendAssessmentMessage();
        }
    });
    
    // 发送按钮点击事件
    sendButton.addEventListener('click', sendAssessmentMessage);
    
    Utils.log('评估页面事件监听器设置完成');
}

// 开始新评估
function startNewAssessment() {
    Utils.log('开始新的能力评估');
    
    // 生成新的评估ID
    currentAssessmentId = Utils.generateId();
    assessmentStartTime = new Date().toISOString();
    conversationRounds = 0;
    
    // 重置评估数据
    assessmentData = {
        cognitive_ability: 0,
        learning_ability: 0,
        innovation_ability: 0,
        social_ability: 0,
        technical_skills: [],
        interests: [],
        strengths: [],
        improvement_areas: []
    };
    
    // 清空对话区域并显示欢迎消息
    const chatMessages = document.getElementById('assessment-chat-messages');
    chatMessages.innerHTML = `
        <div class="message ai">
            <div class="message-header">
                <strong>🤖 评估助手</strong>
                <span class="message-time">${Utils.formatTimestamp(new Date().toISOString())}</span>
            </div>
            <div class="message-content">
                欢迎来到能力评估模块！🎯<br><br>
                我将通过一系列对话来了解和分析您的能力特征，包括：<br>
                • 📚 学习能力和知识结构<br>
                • 🧠 思维方式和解决问题的能力<br>
                • 💪 技能水平和专业特长<br>
                • 🎨 创新能力和适应性<br>
                • 🤝 沟通协作和领导力<br><br>
                评估过程大约需要10-15分钟，请如实回答问题。让我们开始吧！<br><br>
                <strong>首先，请简单介绍一下您的基本情况，比如专业背景、学习经历或感兴趣的领域？</strong>
            </div>
        </div>
    `;
    
    // 更新状态
    updateAssessmentStatus();
    
    // 清空输入框
    const chatInput = document.getElementById('assessment-chat-input');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    Utils.log('新评估已开始', { assessmentId: currentAssessmentId });
}

// 发送评估消息
async function sendAssessmentMessage() {
    const chatInput = document.getElementById('assessment-chat-input');
    const message = chatInput.value.trim();
    
    if (!message || isAssessing) {
        Utils.log('消息为空或正在评估中，跳过发送');
        return;
    }
    
    Utils.log('发送评估消息', { message, assessmentId: currentAssessmentId });
    
    // 添加用户消息到界面
    addAssessmentMessageToChat('user', message);
    
    // 清空输入框
    chatInput.value = '';
    chatInput.style.height = 'auto';
    document.getElementById('assessment-input-counter').textContent = '0/3000';
    
    // 设置评估状态
    setAssessingStatus(true);
    
    try {
        // 检查API配置
        if (API_CONFIG.BASE_URL === 'YOUR_STAR_AGENT_API_ENDPOINT') {
            throw new Error('API未配置，请先在js/config.js中设置正确的API端点和密钥');
        }
        
        // 获取评估历史记录作为上下文
        const assessmentHistory = ChatHistoryManager.getChatHistory('assessment');
        
        // 获取当前评估的历史记录
        const currentAssessmentHistory = assessmentHistory
            .filter(record => record.assessment_id === currentAssessmentId)
            .slice(-20); // 只使用最近的20条记录作为上下文
        
        // 格式化历史记录为API所需格式
        const formattedHistory = [];
        
        // 如果是现有对话，添加历史记录
        if (currentAssessmentHistory.length > 0) {
            currentAssessmentHistory.forEach(chat => {
                if (chat.user_message) {
                    // 移除HTML标签，避免API处理错误
                    const userMessage = typeof chat.user_message === 'string' 
                        ? chat.user_message.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '') 
                        : chat.user_message;
                    
                    formattedHistory.push({
                        role: 'user',
                        content: userMessage
                    });
                }
                if (chat.ai_response) {
                    // 移除HTML标签，避免API处理错误
                    const aiResponse = typeof chat.ai_response === 'string' 
                        ? chat.ai_response.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '') 
                        : chat.ai_response;
                    
                    formattedHistory.push({
                        role: 'assistant',
                        content: aiResponse
                    });
                }
            });
        }
        
        // 发送API请求，传递历史记录
        const response = await APIManager.sendAssessmentMessage(message, formattedHistory);
        
        // 处理流式响应
        await handleAssessmentStreamResponse(response, message);
        
    } catch (error) {
        Utils.log('发送评估消息失败', error);
        handleAssessmentSendError(error, message);
    } finally {
        setAssessingStatus(false);
    }
}

// 处理评估流式响应
async function handleAssessmentStreamResponse(response, userMessage) {
    Utils.log('开始处理评估流式响应');
    
    // 创建AI消息容器
    const aiMessageElement = addAssessmentMessageToChat('ai', '');
    const contentElement = aiMessageElement.querySelector('.message-content');
    
    let fullResponse = '';
    
    try {
        await APIManager.handleStreamResponse(
            response,
            // onChunk - 处理每个数据块
            (chunk, accumulated) => {
                // 解析响应，提取对话内容和存储变量
                const parsedData = parseAssessmentResponse(chunk, accumulated);
                
                // 更新对话显示
                contentElement.innerHTML = parsedData.dialogue;
                
                // 实时更新存储变量
                if (parsedData.assessmentData) {
                    updateAssessmentData(parsedData.assessmentData);
                }
                
                scrollAssessmentToBottom();
            },
            // onComplete - 流式响应完成
            (finalResponse) => {
                fullResponse = finalResponse;
                Utils.log('评估流式响应完成', { response: finalResponse });
                
                // 最终解析和保存
                const finalParsedData = parseAssessmentResponse(finalResponse, finalResponse);
                if (finalParsedData.assessmentData) {
                    updateAssessmentData(finalParsedData.assessmentData);
                    saveAssessmentResult();
                }
                
                // 保存对话到历史
                saveAssessmentToHistory(userMessage, finalParsedData.dialogue);
                
                // 更新状态
                conversationRounds++;
                updateAssessmentStatus();
            },
            // onError - 处理错误
            (error) => {
                Utils.log('评估流式响应错误', error);
                contentElement.innerHTML = `<span style="color: #f44336;">抱歉，处理您的评估时出现了错误：${error.message}</span>`;
            }
        );
        
    } catch (error) {
        Utils.log('处理评估流式响应失败', error);
        contentElement.innerHTML = `<span style="color: #f44336;">抱歉，处理您的评估时出现了错误：${error.message}</span>`;
    }
}

// 解析评估响应（提取对话和存储变量）
function parseAssessmentResponse(chunk, accumulated) {
    try {
        // 尝试解析JSON
        const jsonData = JSON.parse(accumulated);
        
        // 只提取content字段内容
        if (jsonData.content !== undefined) {
            const dialogue = jsonData.content.replace(/\\n/g, '<br>');
            return {
                dialogue: dialogue,
                assessmentData: null
            };
        }
        
        // 兼容其他格式
        return {
            dialogue: accumulated,
            assessmentData: null
        };
    } catch (e) {
        // 如果不是JSON格式，假设是纯文本对话
        return {
            dialogue: accumulated,
            assessmentData: null
        };
    }
}

// 更新评估数据
function updateAssessmentData(newData) {
    if (!newData) return;
    
    Utils.log('更新评估数据', newData);
    
    // 合并新的评估数据
    if (newData.cognitive_ability !== undefined) {
        assessmentData.cognitive_ability = newData.cognitive_ability;
    }
    if (newData.learning_ability !== undefined) {
        assessmentData.learning_ability = newData.learning_ability;
    }
    if (newData.innovation_ability !== undefined) {
        assessmentData.innovation_ability = newData.innovation_ability;
    }
    if (newData.social_ability !== undefined) {
        assessmentData.social_ability = newData.social_ability;
    }
    if (newData.technical_skills) {
        assessmentData.technical_skills = [...new Set([...assessmentData.technical_skills, ...newData.technical_skills])];
    }
    if (newData.interests) {
        assessmentData.interests = [...new Set([...assessmentData.interests, ...newData.interests])];
    }
    if (newData.strengths) {
        assessmentData.strengths = [...new Set([...assessmentData.strengths, ...newData.strengths])];
    }
    if (newData.improvement_areas) {
        assessmentData.improvement_areas = [...new Set([...assessmentData.improvement_areas, ...newData.improvement_areas])];
    }
    
    // 实时更新显示
    updateAssessmentResultDisplay();
}

// 更新评估结果显示
function updateAssessmentResultDisplay() {
    const resultDisplay = document.getElementById('assessment-result-display');
    
    if (isEmptyAssessmentData()) {
        resultDisplay.innerHTML = `
            <div class="text-center" style="color: #666; padding: 20px;">
                <p>📋 暂无评估结果</p>
                <p style="font-size: 14px;">开始对话评估后，这里将显示您的能力分析数据</p>
            </div>
        `;
        return;
    }
    
    resultDisplay.innerHTML = `
        <div class="assessment-result">
            <h4>📊 能力评分</h4>
            <div class="ability-scores">
                <div class="score-item">
                    <span>🧠 认知能力</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.cognitive_ability * 10}%"></div>
                        <span class="score-text">${assessmentData.cognitive_ability}/10</span>
                    </div>
                </div>
                <div class="score-item">
                    <span>📚 学习能力</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.learning_ability * 10}%"></div>
                        <span class="score-text">${assessmentData.learning_ability}/10</span>
                    </div>
                </div>
                <div class="score-item">
                    <span>💡 创新能力</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.innovation_ability * 10}%"></div>
                        <span class="score-text">${assessmentData.innovation_ability}/10</span>
                    </div>
                </div>
                <div class="score-item">
                    <span>🤝 社交能力</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${assessmentData.social_ability * 10}%"></div>
                        <span class="score-text">${assessmentData.social_ability}/10</span>
                    </div>
                </div>
            </div>
            
            ${assessmentData.technical_skills.length > 0 ? `
                <h4>🛠️ 技术技能</h4>
                <div class="skill-tags">
                    ${assessmentData.technical_skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            ` : ''}
            
            ${assessmentData.interests.length > 0 ? `
                <h4>🎯 兴趣领域</h4>
                <div class="interest-tags">
                    ${assessmentData.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
                </div>
            ` : ''}
            
            ${assessmentData.strengths.length > 0 ? `
                <h4>💪 优势特长</h4>
                <ul class="strength-list">
                    ${assessmentData.strengths.map(strength => `<li>${strength}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    `;
    
    Utils.log('评估结果显示已更新', assessmentData);
}

// 检查评估数据是否为空
function isEmptyAssessmentData() {
    return assessmentData.cognitive_ability === 0 && 
           assessmentData.learning_ability === 0 && 
           assessmentData.innovation_ability === 0 && 
           assessmentData.social_ability === 0 &&
           assessmentData.technical_skills.length === 0 &&
           assessmentData.interests.length === 0 &&
           assessmentData.strengths.length === 0;
}

// 处理评估发送错误
function handleAssessmentSendError(error, userMessage) {
    Utils.log('处理评估发送错误', error);
    
    let errorMessage = '抱歉，评估过程中出现了错误。';
    
    if (error.message.includes('API未配置')) {
        errorMessage = '⚠️ API未配置，这是演示模式。请在 js/config.js 中配置正确的API设置。';
        
        // 演示模式：模拟评估回复和数据
        setTimeout(() => {
            const demoResponse = generateDemoAssessmentResponse(userMessage);
            const aiMessageElement = addAssessmentMessageToChat('ai', demoResponse.dialogue);
            
            // 模拟更新评估数据
            updateAssessmentData(demoResponse.assessmentData);
            saveAssessmentResult();
            
            saveAssessmentToHistory(userMessage, demoResponse.dialogue);
            conversationRounds++;
            updateAssessmentStatus();
        }, 1500);
        
    } else {
        errorMessage = `评估失败：${error.message}`;
    }
    
    // 显示错误消息
    addAssessmentMessageToChat('ai', `<span style="color: #f44336;">${errorMessage}</span>`);
}

// 生成演示评估回复（当API未配置时）
function generateDemoAssessmentResponse(userMessage) {
    const demoResponses = [
        {
            dialogue: `感谢您的详细介绍！从您的描述中，我可以看出您在学习方面有很好的主动性。让我继续了解一下：<br><br>请描述一个您最近解决的具体问题，包括您是如何思考和处理的？这将帮助我评估您的问题解决能力。`,
            assessmentData: {
                learning_ability: Math.floor(Math.random() * 3) + 6,
                cognitive_ability: Math.floor(Math.random() * 2) + 5
            }
        },
        {
            dialogue: `很好的问题解决思路！您展现出了不错的逻辑思维能力。现在我想了解您的创新和协作方面：<br><br>1. 您在团队合作中通常扮演什么角色？<br>2. 您有没有提出过创新性的想法或解决方案？`,
            assessmentData: {
                innovation_ability: Math.floor(Math.random() * 3) + 5,
                social_ability: Math.floor(Math.random() * 3) + 6,
                technical_skills: ['问题分析', '逻辑思维']
            }
        },
        {
            dialogue: `基于我们的对话，我对您的能力有了初步的了解。您在学习能力和问题解决方面表现出色，具有良好的思维逻辑。建议您继续发展创新思维和团队协作技能。<br><br>评估已基本完成，您可以查看右侧的详细分析结果。`,
            assessmentData: {
                strengths: ['学习能力强', '逻辑思维清晰', '问题解决能力'],
                interests: ['技术学习', '问题解决'],
                improvement_areas: ['创新思维', '团队协作']
            }
        }
    ];
    
    const responseIndex = Math.min(conversationRounds, demoResponses.length - 1);
    return demoResponses[responseIndex];
}

// 添加评估消息到对话界面
function addAssessmentMessageToChat(sender, content) {
    const chatMessages = document.getElementById('assessment-chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    
    const timestamp = Utils.formatTimestamp(new Date().toISOString());
    const senderName = sender === 'user' ? '👤 您' : '🤖 评估助手';
    
    messageElement.innerHTML = `
        <div class="message-header">
            <strong>${senderName}</strong>
            <span class="message-time">${timestamp}</span>
        </div>
        <div class="message-content">${content}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    scrollAssessmentToBottom();
    
    Utils.log('评估消息已添加到界面', { sender, content: content.substring(0, 100) });
    
    return messageElement;
}

// 滚动到底部
function scrollAssessmentToBottom() {
    const chatMessages = document.getElementById('assessment-chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 设置评估状态
function setAssessingStatus(assessing) {
    isAssessing = assessing;
    const sendButton = document.getElementById('assessment-send-button');
    const typingIndicator = document.getElementById('assessment-typing-indicator');
    const chatInput = document.getElementById('assessment-chat-input');
    
    if (assessing) {
        Utils.showLoading(sendButton);
        typingIndicator.classList.remove('hidden');
        chatInput.disabled = true;
    } else {
        Utils.hideLoading(sendButton, '发送');
        typingIndicator.classList.add('hidden');
        chatInput.disabled = false;
        chatInput.focus();
    }
    
    // 更新发送按钮状态
    sendButton.disabled = assessing || chatInput.value.trim().length === 0;
}

// 保存评估结果
function saveAssessmentResult() {
    const assessmentResult = {
        id: currentAssessmentId,
        timestamp: new Date().toISOString(),
        start_time: assessmentStartTime,
        conversation_rounds: conversationRounds,
        assessment_data: { ...assessmentData }
    };
    
    StorageManager.save('assessment_result', assessmentResult);
    Utils.log('评估结果已保存', assessmentResult);
}

// 保存评估对话到历史
function saveAssessmentToHistory(userMessage, aiResponse) {
    // 使用ChatHistoryManager保存评估对话
    const chatRecord = ChatHistoryManager.saveChatByType(
        'assessment',
        userMessage,
        aiResponse,
        {
            assessment_id: currentAssessmentId,
            round: conversationRounds + 1
        }
    );
    
    Utils.log('评估对话已保存到历史', chatRecord);
}

// 更新评估状态
function updateAssessmentStatus() {
    document.getElementById('assessment-status').textContent = 
        conversationRounds === 0 ? '未开始' : conversationRounds < 3 ? '进行中' : '已完成';
    document.getElementById('conversation-rounds').textContent = conversationRounds;
    
    const completionRate = Math.min(Math.round((conversationRounds / 3) * 100), 100);
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    
    if (assessmentStartTime) {
        const duration = Math.round((new Date() - new Date(assessmentStartTime)) / 60000);
        document.getElementById('assessment-duration').textContent = `${duration}分钟`;
    }
}

// 检查API状态
function checkAssessmentAPIStatus() {
    const apiConfigured = API_CONFIG.BASE_URL !== 'YOUR_STAR_AGENT_API_ENDPOINT';
    const connectionStatus = document.getElementById('assessment-connection-status');
    
    if (apiConfigured) {
        connectionStatus.className = 'status-indicator status-online';
    } else {
        connectionStatus.className = 'status-indicator status-offline';
    }
    
    Utils.log('评估API状态检查完成', { configured: apiConfigured });
}

// 加载现有评估结果
function loadExistingAssessmentResult() {
    const existingResult = StorageManager.load('assessment_result');
    if (existingResult) {
        assessmentData = { ...existingResult.assessment_data };
        updateAssessmentResultDisplay();
        Utils.log('已加载现有评估结果', existingResult);
    }
}

// 加载评估历史
function loadAssessmentHistory() {
    Utils.log('加载评估历史');
    
    const historyContainer = document.getElementById('assessment-history-list');
    const assessmentHistory = ChatHistoryManager.getChatHistory('assessment');
    
    if (assessmentHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="text-center" style="color: #666; padding: 20px;">
                <p>暂无评估历史</p>
                <p style="font-size: 14px;">完成评估后，这里将显示历史记录</p>
            </div>
        `;
        return;
    }
    
    // 按评估ID分组
    const groupedHistory = {};
    assessmentHistory.forEach(record => {
        if (!groupedHistory[record.assessment_id]) {
            groupedHistory[record.assessment_id] = [];
        }
        groupedHistory[record.assessment_id].push(record);
    });
    
    historyContainer.innerHTML = Object.keys(groupedHistory).map(assessmentId => {
        const records = groupedHistory[assessmentId];
        const firstRecord = records[0];
        const lastRecord = records[records.length - 1];
        
        return `
            <div class="assessment-history-item" onclick="loadAssessmentById('${assessmentId}')">
                <div class="history-header">
                    <strong>评估 ${assessmentId.substring(0, 8)}...</strong>
                    <span>${Utils.formatTimestamp(firstRecord.timestamp)}</span>
                </div>
                <div class="history-summary">
                    对话轮数: ${records.length} | 
                    最后更新: ${Utils.formatTimestamp(lastRecord.timestamp)}
                </div>
            </div>
        `;
    }).join('');
    
    Utils.log('评估历史加载完成', { count: assessmentHistory.length });
}

// 根据ID加载评估对话
function loadAssessmentById(assessmentId) {
    Utils.log('加载指定评估对话', { assessmentId });
    
    const assessmentHistory = ChatHistoryManager.getChatHistory('assessment');
    
    // 获取指定评估ID的所有记录
    const records = assessmentHistory.filter(record => record.assessment_id === assessmentId);
    
    if (records.length === 0) {
        Utils.log('评估对话不存在', { assessmentId });
        return;
    }
    
    // 设置当前评估ID
    currentAssessmentId = assessmentId;
    assessmentStartTime = records[0].timestamp;
    conversationRounds = records.length;
    
    // 清空对话区域
    const chatMessages = document.getElementById('assessment-chat-messages');
    chatMessages.innerHTML = '';
    
    // 添加历史对话记录
    records.forEach(record => {
        // 添加用户消息
        chatMessages.innerHTML += `
            <div class="message user">
                <div class="message-header">
                    <strong>👤 您</strong>
                    <span class="message-time">${Utils.formatTimestamp(record.timestamp)}</span>
                </div>
                <div class="message-content">${record.user_message}</div>
            </div>
        `;
        
        // 添加AI回复
        chatMessages.innerHTML += `
            <div class="message ai">
                <div class="message-header">
                    <strong>🤖 评估助手</strong>
                    <span class="message-time">${Utils.formatTimestamp(record.timestamp)}</span>
                </div>
                <div class="message-content">${record.ai_response}</div>
            </div>
        `;
    });
    
    // 滚动到底部
    scrollAssessmentToBottom();
    
    // 加载评估结果
    const assessmentResult = StorageManager.load('assessment_result', null);
    if (assessmentResult && assessmentResult.id === assessmentId) {
        assessmentData = { ...assessmentResult.assessment_data };
        updateAssessmentResultDisplay();
    }
    
    // 更新状态
    updateAssessmentStatus();
    scrollAssessmentToBottom();
    
    Utils.log('评估对话加载完成', { assessmentId, recordCount: records.length });
}

// 导出评估报告
function exportAssessmentResult() {
    const result = StorageManager.load('assessment_result');
    if (!result) {
        alert('暂无评估结果可以导出，请先完成评估。');
        return;
    }
    
    let reportContent = `校园AI助手 - 能力评估报告\n`;
    reportContent += `${'='.repeat(40)}\n\n`;
    reportContent += `评估ID: ${result.id}\n`;
    reportContent += `评估时间: ${Utils.formatTimestamp(result.timestamp)}\n`;
    reportContent += `对话轮数: ${result.conversation_rounds}\n\n`;
    
    reportContent += `能力评分:\n`;
    reportContent += `- 认知能力: ${result.assessment_data.cognitive_ability}/10\n`;
    reportContent += `- 学习能力: ${result.assessment_data.learning_ability}/10\n`;
    reportContent += `- 创新能力: ${result.assessment_data.innovation_ability}/10\n`;
    reportContent += `- 社交能力: ${result.assessment_data.social_ability}/10\n\n`;
    
    if (result.assessment_data.technical_skills.length > 0) {
        reportContent += `技术技能: ${result.assessment_data.technical_skills.join(', ')}\n\n`;
    }
    
    if (result.assessment_data.interests.length > 0) {
        reportContent += `兴趣领域: ${result.assessment_data.interests.join(', ')}\n\n`;
    }
    
    if (result.assessment_data.strengths.length > 0) {
        reportContent += `优势特长:\n${result.assessment_data.strengths.map(s => `- ${s}`).join('\n')}\n\n`;
    }
    
    // 创建下载链接
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment_report_${result.id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    Utils.log('评估报告已导出', { assessmentId: result.id });
}

// 清空评估历史
function clearAssessmentHistory() {
    if (confirm('确定要清空所有评估历史吗？此操作不可恢复。')) {
        // 使用ChatHistoryManager清空评估历史
        const assessmentHistory = ChatHistoryManager.getChatHistory('assessment');
        if (assessmentHistory.length > 0) {
            ChatHistoryManager.clearHistory('assessment');
            loadAssessmentHistory();
            Utils.log('评估历史已清空');
        }
    }
}

// 导出函数供HTML调用
window.startNewAssessment = startNewAssessment;
window.sendAssessmentMessage = sendAssessmentMessage;
window.exportAssessmentResult = exportAssessmentResult;
window.loadAssessmentHistory = loadAssessmentHistory;
window.clearAssessmentHistory = clearAssessmentHistory;
window.loadAssessmentById = loadAssessmentById;

