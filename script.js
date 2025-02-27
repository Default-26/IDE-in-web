require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' } });

let currentLanguage = 'html';

// کد HTML پیش‌فرض
let htmlCode = localStorage.getItem('htmlCode') || `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
`;

// کد CSS پیش‌فرض
let cssCode = localStorage.getItem('cssCode') || `
/* اینجا کد CSS بنویسید */
`;

// کد JavaScript پیش‌فرض
let jsCode = localStorage.getItem('jsCode') || `
// اینجا کد JavaScript بنویسید
`;

let editor;
let isPreviewVisible = true;

require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.create(document.getElementById("editor"), {
        value: htmlCode, // نمایش کد HTML پیش‌فرض
        language: "html",
        theme: "vs-dark",
        fontSize: 14,
        automaticLayout: true,
        wordWrap: "on",
        suggestOnTriggerCharacters: true, // فعال‌سازی پیشنهادات کد
        quickSuggestions: { other: true, comments: true, strings: true }, // پیشنهادات سریع
        parameterHints: { enabled: true }, // فعال‌سازی راهنمای پارامترها
        formatOnType: true, // قالب‌بندی خودکار هنگام تایپ
        formatOnPaste: true, // قالب‌بندی خودکار هنگام جایگذاری
        minimap: { enabled: true }, // فعال‌سازی مینی‌نقشه
        tabSize: 4, // اندازه تب
        autoClosingTags: true, // بستن خودکار تگ‌ها
        autoClosingBrackets: true, // بستن خودکار براکت‌ها
        autoClosingQuotes: true, // بستن خودکار کوتیشن‌ها
        autoIndent: "full", // تورفتگی خودکار
        suggest: { // تنظیمات پیشنهادات کد
            snippetsPreventQuickSuggestions: false, // اجازه پیشنهادات سریع برای اسنیپت‌ها
            showWords: true, // نمایش کلمات پیشنهادی
            showSnippets: true, // نمایش اسنیپت‌ها
            showClasses: true, // نمایش کلاس‌ها
            showFunctions: true, // نمایش توابع
            showVariables: true, // نمایش متغیرها
        },
    });

    // ذخیره‌سازی خودکار کدها
    editor.onDidChangeModelContent(debounce(() => {
        const code = editor.getValue();
        if (currentLanguage === "html") {
            htmlCode = code;
            localStorage.setItem('htmlCode', htmlCode);
        } else if (currentLanguage === "css") {
            cssCode = code;
            localStorage.setItem('cssCode', cssCode);
        } else if (currentLanguage === "javascript") {
            jsCode = code;
            localStorage.setItem('jsCode', jsCode);
        }
        updatePreview();
    }, 1000));
});

function setLanguage(lang) {
    currentLanguage = lang;
    let code = lang === "html" ? htmlCode : lang === "css" ? cssCode : jsCode;
    
    editor.setValue(code);
    monaco.editor.setModelLanguage(editor.getModel(), lang);
}

function updatePreview() {
    if (!isPreviewVisible) return;

    if (currentLanguage === "html") {
        htmlCode = editor.getValue();
        localStorage.setItem('htmlCode', htmlCode);
    } else if (currentLanguage === "css") {
        cssCode = editor.getValue();
        localStorage.setItem('cssCode', cssCode);
    } else {
        jsCode = editor.getValue();
        localStorage.setItem('jsCode', jsCode);
    }

    const previewFrame = document.getElementById("preview");
    const previewDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;

    previewDocument.open();
    previewDocument.write(`
        <html>
            <head>
                <style>${cssCode}</style>
                <script>${jsCode}</script>
            </head>
            <body style="background-color: #ffffff;">
                ${htmlCode}
            </body>
        </html>
    `);
    previewDocument.close();
}

function saveCode() {
    const code = currentLanguage === "html" ? htmlCode : currentLanguage === "css" ? cssCode : jsCode;
    const fileType = currentLanguage === "html" ? "text/html" : currentLanguage === "css" ? "text/css" : "text/javascript";
    const fileExtension = currentLanguage === "html" ? "html" : currentLanguage === "css" ? "css" : "js";

    const blob = new Blob([code], { type: fileType });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `code.${fileExtension}`;
    a.click();
}

function openCodeInNewWindow() {
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
        <html>
            <head>
                <style>${cssCode}</style>
                <script>${jsCode}</script>
            </head>
            <body style="background-color: #ffffff;">
                ${htmlCode}
            </body>
        </html>
    `);
    newWindow.document.close();
}

function togglePreview() {
    isPreviewVisible = !isPreviewVisible;
    const previewContainer = document.getElementById("preview-container");
    const editorContainer = document.getElementById("editor-container");

    if (isPreviewVisible) {
        previewContainer.style.display = "flex";
        editorContainer.style.width = "66.66%";
    } else {
        previewContainer.style.display = "none";
        editorContainer.style.width = "100%";
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle("bg-white");
    body.classList.toggle("text-black");
    body.classList.toggle("bg-black");
    body.classList.toggle("text-white");
}

function increaseFontSize() {
    const currentSize = parseInt(editor.getOption(monaco.editor.EditorOption.fontSize));
    editor.updateOptions({ fontSize: currentSize + 1 });
}

function decreaseFontSize() {
    const currentSize = parseInt(editor.getOption(monaco.editor.EditorOption.fontSize));
    editor.updateOptions({ fontSize: currentSize - 1 });
}

function undo() {
    editor.trigger("keyboard", "undo");
}

function redo() {
    editor.trigger("keyboard", "redo");
}

function openFind() {
    editor.trigger("keyboard", "actions.find");
}

function openReplace() {
    editor.trigger("keyboard", "editor.action.startFindReplaceAction");
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// تابع برای نمایش پاپ‌آپ
function showPopup() {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

// تابع برای بستن پاپ‌آپ
function closePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

// نمایش پاپ‌آپ پس از بارگذاری صفحه
window.onload = showPopup;