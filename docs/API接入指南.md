# 星辰Agent API接入指南

本文档详细说明如何配置和使用星辰Agent工作流API。

## 📋 API基础信息

### 接口地址
```
https://xingchen-api.xf-yun.com/workflow/v1/chat/completions
```

### 认证方式
使用Bearer Token认证，格式为：`API_KEY:API_SECRET`

### 请求方式
- **方法**：POST
- **内容类型**：application/json
- **接受类型**：text/event-stream（流式响应）

## 🔧 配置步骤

### 1. 获取API凭证
从星辰Agent平台获取以下信息：
- **API Key**：用于身份验证的密钥
- **API Secret**：用于身份验证的密钥
- **工作流ID**：不同功能对应的工作流标识

### 2. 更新配置文件
编辑 `js/config.js` 文件：

```javascript
const API_CONFIG = {
    BASE_URL: 'https://xingchen-api.xf-yun.com/workflow/v1/chat/completions',
    API_KEY: 'your_api_key_here',
    API_SECRET: 'your_api_secret_here',
    WORKFLOW_IDS: {
        CHAT: 'your_chat_workflow_id',
        ASSESSMENT: 'your_assessment_workflow_id',
        PLANNING: 'your_planning_workflow_id',
        PREDICTION: 'your_prediction_workflow_id',
        SEARCH_GENERAL: 'your_general_search_workflow_id',
        SEARCH_PAPER: 'your_paper_search_workflow_id'
    }
};
```

### 3. 验证配置
打开浏览器开发者工具，查看控制台日志确认API配置正确。

## 📡 API请求格式

### 请求头
```javascript
{
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
    "Authorization": "Bearer API_KEY:API_SECRET"
}
```

### 请求体
```javascript
{
    "flow_id": "工作流ID",
    "uid": "用户唯一标识",
    "parameters": {
        "AGENT_USER_INPUT": "用户输入内容"
    },
    "ext": {
        "bot_id": "workflow",
        "caller": "workflow"
    },
    "stream": true,
    "chat_id": "对话会话ID",
    "history": []  // 历史对话记录
}
```

## 🔄 响应处理

### 流式响应格式
API返回Server-Sent Events (SSE)格式的流式数据：

```
data: {"choices":[{"delta":{"content":"响应内容片段"}}]}

data: {"choices":[{"delta":{"content":"更多内容"}}]}

data: {"choices":[{"finish_reason":"stop"}]}

data: [DONE]
```

### 响应解析代码
```javascript
async function handleStreamResponse(response, onChunk, onComplete, onError) {
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
                    const jsonStr = line.substring(6);
                    if (jsonStr === '[DONE]') continue;
                    
                    const data = JSON.parse(jsonStr);
                    
                    if (data.choices && data.choices[0] && data.choices[0].delta) {
                        const content = data.choices[0].delta.content || '';
                        fullContent += content;
                        
                        if (onChunk) {
                            onChunk(content, fullContent);
                        }
                    }
                    
                    if (data.choices && data.choices[0] && data.choices[0].finish_reason === 'stop') {
                        break;
                    }
                    
                } catch (parseError) {
                    console.error('解析响应失败:', parseError);
                }
            }
        }

        if (onComplete) {
            onComplete(fullContent);
        }

        return fullContent;

    } catch (error) {
        if (onError) {
            onError(error);
        }
        throw error;
    }
}
```

## 🎯 不同功能的API调用

### 1. AI对话功能
```javascript
async function sendChatMessage(message, history = []) {
    const response = await APIManager.request(
        API_CONFIG.WORKFLOW_IDS.CHAT,
        message,
        history
    );
    
    return APIManager.handleStreamResponse(
        response,
        (chunk, fullContent) => {
            // 处理流式内容
            displayMessage(fullContent);
        },
        (fullContent) => {
            // 处理完成
            saveMessage(message, fullContent);
        },
        (error) => {
            // 处理错误
            console.error('对话失败:', error);
        }
    );
}
```

### 2. 能力评估功能
```javascript
async function sendAssessmentMessage(message, history = []) {
    const response = await APIManager.request(
        API_CONFIG.WORKFLOW_IDS.ASSESSMENT,
        message,
        history
    );
    
    return APIManager.handleStreamResponse(
        response,
        (chunk, fullContent) => {
            // 显示评估对话
            displayAssessmentMessage(fullContent);
            
            // 提取存储变量
            extractStorageVariables(fullContent);
        },
        (fullContent) => {
            // 保存评估结果
            saveAssessmentResult(message, fullContent);
        },
        (error) => {
            console.error('评估失败:', error);
        }
    );
}
```

### 3. 目标规划功能
```javascript
async function sendPlanningRequest(planningInput, history = []) {
    // 构建包含评估结果的输入
    const assessmentData = StorageManager.load('assessment_result');
    const enhancedInput = `${planningInput}\n\n能力评估结果：${JSON.stringify(assessmentData)}`;
    
    const response = await APIManager.request(
        API_CONFIG.WORKFLOW_IDS.PLANNING,
        enhancedInput,
        history
    );
    
    return APIManager.handleStreamResponse(
        response,
        (chunk, fullContent) => {
            displayPlanningResult(fullContent);
        },
        (fullContent) => {
            savePlanningResult(planningInput, fullContent);
        },
        (error) => {
            console.error('规划生成失败:', error);
        }
    );
}
```

### 4. 人生预测功能
```javascript
async function sendPredictionRequest(questionAnswers, history = []) {
    // 将问答对转换为字符串
    const qaString = questionAnswers.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n');
    
    const response = await APIManager.request(
        API_CONFIG.WORKFLOW_IDS.PREDICTION,
        `请基于以下问卷回答进行人生发展预测分析：\n\n${qaString}`,
        history
    );
    
    return APIManager.handleStreamResponse(
        response,
        (chunk, fullContent) => {
            displayPredictionResult(fullContent);
        },
        (fullContent) => {
            savePredictionResult(questionAnswers, fullContent);
        },
        (error) => {
            console.error('预测生成失败:', error);
        }
    );
}
```

### 5. 深度搜索功能
```javascript
async function sendSearchRequest(query, searchMode = 'general', history = []) {
    const workflowId = searchMode === 'paper' 
        ? API_CONFIG.WORKFLOW_IDS.SEARCH_PAPER 
        : API_CONFIG.WORKFLOW_IDS.SEARCH_GENERAL;
    
    const searchInput = `搜索模式：${searchMode}\n搜索内容：${query}`;
    
    const response = await APIManager.request(workflowId, searchInput, history);
    
    return APIManager.handleStreamResponse(
        response,
        (chunk, fullContent) => {
            displaySearchResults(fullContent);
        },
        (fullContent) => {
            saveSearchResult(query, searchMode, fullContent);
        },
        (error) => {
            console.error('搜索失败:', error);
        }
    );
}
```

## ⚠️ 错误处理

### 常见错误类型

#### 1. 认证错误 (401)
```javascript
{
    "error": "Unauthorized",
    "message": "Invalid API key or secret"
}
```
**解决方案**：检查API_KEY和API_SECRET是否正确

#### 2. 工作流不存在 (404)
```javascript
{
    "error": "Not Found",
    "message": "Workflow not found"
}
```
**解决方案**：检查WORKFLOW_ID是否正确

#### 3. 请求格式错误 (400)
```javascript
{
    "error": "Bad Request",
    "message": "Invalid request format"
}
```
**解决方案**：检查请求体格式是否符合API规范

#### 4. 网络错误
```javascript
// JavaScript中的网络错误
TypeError: Failed to fetch
```
**解决方案**：
- 检查网络连接
- 确认CORS设置
- 验证API端点地址

### 错误处理代码
```javascript
async function handleAPIError(error, context) {
    console.error(`${context}失败:`, error);
    
    let errorMessage = '请求失败，请稍后重试';
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '网络连接失败，请检查网络设置';
    } else if (error.status === 401) {
        errorMessage = 'API认证失败，请检查密钥配置';
    } else if (error.status === 404) {
        errorMessage = '工作流不存在，请检查工作流ID';
    } else if (error.status === 400) {
        errorMessage = '请求格式错误，请检查输入内容';
    }
    
    // 显示错误信息给用户
    Utils.showError(document.getElementById('errorContainer'), errorMessage);
    
    // 记录详细错误日志
    Utils.log('API错误详情', {
        context: context,
        error: error,
        timestamp: new Date().toISOString()
    });
}
```

## 🔍 调试技巧

### 1. 开启详细日志
```javascript
const DEBUG_CONFIG = {
    ENABLE_LOGGING: true,
    LOG_LEVEL: 'DEBUG',
    LOG_API_REQUESTS: true,
    LOG_API_RESPONSES: true
};
```

### 2. 监控API请求
在浏览器开发者工具的Network标签中查看API请求详情。

### 3. 测试API连通性
```javascript
async function testAPIConnection() {
    try {
        const response = await fetch(API_CONFIG.BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.API_KEY}:${API_CONFIG.API_SECRET}`
            },
            body: JSON.stringify({
                flow_id: API_CONFIG.WORKFLOW_IDS.CHAT,
                uid: 'test_user',
                parameters: {
                    AGENT_USER_INPUT: '测试连接'
                },
                ext: {
                    bot_id: "workflow",
                    caller: "workflow"
                },
                stream: false
            })
        });
        
        console.log('API连接测试结果:', response.status);
        return response.ok;
    } catch (error) {
        console.error('API连接测试失败:', error);
        return false;
    }
}
```

## 📈 性能优化

### 1. 请求优化
- 合理设置请求超时时间
- 避免频繁的API调用
- 实现请求去重机制

### 2. 响应处理优化
- 使用流式处理减少内存占用
- 实现响应缓存机制
- 优化DOM更新频率

### 3. 错误重试机制
```javascript
async function retryAPIRequest(requestFn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            
            console.log(`请求失败，${delay}ms后重试 (${i + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // 指数退避
        }
    }
}
```

## 🔒 安全注意事项

### 1. API密钥保护
- 不要在客户端代码中硬编码API密钥
- 考虑使用环境变量或配置文件
- 定期轮换API密钥

### 2. 输入验证
- 对用户输入进行适当的验证和清理
- 防止注入攻击
- 限制输入长度和格式

### 3. 错误信息处理
- 不要向用户暴露敏感的错误信息
- 记录详细错误日志用于调试
- 提供用户友好的错误提示

## 📞 技术支持

如果在API接入过程中遇到问题，请：

1. 查看浏览器控制台的错误日志
2. 检查API配置是否正确
3. 参考本文档的错误处理部分
4. 联系星辰Agent技术支持团队

---

**祝您API接入顺利！** 🚀

