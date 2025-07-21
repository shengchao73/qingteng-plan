// 校园AI助手 - AI对话功能

// 全局变量
let currentChatId = null;
let messageCount = 0;
let isTyping = false;
let chatStartTime = null;

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('AI对话页面初始化开始');
    
    // 初始化页面
    initializeChatPage();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 加载对话历史
    loadChatHistory();
    
    // 检查API状态
    checkAPIStatus();
    
    // 设置欢迎消息时间
    document.getElementById('welcome-time').textContent = Utils.formatTimestamp(new Date().toISOString());
    
    Utils.log('AI对话页面初始化完成');
});

// 初始化对话页面
function initializeChatPage() {
    Utils.log('初始化对话页面');
    
    // 开始新对话
    startNewChat();
    
    // 更新状态显示
    updateChatStatus();
}

// 设置事件监听器
function setupEventListeners() {
    Utils.log('设置事件监听器');
    
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    // 输入框事件
    chatInput.addEventListener('input', function() {
        // 更新字符计数
        const counter = document.getElementById('input-counter');
        counter.textContent = `${this.value.length}/2000`;
        
        // 自动调整高度
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        
        // 启用/禁用发送按钮
        sendButton.disabled = this.value.trim().length === 0 || isTyping;
    });
    
    // 快捷键支持
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);
    
    Utils.log('事件监听器设置完成');
}

// 开始新对话
function startNewChat() {
    Utils.log('开始新对话');
    
    // 生成新的对话ID
    currentChatId = Utils.generateId();
    chatStartTime = new Date().toISOString();
    messageCount = 0;
    
    // 清空对话区域（保留欢迎消息）
    const chatMessages = document.getElementById('chat-messages');
    const welcomeMessage = chatMessages.querySelector('.message.ai');
    chatMessages.innerHTML = '';
    if (welcomeMessage) {
        chatMessages.appendChild(welcomeMessage);
    }
    
    // 更新状态
    updateChatStatus();
    
    // 清空输入框
    const chatInput = document.getElementById('chat-input');
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    Utils.log('新对话已开始', { chatId: currentChatId });
}

// 发送消息
async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message || isTyping) {
        Utils.log('消息为空或正在输入中，跳过发送');
        return;
    }
    
    Utils.log('发送消息', { message, chatId: currentChatId });
    
    // 添加用户消息到界面
    addMessageToChat('user', message);
    
    // 清空输入框
    chatInput.value = '';
    chatInput.style.height = 'auto';
    document.getElementById('input-counter').textContent = '0/2000';
    
    // 设置发送状态
    setTypingStatus(true);
    
    try {
        // 检查API配置
        if (!API_CONFIG.BASE_URL || API_CONFIG.BASE_URL.includes('YOUR_')) {
            throw new Error('API未配置，请先在js/config.js中设置正确的API端点和密钥');
        }
        
        // 获取聊天历史记录作为上下文
        const chatHistory = ChatHistoryManager.getChatHistory();
        
        // 获取当前对话的历史记录
        const currentChatHistory = chatHistory
            .filter(chat => chat.id === currentChatId)
            .slice(-5); // 只使用最近的3条记录作为上下文
        
        // 格式化历史记录为API所需格式
        const formattedHistory = [];
        
        // 如果是现有对话，添加历史记录
        if (currentChatHistory.length > 0) {
            currentChatHistory.forEach(chat => {
                if (chat.user_message) {
                    formattedHistory.push({
                        role: 'user',
                        content: chat.user_message
                    });
                }
                if (chat.ai_response) {
                    formattedHistory.push({
                        role: 'assistant',
                        content: chat.ai_response
                    });
                }
            });
        }
        
        // 发送API请求，传递历史记录
        const response = await APIManager.sendChatMessage(message, formattedHistory);
        
        // 处理流式响应
        await handleStreamResponse(response, message);
        
    } catch (error) {
        Utils.log('发送消息失败', error);
        handleSendError(error, message);
    } finally {
        setTypingStatus(false);
    }
}

// 处理流式响应
async function handleStreamResponse(response, userMessage) {
    Utils.log('开始处理流式响应');
    
    // 创建AI消息容器
    const aiMessageElement = addMessageToChat('ai', '');
    const contentElement = aiMessageElement.querySelector('.message-content');
    
    let fullResponse = '';
    
    try {
        await APIManager.handleStreamResponse(
            response,
            // onChunk - 处理每个数据块
            (chunk, accumulated) => {
                // 这里可以根据实际API返回格式进行解析
                // 假设返回的是纯文本流
                contentElement.innerHTML = accumulated;
                scrollToBottom();
            },
            // onComplete - 流式响应完成
            (finalResponse) => {
                fullResponse = finalResponse;
                Utils.log('流式响应完成', { response: finalResponse });
                
                // 保存完整对话到历史
                saveChatToHistory(userMessage, finalResponse);
                
                // 更新状态
                updateChatStatus();
            },
            // onError - 处理错误
            (error) => {
                Utils.log('流式响应错误', error);
                contentElement.innerHTML = `<span style="color: #f44336;">抱歉，处理您的消息时出现了错误：${error.message}</span>`;
            }
        );
        
    } catch (error) {
        Utils.log('处理流式响应失败', error);
        contentElement.innerHTML = `<span style="color: #f44336;">抱歉，处理您的消息时出现了错误：${error.message}</span>`;
    }
}

// 处理发送错误
function handleSendError(error, userMessage) {
    Utils.log('处理发送错误', error);
    
    let errorMessage = '抱歉，发送消息时出现了错误。';
    
    if (error.message.includes('API未配置')) {
        errorMessage = '⚠️ API未配置，这是演示模式。请在 js/config.js 中配置正确的API设置。';
        
        // 演示模式：模拟AI回复
        setTimeout(() => {
            const demoResponse = generateDemoResponse(userMessage);
            const aiMessageElement = addMessageToChat('ai', demoResponse);
            saveChatToHistory(userMessage, demoResponse);
            updateChatStatus();
        }, 1000);
        
    } else if (error.message.includes('网络')) {
        errorMessage = '网络连接出现问题，请检查网络连接后重试。';
    } else {
        errorMessage = `发送失败：${error.message}`;
    }
    
    // 显示错误消息
    addMessageToChat('ai', `<span style="color: #f44336;">${errorMessage}</span>`);
}

// 生成演示回复（当API未配置时）
function generateDemoResponse(userMessage) {
    const demoResponses = [
        `感谢您的问题："${userMessage}"。这是演示模式的回复。在实际使用中，这里会显示来自星辰Agent工作流的智能回复。`,
        `您提到了"${userMessage}"，这是一个很好的问题！在配置了真实API后，我将能够为您提供更加个性化和专业的建议。`,
        `关于"${userMessage}"这个话题，我很乐意与您深入讨论。请注意，当前是演示模式，真实的AI回复需要配置星辰Agent API。`,
        `我理解您想了解"${userMessage}"相关的内容。在演示模式下，我只能提供模拟回复。配置API后，您将获得真正智能的对话体验。`
    ];
    
    return demoResponses[Math.floor(Math.random() * demoResponses.length)];
}

// 添加消息到对话界面
function addMessageToChat(sender, content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    
    const timestamp = Utils.formatTimestamp(new Date().toISOString());
    const senderName = sender === 'user' ? '👤 您' : '🤖 AI助手';
    
    messageElement.innerHTML = `
        <div class="message-header">
            <strong>${senderName}</strong>
            <span class="message-time">${timestamp}</span>
        </div>
        <div class="message-content">${content}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    scrollToBottom();
    
    // 更新消息计数
    if (sender === 'user') {
        messageCount++;
    }
    
    Utils.log('消息已添加到界面', { sender, content: content.substring(0, 100) });
    
    return messageElement;
}

// 滚动到底部
function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 设置输入状态
function setTypingStatus(typing) {
    isTyping = typing;
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const chatInput = document.getElementById('chat-input');
    
    if (typing) {
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
    sendButton.disabled = typing || chatInput.value.trim().length === 0;
}

// 保存对话到历史
function saveChatToHistory(userMessage, aiResponse) {
    const chatRecord = ChatHistoryManager.saveChat(
        currentChatId,
        userMessage,
        aiResponse,
        {
            chat_type: 'general',
            message_count: messageCount,
            start_time: chatStartTime
        }
    );
    
    Utils.log('对话已保存到历史', chatRecord);
    
    // 更新历史列表显示
    loadChatHistory();
}

// 加载对话历史
function loadChatHistory() {
    Utils.log('加载对话历史');
    
    const historyContainer = document.getElementById('chat-history-list');
    const chatHistory = ChatHistoryManager.getChatHistory();
    
    if (chatHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="text-center" style="color: #666; padding: 20px;">
                <p>暂无对话历史</p>
                <p style="font-size: 14px;">开始您的第一次对话吧！</p>
            </div>
        `;
        return;
    }
    
    // 按时间倒序排列
    const sortedHistory = chatHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    historyContainer.innerHTML = sortedHistory.map(chat => {
        const preview = chat.user_message.length > 30 
            ? chat.user_message.substring(0, 30) + '...' 
            : chat.user_message;
        
        return `
            <div class="chat-history-item" onclick="loadChatById('${chat.id}')">
                <div class="chat-preview">
                    <strong>${preview}</strong>
                </div>
                <div class="chat-meta">
                    <span>${Utils.formatTimestamp(chat.timestamp)}</span>
                    <button class="btn-small btn-outline" onclick="event.stopPropagation(); deleteChatById('${chat.id}')">
                        删除
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    Utils.log('对话历史加载完成', { count: chatHistory.length });
}

// 根据ID加载对话
function loadChatById(chatId) {
    Utils.log('加载指定对话', { chatId });
    
    const chat = ChatHistoryManager.getChat(chatId);
    if (!chat) {
        Utils.log('对话不存在', { chatId });
        return;
    }
    
    // 设置当前对话ID
    currentChatId = chatId;
    chatStartTime = chat.timestamp;
    
    // 清空对话区域并重新加载
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = `
        <div class="message ai">
            <div class="message-header">
                <strong>🤖 AI助手</strong>
                <span class="message-time">${Utils.formatTimestamp(chat.timestamp)}</span>
            </div>
            <div class="message-content">
                您好！我是校园AI助手，很高兴为您服务！🎓<br><br>
                我可以帮助您：<br>
                • 解答学习和生活中的问题<br>
                • 提供个性化的建议和指导<br>
                • 协助制定学习计划<br>
                • 分析和讨论各种话题<br><br>
                请随时告诉我您想了解什么，我会尽力为您提供帮助！
            </div>
        </div>
        <div class="message user">
            <div class="message-header">
                <strong>👤 您</strong>
                <span class="message-time">${Utils.formatTimestamp(chat.timestamp)}</span>
            </div>
            <div class="message-content">${chat.user_message}</div>
        </div>
        <div class="message ai">
            <div class="message-header">
                <strong>🤖 AI助手</strong>
                <span class="message-time">${Utils.formatTimestamp(chat.timestamp)}</span>
            </div>
            <div class="message-content">${chat.ai_response}</div>
        </div>
    `;
    
    messageCount = 1;
    updateChatStatus();
    scrollToBottom();
    
    Utils.log('对话加载完成', chat);
}

// 删除指定对话
function deleteChatById(chatId) {
    if (confirm('确定要删除这个对话吗？')) {
        ChatHistoryManager.deleteChat(chatId);
        loadChatHistory();
        
        // 如果删除的是当前对话，开始新对话
        if (currentChatId === chatId) {
            startNewChat();
        }
        
        Utils.log('对话已删除', { chatId });
    }
}

// 清空所有对话
function clearAllChats() {
    if (confirm('确定要清空所有对话历史吗？此操作不可恢复。')) {
        ChatHistoryManager.clearHistory();
        loadChatHistory();
        startNewChat();
        Utils.log('所有对话历史已清空');
    }
}

// 发送快捷问题
function sendQuickQuestion(question) {
    const chatInput = document.getElementById('chat-input');
    chatInput.value = question;
    chatInput.focus();
    
    // 触发输入事件以更新计数器
    chatInput.dispatchEvent(new Event('input'));
    
    Utils.log('快捷问题已填入', { question });
}

// 导出当前对话
function exportCurrentChat() {
    if (!currentChatId) {
        alert('当前没有活跃的对话可以导出。');
        return;
    }
    
    const chatMessages = document.getElementById('chat-messages');
    const messages = chatMessages.querySelectorAll('.message');
    
    let exportContent = `校园AI助手对话记录\n`;
    exportContent += `对话ID: ${currentChatId}\n`;
    exportContent += `导出时间: ${Utils.formatTimestamp(new Date().toISOString())}\n`;
    exportContent += `消息数量: ${messages.length}\n`;
    exportContent += `\n${'='.repeat(50)}\n\n`;
    
    messages.forEach(message => {
        const sender = message.classList.contains('user') ? '用户' : 'AI助手';
        const time = message.querySelector('.message-time').textContent;
        const content = message.querySelector('.message-content').textContent;
        
        exportContent += `[${time}] ${sender}:\n${content}\n\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${currentChatId}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    Utils.log('对话已导出', { chatId: currentChatId });
}

// 更新对话状态
function updateChatStatus() {
    document.getElementById('current-chat-id').textContent = currentChatId || '未开始';
    document.getElementById('message-count').textContent = messageCount;
    document.getElementById('chat-start-time').textContent = 
        chatStartTime ? Utils.formatTimestamp(chatStartTime) : '-';
}

// 检查API状态
function checkAPIStatus() {
    const apiConfigured = API_CONFIG.BASE_URL && !API_CONFIG.BASE_URL.includes('YOUR_');
    const statusElement = document.getElementById('api-status');
    const connectionStatus = document.getElementById('connection-status');
    
    if (apiConfigured) {
        statusElement.innerHTML = '<span class="status-indicator status-online"></span>已连接';
        connectionStatus.className = 'status-indicator status-online';
    } else {
        statusElement.innerHTML = '<span class="status-indicator status-offline"></span>演示模式';
        connectionStatus.className = 'status-indicator status-offline';
    }
    
    Utils.log('API状态检查完成', { configured: apiConfigured });
}

// 导出函数供HTML调用
window.startNewChat = startNewChat;
window.sendMessage = sendMessage;
window.sendQuickQuestion = sendQuickQuestion;
window.clearAllChats = clearAllChats;
window.exportCurrentChat = exportCurrentChat;
window.loadChatById = loadChatById;
window.deleteChatById = deleteChatById;

