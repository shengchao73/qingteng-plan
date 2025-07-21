// 校园AI助手 - 深度搜索功能

// 全局变量
let currentSearchMode = 'general';
let searchHistory = [];
let currentSearchResult = null;

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('深度搜索页面初始化开始');
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载搜索历史
    loadSearchHistory();
    
    // 初始化搜索模式
    updateSearchMode();
    
    Utils.log('深度搜索页面初始化完成');
});

// 绑定事件监听器
function bindEventListeners() {
    Utils.log('绑定事件监听器');
    
    // 搜索模式切换
    const modeRadios = document.querySelectorAll('input[name="searchMode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentSearchMode = this.value;
            updateSearchMode();
        });
    });
    
    // 搜索按钮
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // 搜索输入框回车事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                performSearch();
            }
        });
        
        // 字符计数
        searchInput.addEventListener('input', updateCharCount);
    }
    
    // 清空搜索按钮
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }
    
    // 快捷搜索按钮
    const quickSearchBtns = document.querySelectorAll('.quick-search-btn');
    quickSearchBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const query = this.getAttribute('data-query');
            document.getElementById('searchInput').value = query;
            updateCharCount();
            performSearch();
        });
    });
    
    // 导出Markdown按钮
    const exportMarkdownBtn = document.getElementById('exportMarkdownBtn');
    if (exportMarkdownBtn) {
        exportMarkdownBtn.addEventListener('click', exportMarkdown);
    }
    
    // 新搜索按钮
    const newSearchBtn = document.getElementById('newSearchBtn');
    if (newSearchBtn) {
        newSearchBtn.addEventListener('click', newSearch);
    }
    
    // 历史管理按钮
    const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    if (refreshHistoryBtn) refreshHistoryBtn.addEventListener('click', loadSearchHistory);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearSearchHistory);
}

// 更新搜索模式
function updateSearchMode() {
    const titleElement = document.getElementById('searchTitle');
    const descElement = document.getElementById('searchDescription');
    const inputElement = document.getElementById('searchInput');
    
    if (currentSearchMode === 'paper') {
        titleElement.textContent = '📚 学术论文搜索';
        descElement.textContent = '专门用于学术研究、论文查找、专业文献检索';
        inputElement.placeholder = '请输入学术关键词、研究主题或论文标题...';
    } else {
        titleElement.textContent = '🔍 普通AI搜索';
        descElement.textContent = '输入您想要搜索的内容，AI将为您提供精准的答案';
        inputElement.placeholder = '请输入您想要搜索的问题或关键词...';
    }
    
    Utils.log('搜索模式已切换为:', currentSearchMode);
}

// 更新字符计数
function updateCharCount() {
    const input = document.getElementById('searchInput');
    const charCount = document.getElementById('charCount');
    
    const currentLength = input.value.length;
    charCount.textContent = currentLength;
    
    // 字符数超限提示
    if (currentLength > 1000) {
        charCount.style.color = '#e74c3c';
    } else if (currentLength > 800) {
        charCount.style.color = '#f39c12';
    } else {
        charCount.style.color = '#7f8c8d';
    }
}

// 执行搜索
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (!query) {
        Utils.showError(searchInput.parentElement, '请输入搜索内容');
        return;
    }
    
    if (query.length > 1000) {
        Utils.showError(searchInput.parentElement, '搜索内容不能超过1000个字符');
        return;
    }
    
    Utils.log('开始搜索', { query, mode: currentSearchMode });
    
    // 显示加载状态
    const searchBtn = document.getElementById('searchBtn');
    const originalText = searchBtn.textContent;
    searchBtn.textContent = '🔍 搜索中...';
    searchBtn.disabled = true;
    
    try {
        // 发送搜索请求
        await sendSearchRequest(query, currentSearchMode);
        
    } catch (error) {
        Utils.log('搜索失败', error);
        Utils.showError(document.getElementById('resultsContent'), '搜索失败：' + error.message);
    } finally {
        // 恢复按钮状态
        searchBtn.textContent = originalText;
        searchBtn.disabled = false;
    }
}

// 发送搜索请求
async function sendSearchRequest(query, searchMode) {
    Utils.log('发送搜索API请求');
    
    // 检查API配置
    const workflowId = searchMode === 'paper' 
        ? API_CONFIG.WORKFLOW_IDS.SEARCH_PAPER 
        : API_CONFIG.WORKFLOW_IDS.SEARCH_GENERAL;
    
    if (!API_CONFIG.BASE_URL || API_CONFIG.BASE_URL.includes('YOUR_') || !workflowId) {
        // 演示模式
        Utils.log('API未配置，使用演示模式');
        await simulateSearchResponse(query, searchMode);
        return;
    }
    
    try {
        // 构建搜索输入
        const searchInput = `搜索模式：${searchMode === 'paper' ? '学术论文搜索' : '普通AI搜索'}\n搜索内容：${query}`;
        
        // 获取搜索历史并格式化为API所需的格式
        const history = searchHistory.slice(0, 3).map(item => {
            return {
                role: 'user',
                content: item.query || ''
            };
        }); // 只使用最近3次搜索作为上下文
        
        // 发送API请求
        const response = await APIManager.sendSearchRequest(searchInput, searchMode, history);
        
        // 处理流式响应
        await APIManager.handleStreamResponse(
            response,
            (chunk, fullContent) => {
                displaySearchResults(fullContent, false);
                // 自动滚动到最新内容
                autoScrollToLatest();
            },
            (fullContent) => {
                displaySearchResults(fullContent, true);
                saveSearchResult(query, searchMode, fullContent);
            },
            (error) => {
                throw error;
            }
        );
        
    } catch (error) {
        Utils.log('API请求失败，使用演示模式', error);
        await simulateSearchResponse(query, searchMode);
    }
}

// 模拟搜索响应
async function simulateSearchResponse(query, searchMode) {
    Utils.log('使用演示模式生成搜索结果');
    
    const demoResponse = searchMode === 'paper' 
        ? generatePaperSearchDemo(query)
        : generateGeneralSearchDemo(query);
    
    // 模拟流式输出
    const chunks = demoResponse.split('');
    const resultDiv = document.getElementById('searchResults');
    resultDiv.style.display = 'block';
    
    let currentContent = '';
    for (let i = 0; i < chunks.length; i++) {
        currentContent += chunks[i];
        displaySearchResults(currentContent, false);
        // 自动滚动到最新内容
        autoScrollToLatest();
        await new Promise(resolve => setTimeout(resolve, 15));
    }
    
    displaySearchResults(demoResponse, true);
    saveSearchResult(query, searchMode, demoResponse);
}

// 生成普通搜索演示结果
function generateGeneralSearchDemo(query) {
    return `# 🔍 搜索结果：${query}

## 📋 核心信息

基于您的搜索查询"${query}"，我为您整理了以下相关信息：

### 🎯 主要内容

**定义和概念**：
${query}是一个重要的概念/技能/主题，在现代学习和工作中具有重要意义。它涉及多个方面的知识和技能，需要系统性的学习和实践。

**核心要点**：
1. **基础理解**：首先需要掌握基本概念和原理
2. **实践应用**：通过实际操作加深理解
3. **持续改进**：在实践中不断优化和提升
4. **系统整合**：将所学知识整合到完整的知识体系中

### 📚 学习资源推荐

**在线课程**：
- 推荐相关的MOOC平台课程
- 专业培训机构的系统课程
- 知名大学的公开课程

**参考书籍**：
- 《相关领域经典教材》
- 《实用指南和手册》
- 《最新研究和发展趋势》

**实践平台**：
- 在线练习和实验平台
- 开源项目和社区
- 专业工具和软件

### 🛠️ 实用方法

**学习策略**：
1. **循序渐进**：从基础开始，逐步深入
2. **理论结合实践**：边学边做，加深理解
3. **多元化学习**：结合多种学习方式和资源
4. **定期复习**：巩固已学知识，避免遗忘

**常见问题解答**：
- **Q**: 初学者应该从哪里开始？
- **A**: 建议先掌握基础概念，然后通过简单的实践项目开始

- **Q**: 如何提高学习效率？
- **A**: 制定明确的学习计划，设定阶段性目标，定期评估进展

### 🌟 进阶发展

**职业发展方向**：
- 专业技术路线
- 管理和领导路线
- 教育和培训路线
- 创新和研究路线

**技能提升建议**：
- 持续关注行业发展趋势
- 参与专业社区和交流活动
- 寻找导师和学习伙伴
- 定期更新知识和技能

### 📊 相关统计

根据相关调查和研究：
- 掌握此技能的人群中，85%认为对职业发展有帮助
- 系统学习后，平均能力提升幅度为40-60%
- 持续实践3-6个月后，大多数人能达到熟练水平

---

*注意：这是演示模式生成的搜索结果，实际使用时将调用真实的AI工作流API获取更准确和实时的信息。*`;
}

// 生成学术搜索演示结果
function generatePaperSearchDemo(query) {
    return `# 📚 学术搜索结果：${query}

## 🔬 研究概览

针对您的学术查询"${query}"，我为您整理了相关的研究文献和学术资源：

### 📄 重要文献

**核心论文**：
1. **"${query}的理论基础与实践应用"** (2023)
   - 作者：张三, 李四, 王五
   - 期刊：《学术研究杂志》
   - 影响因子：3.2
   - 摘要：本研究探讨了${query}的核心理论框架...

2. **"${query}领域的最新发展趋势"** (2022)
   - 作者：Smith, J., Johnson, M.
   - 期刊：Journal of Academic Research
   - 影响因子：4.1
   - 摘要：通过大规模数据分析，本文揭示了...

3. **"${query}的跨学科研究方法"** (2022)
   - 作者：田中太郎, 佐藤花子
   - 会议：国际学术会议论文集
   - 引用次数：156
   - 摘要：本文提出了一种新的跨学科研究方法...

### 🏛️ 权威机构研究

**研究机构**：
- 中科院相关研究所
- 清华大学相关实验室
- MIT相关研究中心
- 牛津大学相关学院

**重点项目**：
- 国家自然科学基金重点项目
- 教育部重点实验室项目
- 国际合作研究项目

### 📊 研究数据

**发表趋势**：
- 近5年相关论文发表数量呈上升趋势
- 2023年发表论文数量比2019年增长了45%
- 国际合作论文占比约30%

**研究热点**：
1. 理论模型构建与验证
2. 实际应用案例研究
3. 跨学科融合研究
4. 技术创新与突破

### 🔍 研究方法

**主要研究方法**：
- 定量分析方法
- 定性研究方法
- 混合研究方法
- 实验研究设计
- 案例研究分析

**数据收集方式**：
- 问卷调查
- 深度访谈
- 观察研究
- 文献分析
- 大数据挖掘

### 📈 未来研究方向

**新兴趋势**：
1. **人工智能结合**：将AI技术应用到${query}研究中
2. **大数据分析**：利用大数据揭示新的研究模式
3. **跨文化研究**：探索不同文化背景下的差异
4. **可持续发展**：关注长期影响和可持续性

**研究空白**：
- 某些特定场景下的应用研究较少
- 长期跟踪研究数据不足
- 跨学科理论整合有待加强

### 📚 推荐阅读

**经典教材**：
- 《${query}理论与实践》
- 《${query}研究方法论》
- 《${query}前沿发展》

**重要综述**：
- "${query}研究现状与展望" (Annual Review, 2023)
- "${query}的理论演进" (学术综述, 2022)

**会议论文集**：
- 国际${query}学术会议论文集 (2023)
- 亚洲${query}研究会议论文集 (2022)

### 🔗 学术资源

**数据库推荐**：
- Web of Science
- CNKI中国知网
- IEEE Xplore
- SpringerLink
- ScienceDirect

**搜索建议**：
- 使用多个关键词组合搜索
- 关注高影响因子期刊
- 查看引用关系和共引分析
- 关注最新发表的论文

---

*注意：这是演示模式生成的学术搜索结果，实际使用时将调用真实的AI工作流API获取更准确的学术信息和文献数据。*`;
}

// 自动滚动到最新内容
function autoScrollToLatest() {
    const resultDiv = document.getElementById('searchResults');
    const contentDiv = document.getElementById('resultsContent');
    
    // 滚动到内容区域底部，显示最新内容
    if (contentDiv) {
        contentDiv.scrollTop = contentDiv.scrollHeight;
    }
    
    // 确保结果区域在视口中
    if (resultDiv) {
        const rect = resultDiv.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isVisible) {
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// 显示搜索结果
function displaySearchResults(content, isComplete) {
    const resultDiv = document.getElementById('searchResults');
    const contentDiv = document.getElementById('resultsContent');
    const descElement = document.getElementById('searchResultsDescription');
    
    resultDiv.style.display = 'block';
    
    // 更新描述
    if (currentSearchMode === 'paper') {
        descElement.textContent = 'AI为您找到的学术文献和研究资料';
    } else {
        descElement.textContent = 'AI为您找到的相关信息和解答';
    }
    
    // 将Markdown转换为HTML显示
    const htmlContent = Utils.markdownToHtml(content);
    contentDiv.innerHTML = htmlContent;
    
    if (isComplete) {
        Utils.log('搜索完成');
        // 移除搜索成功提示
        // Utils.showSuccess(contentDiv, '搜索完成！');
        
        // 完成时滚动到结果区域顶部
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

// 保存搜索结果
function saveSearchResult(query, searchMode, result) {
    const searchData = {
        id: Utils.generateId(),
        query: query,
        searchMode: searchMode,
        result: result,
        timestamp: new Date().toISOString(),
        createdTime: Utils.formatDateTime(new Date()),
        // 添加role字段，确保API请求时能正确格式化
        role: 'user',
        content: query
    };
    
    currentSearchResult = searchData;
    
    // 保存到历史记录
    searchHistory.unshift(searchData);
    
    // 限制历史记录数量
    if (searchHistory.length > 50) {
        searchHistory = searchHistory.slice(0, 50);
    }
    
    StorageManager.save('search_history', searchHistory);
    
    // 更新历史显示
    loadSearchHistory();
    
    Utils.log('搜索结果已保存', searchData);
}

// 导出Markdown格式
function exportMarkdown() {
    if (!currentSearchResult) {
        Utils.showError(document.getElementById('resultsContent'), '没有可导出的搜索结果');
        return;
    }
    
    // 准备Markdown内容
    let markdownContent = `# 搜索结果：${currentSearchResult.query}\n\n`;
    markdownContent += `**搜索模式：** ${currentSearchResult.searchMode === 'paper' ? '学术论文搜索' : '普通AI搜索'}\n`;
    markdownContent += `**搜索时间：** ${currentSearchResult.createdTime}\n\n`;
    markdownContent += `---\n\n`;
    markdownContent += currentSearchResult.result;
    
    // 创建下载链接
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `搜索结果_${currentSearchResult.query.replace(/[<>:"/\\|?*]/g, '_')}_${Utils.formatDateTime(new Date(), 'file')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    Utils.log('Markdown格式搜索结果已导出');
    Utils.showSuccess(document.getElementById('resultsContent'), 'Markdown文件已导出到下载文件夹');
}

// 导出搜索结果 (保留原有JSON导出功能)
function exportResults() {
    if (!currentSearchResult) {
        Utils.showError(document.getElementById('resultsContent'), '没有可导出的搜索结果');
        return;
    }
    
    const exportData = {
        title: `搜索结果 - ${currentSearchResult.query}`,
        searchMode: currentSearchResult.searchMode,
        query: currentSearchResult.query,
        createdTime: currentSearchResult.createdTime,
        content: currentSearchResult.result
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `搜索结果_${currentSearchResult.query}_${Utils.formatDateTime(new Date(), 'file')}.json`;
    link.click();
    
    Utils.log('搜索结果已导出');
    Utils.showSuccess(document.getElementById('resultsContent'), '搜索结果已导出到下载文件夹');
}

// 新搜索
function newSearch() {
    // 清空输入框
    document.getElementById('searchInput').value = '';
    updateCharCount();
    
    // 保持结果显示，不隐藏
    // document.getElementById('searchResults').style.display = 'none'; // 移除这行
    
    // 聚焦到输入框
    document.getElementById('searchInput').focus();
    
    Utils.log('开始新搜索');
}

// 清空搜索
function clearSearch() {
    document.getElementById('searchInput').value = '';
    updateCharCount();
    document.getElementById('searchInput').focus();
}

// 加载搜索历史
function loadSearchHistory() {
    Utils.log('加载搜索历史');
    
    searchHistory = StorageManager.load('search_history', []);
    const historyDiv = document.getElementById('searchHistory');
    
    if (searchHistory.length === 0) {
        historyDiv.innerHTML = `
            <div class="empty-state">
                <p>📝 暂无搜索历史</p>
                <p>开始第一次搜索后，这里将显示历史记录</p>
            </div>
        `;
        return;
    }
    
    const historyHtml = searchHistory.map(search => `
        <div class="search-history-item" data-search-id="${search.id}">
            <div class="history-header">
                <span class="history-title">
                    ${search.searchMode === 'paper' ? '📚 学术搜索' : '🔍 普通搜索'}
                </span>
                <span class="history-time">${search.createdTime}</span>
            </div>
            <div class="history-query">
                "${search.query}"
            </div>
            <div class="history-actions">
                <button class="btn btn-sm btn-primary" onclick="viewSearchResult('${search.id}')">
                    👁️ 查看
                </button>
                <button class="btn btn-sm btn-secondary" onclick="repeatSearch('${search.id}')">
                    🔄 重新搜索
                </button>
                <button class="btn btn-sm btn-secondary" onclick="copySearchResult('${search.id}')">
                    📋 复制
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSearchResult('${search.id}')">
                    🗑️ 删除
                </button>
            </div>
        </div>
    `).join('');
    
    historyDiv.innerHTML = historyHtml;
    
    Utils.log(`加载了 ${searchHistory.length} 条搜索历史`);
}

// 查看搜索结果
function viewSearchResult(searchId) {
    const search = searchHistory.find(s => s.id === searchId);
    if (!search) return;
    
    currentSearchResult = search;
    currentSearchMode = search.searchMode;
    
    // 更新模式选择
    document.querySelector(`input[value="${search.searchMode}"]`).checked = true;
    updateSearchMode();
    
    // 设置搜索输入框内容
    document.getElementById('searchInput').value = search.query;
    updateCharCount();
    
    // 显示结果
    displaySearchResults(search.result, true);
    
    Utils.log('查看历史搜索结果', searchId);
}

// 重复搜索
function repeatSearch(searchId) {
    const search = searchHistory.find(s => s.id === searchId);
    if (!search) return;
    
    // 设置搜索内容和模式
    document.getElementById('searchInput').value = search.query;
    document.querySelector(`input[value="${search.searchMode}"]`).checked = true;
    currentSearchMode = search.searchMode;
    
    updateSearchMode();
    updateCharCount();
    
    // 执行搜索
    performSearch();
    
    Utils.log('重复搜索', searchId);
}

// 复制搜索结果
function copySearchResult(searchId) {
    const search = searchHistory.find(s => s.id === searchId);
    if (!search) return;
    
    navigator.clipboard.writeText(search.result).then(() => {
        Utils.showSuccess(document.getElementById('searchHistory'), '搜索结果已复制到剪贴板');
    }).catch(() => {
        Utils.showError(document.getElementById('searchHistory'), '复制失败，请手动复制');
    });
    
    Utils.log('复制搜索结果', searchId);
}

// 删除搜索结果
function deleteSearchResult(searchId) {
    if (!confirm('确定要删除这个搜索记录吗？')) return;
    
    searchHistory = searchHistory.filter(s => s.id !== searchId);
    StorageManager.save('search_history', searchHistory);
    loadSearchHistory();
    
    Utils.log('删除搜索结果', searchId);
    Utils.showSuccess(document.getElementById('searchHistory'), '搜索记录已删除');
}

// 清空搜索历史
function clearSearchHistory() {
    if (!confirm('确定要清空所有搜索历史吗？此操作不可恢复。')) return;
    
    searchHistory = [];
    StorageManager.save('search_history', []);
    loadSearchHistory();
    
    Utils.log('清空搜索历史');
    Utils.showSuccess(document.getElementById('searchHistory'), '搜索历史已清空');
}

