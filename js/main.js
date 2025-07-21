// 校园AI助手 - 主页JavaScript逻辑

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('主页初始化开始');
    
    // 检查系统状态
    checkSystemStatus();
    
    // 检查用户是否有历史数据
    checkUserHistory();
    
    // 初始化页面交互
    initializePageInteractions();
    
    Utils.log('主页初始化完成');
});

// 检查系统状态
function checkSystemStatus() {
    Utils.log('检查系统状态');
    
    // 检查API配置
    const apiConfigured = API_CONFIG.BASE_URL !== 'YOUR_STAR_AGENT_API_ENDPOINT';
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = statusIndicator.parentElement;
    
    if (apiConfigured) {
        statusIndicator.className = 'status-indicator status-online';
        statusText.innerHTML = '<span class="status-indicator status-online"></span>系统运行正常，AI服务已就绪';
        statusText.className = 'alert alert-success';
    } else {
        statusIndicator.className = 'status-indicator status-offline';
        statusText.innerHTML = '<span class="status-indicator status-offline"></span>请先配置API设置（查看js/config.js文件）';
        statusText.className = 'alert alert-warning';
    }
    
    Utils.log('系统状态检查完成', { apiConfigured });
}

// 检查用户历史数据
function checkUserHistory() {
    Utils.log('检查用户历史数据');
    
    // 检查是否有能力评估记录
    const assessmentData = StorageManager.load('assessment_result');
    const hasAssessment = assessmentData !== null;
    
    // 检查对话历史
    const chatHistory = ChatHistoryManager.getChatHistory();
    const hasChatHistory = chatHistory.length > 0;
    
    // 更新快速开始区域的建议
    updateQuickStartRecommendation(hasAssessment, hasChatHistory);
    
    Utils.log('用户历史数据检查完成', { 
        hasAssessment, 
        hasChatHistory, 
        chatCount: chatHistory.length 
    });
}

// 更新快速开始建议
function updateQuickStartRecommendation(hasAssessment, hasChatHistory) {
    const quickStartButton = document.querySelector('.main-content .btn[href="assessment.html"]');
    
    if (hasAssessment) {
        // 如果已有评估结果，建议进行目标规划
        quickStartButton.href = 'planning.html';
        quickStartButton.innerHTML = '开始目标规划 →';
        
        // 添加评估完成提示
        const quickStartSection = quickStartButton.closest('.main-content');
        const existingAlert = quickStartSection.querySelector('.assessment-complete-alert');
        
        if (!existingAlert) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success assessment-complete-alert';
            alertDiv.innerHTML = '✅ 您已完成能力评估，现在可以开始制定个性化的学习计划！';
            quickStartButton.parentElement.insertBefore(alertDiv, quickStartButton);
        }
    }
    
    if (hasChatHistory) {
        // 如果有对话历史，在某个地方显示
        Utils.log('用户有对话历史，可以考虑显示最近对话');
    }
}

// 初始化页面交互
function initializePageInteractions() {
    Utils.log('初始化页面交互');
    
    // 为所有功能卡片添加悬停效果增强
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
        });
    });
    
    // 为按钮添加点击反馈
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 添加点击动画效果
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // 记录用户行为
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                Utils.log('用户点击导航', { target: href });
            }
        });
    });
}

// 显示用户指南
function showUserGuide() {
    Utils.log('显示用户指南');
    
    const guideContent = `
        <div style="max-width: 600px; margin: 0 auto; text-align: left;">
            <h3>📖 校园AI助手使用指南</h3>
            
            <h4>🚀 快速开始</h4>
            <ol>
                <li><strong>能力评估：</strong>首次使用建议先进行能力评估，系统会通过对话了解您的技能水平</li>
                <li><strong>目标设定：</strong>基于评估结果，在目标规划页面设定您的学习目标</li>
                <li><strong>计划执行：</strong>按照AI生成的计划执行，并定期回顾调整</li>
            </ol>
            
            <h4>💡 功能说明</h4>
            <ul>
                <li><strong>AI对话：</strong>可以随时与AI助手交流，获得学习建议和答疑</li>
                <li><strong>能力评估：</strong>通过多轮对话量化分析您的能力特征</li>
                <li><strong>目标规划：</strong>制定个性化的学习计划和时间安排</li>
                <li><strong>人生预测：</strong>通过问卷分析预测发展轨迹</li>
                <li><strong>深度搜索：</strong>AI驱动的智能搜索，支持学术和普通搜索</li>
            </ul>
            
            <h4>⚙️ 系统配置</h4>
            <p>如需修改API配置，请编辑 <code>js/config.js</code> 文件中的相关设置。</p>
            
            <h4>🔧 技术支持</h4>
            <p>如遇到问题，请检查浏览器控制台的调试信息，或联系技术支持。</p>
            
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn" onclick="closeModal()">知道了</button>
            </div>
        </div>
    `;
    
    showModal('使用指南', guideContent);
}

// 显示调试信息
function showDebugInfo() {
    Utils.log('显示系统调试信息');
    
    const debugInfo = {
        系统版本: '1.0.0',
        API配置状态: API_CONFIG.BASE_URL !== 'YOUR_STAR_AGENT_API_ENDPOINT' ? '已配置' : '未配置',
        本地存储数据: {
            对话历史数量: ChatHistoryManager.getChatHistory().length,
            能力评估结果: StorageManager.load('assessment_result') ? '已完成' : '未完成',
            存储空间使用: `${JSON.stringify(localStorage).length} 字符`
        },
        浏览器信息: {
            用户代理: navigator.userAgent,
            语言: navigator.language,
            在线状态: navigator.onLine ? '在线' : '离线'
        }
    };
    
    const debugContent = `
        <div style="max-width: 600px; margin: 0 auto; text-align: left;">
            <h3>🔧 系统调试信息</h3>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 14px;">
${JSON.stringify(debugInfo, null, 2)}
            </pre>
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn btn-outline" onclick="clearAllData()">清空所有数据</button>
                <button class="btn" onclick="closeModal()">关闭</button>
            </div>
        </div>
    `;
    
    showModal('系统信息', debugContent);
}

// 清空所有数据
function clearAllData() {
    if (confirm('确定要清空所有本地数据吗？此操作不可恢复。')) {
        StorageManager.clear();
        Utils.log('所有本地数据已清空');
        alert('数据清空完成，页面将刷新。');
        location.reload();
    }
}

// 显示模态框
function showModal(title, content) {
    // 创建模态框HTML
    const modalHTML = `
        <div id="modal-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        ">
            <div style="
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 90%;
                max-height: 90%;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            ">
                <h2 style="margin-bottom: 20px; color: #333;">${title}</h2>
                ${content}
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 点击背景关闭
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        Utils.log('页面重新可见，检查状态');
        checkSystemStatus();
    }
});

// 错误处理
window.addEventListener('error', function(e) {
    Utils.log('页面发生错误', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    });
});

// 导出函数供HTML调用
window.showUserGuide = showUserGuide;
window.showDebugInfo = showDebugInfo;
window.clearAllData = clearAllData;
window.closeModal = closeModal;

