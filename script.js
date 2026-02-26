// 辅助函数：将十六进制颜色转换为RGB
function hexToRgb(hex) {
    // 移除#号
    hex = hex.replace(/^#/, '');
    
    // 处理简写形式
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    
    // 解析RGB值
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
}

// 全局变量
let uploadedImage = null;
let captionText = '';
let captionStyle = {
    fontFamily: 'Arial',
    fontSize: '24px',
    color: '#17b6812d',
    bgColor: '#000000',
    bgOpacity: 0.7,
    bgPadding: 15,
    position: 'bottom'
};

// DOM元素
const imageUpload = document.getElementById('imageUpload');
const previewImage = document.getElementById('previewImage');
const captionLayer = document.getElementById('captionLayer');
const captionTextarea = document.getElementById('captionText');
const addCaptionBtn = document.getElementById('addCaptionBtn');
const fontFamilySelect = document.getElementById('fontFamily');
const fontSizeSlider = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontColorPicker = document.getElementById('fontColor');
const bgColorPicker = document.getElementById('bgColor');
const captionPositionSelect = document.getElementById('captionPosition');
const bgOpacitySlider = document.getElementById('bgOpacity');
const bgOpacityValue = document.getElementById('bgOpacityValue');
const bgPaddingSlider = document.getElementById('bgPadding');
const bgPaddingValue = document.getElementById('bgPaddingValue');
const downloadBtn = document.getElementById('downloadBtn');

// 初始化函数
function init() {
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 图片上传
    imageUpload.addEventListener('change', handleImageUpload);
    
    // 字幕操作
    addCaptionBtn.addEventListener('click', addCaption);
    
    // 样式调整
    fontFamilySelect.addEventListener('change', updateStyle);
    fontSizeSlider.addEventListener('input', updateFontSize);
    fontColorPicker.addEventListener('change', updateStyle);
    bgColorPicker.addEventListener('change', updateStyle);
    captionPositionSelect.addEventListener('change', updateStyle);
    bgOpacitySlider.addEventListener('input', updateBgOpacity);
    bgPaddingSlider.addEventListener('input', updateBgPadding);
    
    // 其他操作
    downloadBtn.addEventListener('click', downloadImage);
}

// 处理图片上传
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImage = e.target.result;
        previewImage.src = uploadedImage;
        updateCaptionDisplay();
    };
    reader.readAsDataURL(file);
}

// 添加字幕
function addCaption() {
    captionText = captionTextarea.value;
    updateCaptionDisplay();
}

// 清除字幕
function clearCaption() {
    captionText = '';
    captionTextarea.value = '';
    updateCaptionDisplay();
}

// 更新字体大小显示
function updateFontSize() {
    const size = fontSizeSlider.value;
    fontSizeValue.textContent = size + 'px';
    captionStyle.fontSize = size + 'px';
    updateCaptionDisplay();
}

// 更新背景透明度
function updateBgOpacity() {
    const opacity = bgOpacitySlider.value;
    bgOpacityValue.textContent = opacity;
    captionStyle.bgOpacity = parseFloat(opacity);
    updateCaptionDisplay();
}

// 更新背景内边距
function updateBgPadding() {
    const padding = bgPaddingSlider.value;
    bgPaddingValue.textContent = padding + 'px';
    captionStyle.bgPadding = parseInt(padding);
    updateCaptionDisplay();
}

// 更新样式
function updateStyle() {
    captionStyle.fontFamily = fontFamilySelect.value;
    captionStyle.color = fontColorPicker.value;
    captionStyle.bgColor = bgColorPicker.value;
    captionStyle.position = captionPositionSelect.value;
    updateCaptionDisplay();
}

// 更新字幕显示
function updateCaptionDisplay() {
    if (!captionText || !uploadedImage) {
        captionLayer.style.display = 'none';
        return;
    }
    
    const lines = captionText.split('\n');
    if (lines.length === 0) {
        captionLayer.style.display = 'none';
        return;
    }
    
    captionLayer.style.display = 'block';
    captionLayer.innerHTML = '';
    
    // 为每行文字创建独立的背景区域
    lines.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'caption-line';
        lineDiv.textContent = line;
        
        // 应用样式
        lineDiv.style.fontFamily = captionStyle.fontFamily;
        lineDiv.style.fontSize = captionStyle.fontSize;
        lineDiv.style.color = captionStyle.color;
        // 应用背景颜色和透明度
        const bgColor = captionStyle.bgColor;
        const opacity = captionStyle.bgOpacity;
        lineDiv.style.backgroundColor = `rgba(${hexToRgb(bgColor)}, ${opacity})`;
        lineDiv.style.padding = captionStyle.bgPadding + 'px';
        lineDiv.style.textAlign = 'center';
        lineDiv.style.marginTop = index > 0 ? '1px' : '0'; // 添加分割线效果
        
        captionLayer.appendChild(lineDiv);
    });
    
    // 设置位置
    switch (captionStyle.position) {
        case 'top':
            captionLayer.style.top = '0';
            captionLayer.style.bottom = 'auto';
            break;
        case 'middle':
            captionLayer.style.top = '50%';
            captionLayer.style.bottom = 'auto';
            captionLayer.style.transform = 'translateY(-50%)';
            break;
        case 'bottom':
        default:
            captionLayer.style.top = 'auto';
            captionLayer.style.bottom = '0';
            captionLayer.style.transform = 'none';
            break;
    }
}

// 下载图片
function downloadImage() {
    if (!uploadedImage) {
        alert('请先上传图片');
        return;
    }
    
    // 创建canvas元素
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 创建图片对象
    const img = new Image();
    img.onload = function() {
        // 计算字幕背景高度
        const lineHeight = parseInt(captionStyle.fontSize) * 1.4;
        const lines = captionText.split('\n');
        const lineBackgroundHeight = lineHeight + 20; // 减少背景高度，确保没有空隙
        
        // 设置canvas尺寸（原图高度 + 所有字幕行高度）
        canvas.width = img.width;
        canvas.height = img.height + lineBackgroundHeight * lines.length;
        
        // 绘制原图
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // 绘制字幕
        if (captionText) {
            // 设置字体样式
            ctx.font = captionStyle.fontSize + ' ' + captionStyle.fontFamily;
            ctx.fillStyle = captionStyle.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 为每行文字绘制背景和文字
            lines.forEach((line, index) => {
                // 计算当前行的位置
                const lineY = img.height + lineBackgroundHeight * index;
                
                // 从原图底部截取背景区域并复制到下方行
                // 对于所有行，都使用原图底部的区域作为背景
                const sourceY = Math.max(0, img.height - lineBackgroundHeight);
                ctx.drawImage(
                    img, 
                    0, sourceY, img.width, lineBackgroundHeight, // 原图切割区域
                    0, lineY, img.width, lineBackgroundHeight   // 绘制到canvas的位置
                );
                
                // 绘制半透明背景覆盖
                const bgColor = captionStyle.bgColor;
                const opacity = captionStyle.bgOpacity;
                const rgbColor = hexToRgb(bgColor);
                ctx.fillStyle = `rgba(${rgbColor}, ${opacity})`;
                ctx.fillRect(0, lineY, img.width, lineBackgroundHeight);
                
                // 绘制文字
                ctx.fillStyle = captionStyle.color;
                const textY = lineY + lineBackgroundHeight / 2;
                ctx.fillText(line, canvas.width / 2, textY);
            });
        }
        
        // 转换为图片并下载
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'captioned-image.png';
        link.click();
    };
    img.src = uploadedImage;
}

// 重置工具
function resetTool() {
    // 重置图片
    uploadedImage = null;
    previewImage.src = '';
    imageUpload.value = '';
    
    // 重置字幕
    captionText = '';
    captionTextarea.value = '';
    captionLayer.style.display = 'none';
    
    // 重置样式
    captionStyle = {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
        bgColor: 'rgba(0, 0, 0, 0.7)',
        position: 'bottom'
    };
    
    // 重置表单
    fontFamilySelect.value = 'Arial';
    fontSizeSlider.value = '24';
    fontSizeValue.textContent = '24px';
    fontColorPicker.value = '#ffffff';
    bgColorPicker.value = '#000000';
    captionPositionSelect.value = 'bottom';
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);