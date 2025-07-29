// 修改 getErrorExplanation 函数
function getErrorExplanation(error) {
    // 将错误信息转换为小写以便匹配
    const lowerError = error.toLowerCase();
    
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

// 修改 getErrorSolution 函数
function getErrorSolution(error) {
    // 将错误信息转换为小写以便匹配
    const lowerError = error.toLowerCase();
    
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
    if (lowerError.includes('括号')) {
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

// 修改 formatPythonError 函数（添加更多错误类型转换）
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
        .replace(/unexpected character/g, '意外的字符');

    return simplifiedError;
}