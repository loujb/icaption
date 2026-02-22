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
    loading.style.display = 'block';
    subtitleOverlay.classList.remove('show');

    try {
        const base64Data = currentImageBase64.split(',')[1];
        const mediaType = currentImageBase64.match(/data:(image\/\w+);/)[1];

        const response = await fetch('http://localhost:3000/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Data,
                mediaType: mediaType
            })
        });

        if (!response.ok) {
            throw new Error(`API 错误: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || data.error);
        }

        if (!data.content || !data.content[0]) {
            throw new Error('API 返回数据格式错误');
        }

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
