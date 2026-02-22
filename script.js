const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const subtitleOverlay = document.getElementById('subtitleOverlay');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const loading = document.getElementById('loading');

let currentImageBase64 = '';

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageBase64 = e.target.result;
        previewImage.src = currentImageBase64;
        uploadArea.style.display = 'none';
        previewSection.style.display = 'block';
        subtitleOverlay.classList.remove('show');
    };
    reader.readAsDataURL(file);
}

generateBtn.addEventListener('click', async () => {
    const apiKey = 'gr_de8a9d46bad012a50047c44599c37f848d272eff27126326cad19b74f369540c';

    loading.style.display = 'block';
    subtitleOverlay.classList.remove('show');

    try {
        const base64Data = currentImageBase64.split(',')[1];
        const mediaType = currentImageBase64.match(/data:(image\/\w+);/)[1];

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mediaType,
                                data: base64Data
                            }
                        },
                        {
                            type: 'text',
                            text: '请用一句简短有力的中文描述这张图片的核心内容，像电影字幕一样。不超过20个字，要有画面感和情感。'
                        }
                    ]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API 错误: ${response.status}`);
        }

        const data = await response.json();
        const caption = data.content[0].text;

        subtitleOverlay.textContent = caption;
        subtitleOverlay.classList.add('show');
    } catch (error) {
        alert('生成字幕失败: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
});

resetBtn.addEventListener('click', () => {
    previewSection.style.display = 'none';
    uploadArea.style.display = 'block';
    fileInput.value = '';
    currentImageBase64 = '';
    subtitleOverlay.classList.remove('show');
});
