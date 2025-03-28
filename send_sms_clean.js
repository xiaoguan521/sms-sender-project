const CryptoJS = require('crypto-js');
const axios = require('axios');

// 加密函数
function encrypt(text, key) {
    key = getSuitableKey(key);
    const textUtf8 = CryptoJS.enc.Utf8.parse(text);
    const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.enc.Utf8.parse('wNSOYIB1k1DjY5lA');

    const encrypted = CryptoJS.AES.encrypt(textUtf8, keyUtf8, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
}

// 处理密钥长度的函数
function getSuitableKey(key) {
    return key.length > 16 ? key.slice(0, 16) : key;
}

// 生成随机4位验证码（数字字母组合）
function generateRandomCode(length = 4) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 发送验证码
async function sendSmsCode(phone, verifyCode) {
    const key = 'XFmi9GS2hzk98jGX';
    
    try {
        // 构造要加密的数据
        const uuid = require('crypto').randomUUID();
        console.log('使用的UUID:', uuid);
        console.log('使用的验证码:', verifyCode);
        
        const data = {
            operateType: "1",
            phone: phone,
            uuid: uuid,
            verifyCode: verifyCode
        };

        // 加密数据
        const encryptedData = encrypt(JSON.stringify(data), key);

        // 构造请求数据
        const requestData = {
            func: "pc_send",
            clientId: "1001000021",
            param: encryptedData
        };

        console.log('发送验证码请求...');
        // 发送请求
        const response = await axios.post(
            'https://panservice.mail.wo.cn/api-user/sendMessageCodeBase',
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Origin': 'https://pan.wo.cn',
                    'Referer': 'https://pan.wo.cn/',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
                },
                // 显式设置为不使用代理
                proxy: false
            }
        );

        console.log('发送验证码响应:', response.data);
        return response.data;
    } catch (error) {
        console.error('发送验证码失败:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// 获取命令行参数
const phone = process.argv[2];
const verifyCode = process.argv[3] || generateRandomCode(4); // 使用命令行参数或生成随机验证码

// 检查是否提供了手机号
if (!phone) {
    console.log("请提供手机号码作为参数！");
    console.log("使用方法: node send_sms_clean.js <手机号> [验证码]");
    console.log("如果不提供验证码，将自动生成4位随机字母数字组合");
    process.exit(1);
}

// 发送验证码
sendSmsCode(phone, verifyCode).catch(console.error); 