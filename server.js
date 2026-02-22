const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

app.post('/api/generate', async (req, res) => {
    try {
        const { image, mediaType } = req.body;

        const response = await fetch('https://api.uucode.org/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'gr_de8a9d46bad012a50047c44599c37f848d272eff27126326cad19b74f369540c',
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
                                data: image
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

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data.error || 'API 请求失败' });
        }

        res.json(data);
    } catch (error) {
        console.error('错误:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000');
});
