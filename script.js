// 全局变量
let pyodide;
let isPyodideLoaded = false;

// DOM元素引用
let codeInput, checkBtn, resetBtn, feedbackContent, loadingIndicator;

// 初始化DOM元素引用
function initDOMReferences() {
    codeInput = document.getElementById('code-input');
    checkBtn = document.getElementById('check-btn');
    resetBtn = document.getElementById('reset-btn');
    feedbackContent = document.getElementById('feedback-content');
    loadingIndicator = document.getElementById('loading');
    
    // 确保所有DOM元素都已找到
    if (!codeInput || !checkBtn || !resetBtn || !feedbackContent || !loadingIndicator) {
        console.error("无法找到必要的DOM元素");
        return false;
    }
    return true;
}

// 设置事件监听器
function setupEventListeners() {
    checkBtn.addEventListener('click', checkSyntax);
    resetBtn.addEventListener('click', resetCode);
    
    // 键盘快捷键
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
}

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

// 自定义错误检测函数
function detectCustomErrors(code) {
    // 1. 检测中文符号
    const chineseChars = code.match(/[，：；（）]/g);
    if (chineseChars) {
        const uniqueChars = [...new Set(chineseChars)];
        return `
            <div class="error">
                <div class="error-header">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <h3 class="error-title">中文符号错误</h3>
                </div>
                <div class="error-content">
                    <p><strong>错误详情:</strong> 检测到中文符号 ${uniqueChars.join(', ')}</p>
                    <div class="error-explanation">
                        <h4>错误分析：</h4>
                        <p>Python代码中必须使用英文符号，中文符号会导致语法错误</p>
                    </div>
                    <div class="error-solution">
                        <h4>解决方案:</h4>
                        <p>1. 请切换到英文输入法重新输入</p>
                        <p>2. 将中文符号替换为对应的英文符号：</p>
                        <ul>
                            <li>中文逗号（，）→ 英文逗号（,）</li>
                            <li>中文冒号（：）→ 英文冒号（:）</li>
                            <li>中文分号（；）→ 英文分号（;）</li>
                            <li>中文括号（（））→ 英文括号（()）</li>
                        </ul>
                        <p>3. 参考右侧"常见错误示例"中的正确写法</p>
                    </div>
                </div>
            </div>
        `;
    }

    // 2. 检测括号匹配
    const stack = [];
    for (let i = 0; i < code.length; i++) {
        if (code[i] === '(') stack.push(i);
        else if (code[i] === ')') {
            if (stack.length === 0) {
                return `
                    <div class="error">
                        <div class="error-header">
                            <i class="fas fa-exclamation-triangle fa-2x"></i>
                            <h3 class="error-title">括号不匹配</h3>
                        </div>
                        <div class="error-content">
                            <p><strong>错误详情:</strong> 检测到多余的右括号 )</p>
                            <div class="error-explanation">
                                <h4>错误分析：</h4>
                                <p>每个右括号 ) 必须有一个对应的左括号 (</p>
                            </div>
                            <div class="error-solution">
                                <h4>解决方案:</h4>
                                <p>1. 检查函数定义中的括号是否成对出现</p>
                                <p>2. 删除多余的右括号</p>
                                <p>3. 或者添加缺失的左括号</p>
                                <p>4. 使用代码编辑器的括号匹配功能检查</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            stack.pop();
        }
    }

    if (stack.length > 0) {
        return `
            <div class="error">
                <div class="error-header">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <h3 class="error-title">括号不匹配</h3>
                </div>
                <div class="error-content">
                    <p><strong>错误详情:</strong> 检测到未闭合的左括号 (</p>
                    <div class="error-explanation">
                        <h4>错误分析：</h4>
                        <p>每个左括号 ( 必须有一个对应的右括号 )</p>
                    </div>
                    <div class="error-solution">
                        <h4>解决方案:</h4>
                        <p>1. 检查函数定义末尾是否缺少右括号 )</p>
                        <p>2. 在函数头末尾添加缺失的右括号</p>
                        <p>3. 检查参数列表中的括号是否完整</p>
                        <p>4. 使用代码编辑器的括号匹配功能检查</p>
                    </div>
                </div>
            </div>
        `;
    }

    return null;
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
    
    // 首先进行自定义错误检测（中文符号和括号匹配）
    const customError = detectCustomErrors(code);
    if (customError) {
        feedbackContent.innerHTML = customError;
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
        const solution = getErrorSolution(error.message);
        
        feedbackContent.innerHTML = `
            <div class="error">
                <div class="error-header">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <h3 class="error-title">发现语法错误</h3>
                </div>
                
                <div class="error-content">
                    <div class="error-scroll">
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
        .replace(/invalid character/g, '无效的字符')
        .replace(/invalid identifier/g, '无效的标识符')
        .replace(/cannot assign to/g, '不能分配给')
        .replace(/position: \d+/g, '')
        .replace(/unexpected character/g, '意外的字符')
        // 添加以下两行处理数字开头的函数名
        .replace(/invalid decimal literal/g, '无效的函数名（不能以数字开头）')
        .replace(/invalid token/g, '无效的标识符');
    
    return simplifiedError;
}

// 获取错误解释
function getErrorExplanation(error) {
    const lowerError = error.toLowerCase();
    
    // 添加对数字开头函数名的检测
    if (lowerError.includes('无效的函数名（不能以数字开头）') || 
        lowerError.includes('invalid decimal literal')) {
        return '函数名不能以数字开头，这是Python的语法规则。';
    }
    
    // 添加对中文符号错误的检测
    if (lowerError.includes('无效的字符') || 
        lowerError.includes('invalid character') || 
        lowerError.includes('unexpected character')) {
        return '代码中包含Python不允许的特殊字符，特别是中文符号（如中文逗号、冒号、括号等）';
    }
    
    if (lowerError.includes('语法错误') || lowerError.includes('syntaxerror')) {
        return '函数定义结构不正确，请检查def关键字、函数名、括号和冒号的使用。';
    }
    if (lowerError.includes('缩进错误') || lowerError.includes('indentationerror')) {
        return 'Python使用缩进来表示代码块，函数体必须正确缩进（通常为4个空格）。';
    }
    if (lowerError.includes('名称错误') || lowerError.includes('nameerror') || 
        lowerError.includes('无效的标识符') || lowerError.includes('invalid identifier') || 
        lowerError.includes('cannot assign to')) {
        return '函数名或变量名不符合命名规则，只能使用字母、数字和下划线，且不能以数字开头。';
    }
    if (lowerError.includes('无效的字符') || lowerError.includes('invalid character') || 
        lowerError.includes('unexpected character')) {
        return '代码中包含Python不允许的特殊字符，请检查函数名或参数名是否含有中文符号、空格或其他非法字符。';
    }
    if (lowerError.includes('括号')) {
        return '括号使用不匹配或位置不正确，请检查圆括号、方括号或花括号是否成对出现。';
    }
    return '请仔细检查代码结构，确保符合Python函数定义的基本规则。';
}

// 获取错误解决方案
function getErrorSolution(error) {
    const lowerError = error.toLowerCase();
    
    // 添加对数字开头函数名的解决方案
    if (lowerError.includes('无效的函数名（不能以数字开头）') || 
        lowerError.includes('invalid decimal literal')) {
        return `
            <p>1. 函数名不能以数字开头（如 <code>def 123func()</code> 是错误的）</p>
            <p>2. 在数字前添加字母或下划线（如 <code>def func123()</code>）</p>
            <p>3. 使用纯字母开头的函数名</p>
            <p>4. 参考右侧"无效函数名"示例</p>
        `;
    }
    
    if (lowerError.includes('语法错误') || lowerError.includes('syntaxerror') || lowerError.includes('无效的语法')) {
        return `
            <p>1. 确保函数定义以 <code>def</code> 关键字开头</p>
            <p>2. 检查函数名后是否有括号 <code>()</code></p>
            <p>3. 确保函数头以冒号 <code>:</code> 结束</p>
            <p>4. 检查参数之间是否有逗号分隔</p>
        `;
    }
    if (lowerError.includes('缩进错误') || lowerError.includes('indentationerror')) {
        return `
            <p>1. 函数体必须缩进（通常为4个空格）</p>
            <p>2. 确保整个函数体使用一致的缩进</p>
            <p>3. 不要混合使用空格和制表符</p>
            <p>4. 检查是否有不必要的缩进</p>
        `;
    }
    if (lowerError.includes('名称错误') || lowerError.includes('nameerror') || 
        lowerError.includes('无效的标识符') || lowerError.includes('invalid identifier') || 
        lowerError.includes('cannot assign to')) {
        return `
            <p>1. 函数名只能包含字母、数字和下划线</p>
            <p>2. 函数名不能以数字开头</p>
            <p>3. 避免使用Python关键字作为函数名</p>
            <p>4. 使用有意义的英文单词命名函数</p>
        `;
    }
    if (lowerError.includes('无效的字符') || lowerError.includes('invalid character') || 
        lowerError.includes('unexpected character')) {
        return `
            <p>1. 检查函数名或参数中是否包含中文符号（如"，"、"："、"（）"）</p>
            <p>2. 确保使用英文输入法输入符号</p>
            <p>3. 函数名不能包含空格或特殊字符（如@、#、$等）</p>
            <p>4. 参考右侧"无效函数名"示例</p>
        `;
    }
    if (lowerError.includes('括号未关闭') || 
        lowerError.includes('意外的右括号') || 
        lowerError.includes('括号')) {
        return `
            <p>1. 检查函数定义中的括号是否成对出现</p>
            <p>2. 确保参数列表使用圆括号 <code>()</code></p>
            <p>3. 使用代码高亮编辑器帮助匹配括号</p>
            <p>4. 常见错误模式：</p>
            <ul style="margin-top:5px">
                <li><code>def my_func(参数1, 参数2</code> → 缺少右括号</li>
                <li><code>def my_func参数1, 参数2):</code> → 缺少左括号</li>
                <li><code>def my_func((参数1, 参数2):</code> → 多余左括号</li>
            </ul>
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

// 初始化应用
function initApp() {
    if (initDOMReferences()) {
        setupEventListeners();
        initializePyodide();
    } else {
        console.error("初始化失败：无法找到必要的DOM元素");
        // 显示错误信息
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                <h1 style="color: #c62828;">初始化错误</h1>
                <p>无法加载应用程序所需的元素，请尝试以下操作：</p>
                <ul style="text-align: left; max-width: 500px; margin: 20px auto;">
                    <li>刷新页面</li>
                    <li>检查浏览器控制台查看详细错误</li>
                    <li>确保所有脚本文件已正确加载</li>
                </ul>
            </div>
        `;
    }
}

// 当页面完全加载后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}