// 全局变量
let pyodide;
let isPyodideLoaded = false;

// DOM元素
const codeInput = document.getElementById('code-input');
const checkBtn = document.getElementById('check-btn');
const resetBtn = document.getElementById('reset-btn');
const feedbackContent = document.getElementById('feedback-content');
const loadingIndicator = document.getElementById('loading');

// 初始化Pyodide
async function initializePyodide() {
    try {
        loadingIndicator.classList.remove('hidden');
        feedbackContent.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>正在加载Python环境（首次加载约需10秒）...</p>
                <p class="small">请耐心等待，只需要加载一次</p>
            </div>
        `;
        
        // 加载Pyodide
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
            stdout: () => {}, // 忽略标准输出
            stderr: () => {}  // 忽略标准错误
        });
        
        isPyodideLoaded = true;
        loadingIndicator.classList.add('hidden');
        feedbackContent.innerHTML = `
            <div class="status">
                <i class="fas fa-check-circle" style="color:#4caf50; font-size:2rem;"></i>
                <p>Python环境已就绪！</p>
                <p>现在可以编写并检查Python函数了</p>
            </div>
        `;
    } catch (error) {
        feedbackContent.innerHTML = `
            <div class="error">
                <div class="error-header">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <h3 class="error-title">环境加载失败</h3>
                </div>
                <div class="error-content">
                    <p><strong>错误信息:</strong> ${error.message}</p>
                    <p>请检查网络连接后刷新页面重试</p>
                    <div class="error-solution">
                        <h4>解决方案:</h4>
                        <p>1. 确保您的设备已连接到互联网</p>
                        <p>2. 尝试刷新页面</p>
                        <p>3. 如果问题持续，请联系信息技术老师</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// 检查语法
async function checkSyntax() {
    if (!isPyodideLoaded) {
        alert("Python环境仍在加载中，请稍候...");
        return;
    }
    
    const code = codeInput.value.trim();
    if (!code) {
        feedbackContent.innerHTML = `
            <div class="error">
                <div class="error-header">
                    <i class="fas fa-exclamation-circle fa-2x"></i>
                    <h3 class="error-title">代码为空</h3>
                </div>
                <div class="error-content">
                    <p>请输入Python函数代码后再进行检查</p>
                    <div class="error-solution">
                        <h4>解决方案:</h4>
                        <p>1. 在左侧编辑器中输入函数定义</p>
                        <p>2. 确保代码以<code>def</code>关键字开头</p>
                        <p>3. 点击"检查语法"按钮</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    feedbackContent.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>正在分析代码...</p>
        </div>
    `;
    
    try {
        // 使用Pyodide检查语法
        await pyodide.runPythonAsync(code);
        
        // 提取函数信息
        const functionName = extractFunctionName(code);
        const parameters = extractParameters(code);
        
        // 显示成功信息
        feedbackContent.innerHTML = `
            <div class="success">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <i class="fas fa-check-circle fa-2x" style="margin-right: 10px;"></i>
                    <h3>语法正确！</h3>
                </div>
                <p>函数定义符合Python语法规范</p>
                <div class="preview">
                    <div class="preview-title">函数定义预览：</div>
                    <code style="font-size: 1.1rem;">${functionName}(${parameters})</code>
                </div>
                <div class="error-solution" style="margin-top: 20px; background: #e8f5e9; border-left-color: #4caf50;">
                    <h4>下一步建议:</h4>
                    <p>1. 尝试添加函数体实现具体功能</p>
                    <p>2. 测试函数调用</p>
                    <p>3. 添加文档字符串说明函数用途</p>
                </div>
            </div>
        `;
    } catch (error) {
        // 优化错误提示
        const errorMessage = formatPythonError(error.message);
        const errorLine = extractErrorLine(error.message);
        const solution = getErrorSolution(error.message);
        
        feedbackContent.innerHTML = `
            <div class="error">
                <div class="error-header">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <h3 class="error-title">发现语法错误</h3>
                </div>
                
                <div class="error-content">
                    <div class="error-scroll">
                       // <p><strong>错误位置:</strong> ${errorLine}</p>
                        <p><strong>错误详情:</strong></p>
                        <pre>${errorMessage}</pre>
                    </div>
                    
                    <div class="error-explanation">
                        <h4>错误分析：</h4>
                        <p>${getErrorExplanation(errorMessage)}</p>
                    </div>
                    
                    <div class="error-solution">
                        <h4>解决方案:</h4>
                        ${solution}
                    </div>
                </div>
            </div>
        `;
    }
}

// 提取错误行号
function extractErrorLine(errorMessage) {
    const lineMatch = errorMessage.match(/line (\d+)/);
    if (lineMatch && lineMatch[1]) {
        return `第 ${lineMatch[1]} 行`;
    }
    return "位置未知";
}

// 提取函数名
function extractFunctionName(code) {
    const match = code.match(/def\s+(\w+)\s*\(/);
    return match ? match[1] : '未知函数';
}

// 提取参数
function extractParameters(code) {
    const match = code.match(/\(([^)]*)\)/);
    return match ? match[1] : '';
}

// 格式化Python错误信息
function formatPythonError(error) {
    // 简化错误信息
    const simplifiedError = error
        .replace(/File "<exec>", line (\d+)/g, '第$1行')
        .replace(/SyntaxError: /g, '语法错误: ')
        .replace(/IndentationError: /g, '缩进错误: ')
        .replace(/NameError: /g, '名称错误: ')
        .replace(/TypeError: /g, '类型错误: ')
        .replace(/invalid syntax/g, '无效的语法')
        .replace(/unexpected indent/g, '意外的缩进')
        .replace(/expected an indented block/g, '需要缩进的代码块')
        .replace(/unindent does not match .* level/g, '缩进级别不匹配')
        .replace(/position: \d+/g, '');
    
    return simplifiedError;
}

// 获取错误解释
function getErrorExplanation(error) {
    if (error.includes('语法错误')) {
        return '函数定义结构不正确，请检查def关键字、函数名、括号和冒号的使用。';
    }
    if (error.includes('缩进错误')) {
        return 'Python使用缩进来表示代码块，函数体必须正确缩进（通常为4个空格）。';
    }
    if (error.includes('名称错误')) {
        return '函数名或变量名不符合命名规则，只能使用字母、数字和下划线，且不能以数字开头。';
    }
    if (error.includes('无效的字符')) {
        return '代码中包含Python不允许的特殊字符，请检查函数名或参数名是否合法。';
    }
    if (error.includes('括号')) {
        return '括号使用不匹配或位置不正确，请检查圆括号、方括号或花括号是否成对出现。';
    }
    return '请仔细检查代码结构，确保符合Python函数定义的基本规则。';
}

// 获取错误解决方案
function getErrorSolution(error) {
    if (error.includes('语法错误') || error.includes('无效的语法')) {
        return `
            <p>1. 确保函数定义以 <code>def</code> 关键字开头</p>
            <p>2. 检查函数名后是否有括号 <code>()</code></p>
            <p>3. 确保函数头以冒号 <code>:</code> 结束</p>
            <p>4. 检查参数之间是否有逗号分隔</p>
        `;
    }
    if (error.includes('缩进错误')) {
        return `
            <p>1. 函数体必须缩进（通常为4个空格）</p>
            <p>2. 确保整个函数体使用一致的缩进</p>
            <p>3. 不要混合使用空格和制表符</p>
            <p>4. 检查是否有不必要的缩进</p>
        `;
    }
    if (error.includes('名称错误') || error.includes('无效函数名')) {
        return `
            <p>1. 函数名只能包含字母、数字和下划线</p>
            <p>2. 函数名不能以数字开头</p>
            <p>3. 避免使用Python关键字作为函数名</p>
            <p>4. 使用有意义的英文单词命名函数</p>
        `;
    }
    if (error.includes('括号')) {
        return `
            <p>1. 检查所有括号是否成对出现</p>
            <p>2. 确保参数列表使用圆括号 <code>()</code></p>
            <p>3. 检查是否有不匹配的括号</p>
            <p>4. 确保函数定义末尾没有多余的括号</p>
        `;
    }
    
    return `
        <p>1. 检查代码是否有拼写错误</p>
        <p>2. 参考右侧的常见错误示例</p>
        <p>3. 简化代码逐步调试</p>
        <p>4. 向老师或同学寻求帮助</p>
    `;
}

// 重置代码
function resetCode() {
    codeInput.value = `def 函数名称(参数1, 参数2):
    # 在此处编写函数体
    # 可以使用 return 返回结果
    pass`;
    feedbackContent.innerHTML = `
        <div class="status">
            <i class="fas fa-arrow-circle-left" style="font-size: 2rem; color: #90a4ae;"></i>
            <p>请编写代码后点击"检查语法"按钮</p>
        </div>
    `;
}

// 事件监听器
checkBtn.addEventListener('click', checkSyntax);
resetBtn.addEventListener('click', resetCode);

// 初始化应用
initializePyodide();

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl + Enter 检查语法
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        checkSyntax();
    }
    
    // Ctrl + R 重置代码
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        resetCode();
    }
});