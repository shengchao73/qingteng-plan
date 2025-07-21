// 校园AI助手 - 配置文件和通用函数

// API配置 - 请根据实际情况修改
const API_CONFIG = {
    // 星辰Agent API基础配置 - 通过代理服务器访问
    BASE_URL: 'http://localhost:3000/api/workflow/v1/chat/completions',
    API_KEY: 'fc7ebf5ba413838a34d208a629df9044',
    API_SECRET: 'NTM3OTVjYmEwOGNhN2IyZDIwM2RiM2Fh',
    
    // 不同功能对应的工作流ID - 请根据实际情况修改
    WORKFLOW_IDS: {
        //CHAT: '7331658069197578242',           // AI对话工作流ID
        CHAT: '7329469816686604288',
        ASSESSMENT: '7348928390446309378',     // 能力评估工作流ID
        PLANNING: '7353002028256485378',       // 目标规划工作流ID
        PREDICTION: '7352741356879761410',     // 人生预测工作流ID
        SEARCH_GENERAL: '7349697257863024642', // 普通搜索工作流ID
        SEARCH_PAPER: '7353019293886603266'    // 论文搜索工作流ID
    }
};

// 调试配置
const DEBUG_CONFIG = {
    ENABLE_CONSOLE_LOG: true,  // 是否启用控制台日志
    ENABLE_API_LOG: true,      // 是否记录API请求日志
    ENABLE_STORAGE_LOG: true   // 是否记录本地存储日志
};

// 通用工具函数
const Utils = {
    // 调试日志函数
    log: function(message, data = null) {
        if (DEBUG_CONFIG.ENABLE_CONSOLE_LOG) {
            console.log(`[校园AI助手] ${message}`, data || '');
        }
    },

    // API请求日志
    logAPI: function(action, data) {
        if (DEBUG_CONFIG.ENABLE_API_LOG) {
            console.log(`[API ${action}]`, data);
        }
    },

    // 本地存储日志
    logStorage: function(action, key, data) {
        if (DEBUG_CONFIG.ENABLE_STORAGE_LOG) {
            console.log(`[LocalStorage ${action}] ${key}:`, data);
        }
    },

    // 格式化时间戳
    formatTimestamp: function(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    // 格式化日期时间
    formatDateTime: function(date, format = 'display') {
        if (!date) date = new Date();
        
        if (format === 'file') {
            return date.toISOString().replace(/[:.]/g, '-').slice(0, 19);
        }
        
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    // 简单的Markdown转HTML
    markdownToHtml: function(markdown) {
        if (!markdown) return '';
        
        let html = markdown
            // 标题
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            // 粗体
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 斜体
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 代码块
            .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
            // 行内代码
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // 标准Markdown图片语法
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />')
            // 直接的图片URL（识别以http开头且包含图片扩展名的URL）
            .replace(/(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|bmp|webp)(?:\?[^\s]*)?)/gi, '<img src="$1" alt="图片" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />')
            // 有序列表（数字+点）
            .replace(/^(\d+)\.\s+(.*$)/gm, '<div style="margin: 5px 0; padding-left: 20px;"><strong>$1.</strong> $2</div>')
            // 无序列表（- 或 *）
            .replace(/^[-*]\s+(.*$)/gm, '<div style="margin: 5px 0; padding-left: 20px;">• $1</div>')
            // 链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // 分割线
            .replace(/^---$/gm, '<hr>')
            // 换行
            .replace(/\n/g, '<br>');
        
        return html;
    },

    // 生成唯一ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 显示加载状态
    showLoading: function(element) {
        if (element) {
            element.innerHTML = '<span class="loading"></span> 处理中...';
            element.disabled = true;
        }
    },

    // 隐藏加载状态
    hideLoading: function(element, originalText = '发送') {
        if (element) {
            element.innerHTML = originalText;
            element.disabled = false;
        }
    },

    // 显示错误信息
    showError: function(container, message) {
        if (container) {
            container.innerHTML = `
                <div class="alert alert-error">
                    <strong>错误：</strong> ${message}
                </div>
            `;
        }
    },

    // 显示成功信息
    showSuccess: function(container, message) {
        if (container) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <strong>成功：</strong> ${message}
                </div>
            `;
        }
    },

    // 显示信息提示
    showInfo: function(container, message) {
        if (container) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <strong>提示：</strong> ${message}
                </div>
            `;
        }
    }
};

// 本地存储管理器
const StorageManager = {
    // 保存数据到LocalStorage
    save: function(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            Utils.logStorage('SAVE', key, data);
            return true;
        } catch (error) {
            Utils.log('保存数据到LocalStorage失败', error);
            return false;
        }
    },

    // 从LocalStorage读取数据
    load: function(key, defaultValue = null) {
        try {
            const jsonData = localStorage.getItem(key);
            if (jsonData === null) {
                Utils.logStorage('LOAD', key, '数据不存在，返回默认值');
                return defaultValue;
            }
            const data = JSON.parse(jsonData);
            Utils.logStorage('LOAD', key, data);
            return data;
        } catch (error) {
            Utils.log('从LocalStorage读取数据失败', error);
            return defaultValue;
        }
    },

    // 删除LocalStorage中的数据
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            Utils.logStorage('REMOVE', key, '数据已删除');
            return true;
        } catch (error) {
            Utils.log('删除LocalStorage数据失败', error);
            return false;
        }
    },

    // 清空所有数据
    clear: function() {
        try {
            localStorage.clear();
            Utils.logStorage('CLEAR', 'ALL', '所有数据已清空');
            return true;
        } catch (error) {
            Utils.log('清空LocalStorage失败', error);
            return false;
        }
    }
};

// API请求管理器
const APIManager = {
    // 发送API请求
    request: async function(flowId, userInput, history = [], options = {}) {
        // 确保history中的每个元素都有role和content字段
        const formattedHistory = history.map(item => {
            // 如果已经有role和content字段，直接返回
            if (item.role && item.content) {
                return item;
            }
            
            // 如果是简单的字符串，转换为带role的对象
            if (typeof item === 'string') {
                return {
                    role: 'user',
                    content: item
                };
            }
            
            // 如果是对象但缺少role或content字段
            const role = item.role || (item.user_message ? 'user' : 'assistant');
            let content = item.content || item.user_message || item.ai_response || '';
            
            // 移除HTML标签，避免API处理错误
            if (typeof content === 'string') {
                content = content.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');
            }
            
            return {
                role: role,
                content: content
            };
        });
        
        // 确保历史记录不为空
        if (formattedHistory.length === 0) {
            formattedHistory.push({
                role: 'assistant',
                content: '欢迎使用AI助手'
            });
        }
        
        const requestBody = {
            flow_id: flowId,
            uid: Utils.generateId(),
            parameters: {
                AGENT_USER_INPUT: userInput
            },
            ext: {
                bot_id: "workflow",
                caller: "workflow"
            },
            stream: true,
            chat_id: options.chatId || Utils.generateId(),
            history: formattedHistory
        };

        Utils.logAPI('REQUEST', requestBody);

        try {
            const response = await fetch(API_CONFIG.BASE_URL, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'Authorization': `Bearer ${API_CONFIG.API_KEY}:${API_CONFIG.API_SECRET}`,
                    ...options.headers
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }

            Utils.logAPI('RESPONSE_STATUS', `请求成功，状态码: ${response.status}`);
            return response;

        } catch (error) {
            Utils.logAPI('ERROR', error.message);
            throw error;
        }
    },

    // 处理流式响应
    handleStreamResponse: async function(response, onChunk, onComplete, onError) {
        try {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.trim() === '' || !line.startsWith('data: ')) continue;
                    
                    try {
                        const jsonStr = line.substring(6); // 移除 "data: " 前缀
                        if (jsonStr === '[DONE]') continue;
                        
                        const data = JSON.parse(jsonStr);
                        Utils.logAPI('STREAM_CHUNK', data);
                        
                        // 检查是否有错误
                        if (data.code && data.code !== 0) {
                            throw new Error(data.message || '未知API错误');
                        }
                        
                        if (data.choices && data.choices[0] && data.choices[0].delta) {
                            const content = data.choices[0].delta.content || '';
                            fullContent += content;
                            
                            if (onChunk) {
                                onChunk(content, fullContent);
                            }
                        }
                        
                        // 检查是否完成
                        if (data.choices && data.choices[0] && data.choices[0].finish_reason === 'stop') {
                            break;
                        }
                        
                    } catch (parseError) {
                        Utils.logAPI('PARSE_ERROR', parseError.message);
                        if (parseError.message.includes('字段')) {
                            // 这是API验证错误，需要抛出
                            throw parseError;
                        }
                    }
                }
            }

            Utils.logAPI('STREAM_COMPLETE', fullContent);
            
            if (onComplete) {
                onComplete(fullContent);
            }

            return fullContent;

        } catch (error) {
            Utils.logAPI('STREAM_ERROR', error.message);
            if (onError) {
                onError(error);
            }
            throw error;
        }
    },

    // 发送对话请求
    sendChatMessage: async function(message, history = [], workflowId = API_CONFIG.WORKFLOW_IDS.CHAT) {
        return await this.request(workflowId, message, history);
    },

    // 发送能力评估请求
    sendAssessmentMessage: async function(message, history = [], workflowId = API_CONFIG.WORKFLOW_IDS.ASSESSMENT) {
        return await this.request(workflowId, message, history);
    },

    // 发送目标规划请求
    sendPlanningRequest: async function(planningInput, history = [], workflowId = API_CONFIG.WORKFLOW_IDS.PLANNING) {
        return await this.request(workflowId, planningInput, history);
    },

    // 发送人生预测请求
    sendPredictionRequest: async function(questionAnswers, history = [], workflowId = API_CONFIG.WORKFLOW_IDS.PREDICTION) {
        return await this.request(workflowId, questionAnswers, history);
    },

    // 发送搜索请求
    sendSearchRequest: async function(query, searchMode = 'general', history = []) {
        const workflowId = searchMode === 'paper' 
            ? API_CONFIG.WORKFLOW_IDS.SEARCH_PAPER 
            : API_CONFIG.WORKFLOW_IDS.SEARCH_GENERAL;
        
        return await this.request(workflowId, query, history);
    }
};

// 对话历史管理器
const ChatHistoryManager = {
    // 保存对话记录
    saveChat: function(chatId, userMessage, aiResponse, metadata = {}) {
        const chatRecord = {
            id: chatId,
            user_message: userMessage,
            ai_response: aiResponse,
            timestamp: new Date().toISOString(),
            ...metadata
        };

        // 获取现有的对话历史
        const history = this.getChatHistory();
        history.push(chatRecord);

        // 保存更新后的历史
        StorageManager.save('chat_history', history);
        
        Utils.log('对话记录已保存', chatRecord);
        return chatRecord;
    },

    // 获取对话历史
    getChatHistory: function(chatType = 'default') {
        const key = chatType === 'default' ? 'chat_history' : `chat_history_${chatType}`;
        return StorageManager.load(key, []);
    },

    // 获取API格式的对话历史
    getAPIHistory: function(chatType = 'default') {
        const history = this.getChatHistory(chatType);
        const apiHistory = [];
        
        for (const chat of history) {
            // 添加用户消息
            if (chat.user_message) {
                apiHistory.push({
                    role: 'user',
                    content: chat.user_message
                });
            }
            
            // 添加AI回复
            if (chat.ai_response) {
                apiHistory.push({
                    role: 'assistant',
                    content: chat.ai_response
                });
            }
        }
        
        // 确保历史记录为空时返回至少一条默认消息，避免API错误
        if (apiHistory.length === 0) {
            apiHistory.push({
                role: 'assistant',
                content: '欢迎使用AI助手'
            });
        }
        
        return apiHistory;
    },

    // 保存特定类型的对话记录
    saveChatByType: function(chatType, userMessage, aiResponse, metadata = {}) {
        const chatRecord = {
            id: Utils.generateId(),
            user_message: userMessage,
            ai_response: aiResponse,
            timestamp: new Date().toISOString(),
            ...metadata
        };

        // 获取特定类型的对话历史
        const history = this.getChatHistory(chatType);
        history.push(chatRecord);

        // 保存更新后的历史
        const key = `chat_history_${chatType}`;
        StorageManager.save(key, history);
        
        Utils.log(`${chatType}对话记录已保存`, chatRecord);
        return chatRecord;
    },

    // 获取特定对话
    getChat: function(chatId) {
        const history = this.getChatHistory();
        return history.find(chat => chat.id === chatId);
    },

    // 删除对话记录
    deleteChat: function(chatId, chatType = 'default') {
        const history = this.getChatHistory(chatType);
        const filteredHistory = history.filter(chat => chat.id !== chatId);
        const key = chatType === 'default' ? 'chat_history' : `chat_history_${chatType}`;
        StorageManager.save(key, filteredHistory);
        Utils.log(`${chatType}对话记录已删除`, chatId);
    },

    // 清空所有对话历史
    clearHistory: function(chatType = 'default') {
        const key = chatType === 'default' ? 'chat_history' : `chat_history_${chatType}`;
        StorageManager.remove(key);
        Utils.log(`${chatType}对话历史已清空`);
    }
};

// 页面初始化时的通用设置
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('页面加载完成，开始初始化');
    
    // 设置当前页面的导航高亮
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    Utils.log('导航栏初始化完成');
});

// 导出配置和工具函数（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_CONFIG,
        DEBUG_CONFIG,
        Utils,
        StorageManager,
        APIManager,
        ChatHistoryManager
    };
}

