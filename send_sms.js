const CryptoJS = require('crypto-js');
const axios = require('axios');
const md5 = require('crypto-js/md5');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// 创建Cookie Jar
const cookieJar = new tough.CookieJar();

// 创建axios实例
const instance = wrapper(axios.create({
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://pan.wo.cn',
        'Referer': 'https://pan.wo.cn/',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
    },
    withCredentials: true, // 允许跨域请求携带凭证
    jar: cookieJar // 设置Cookie Jar
}));

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

// 生成时间戳
function getTimestamp() {
    return Date.now();
}

// 生成签名
function generateSign(timestamp) {
    const str = `PcWebLoginVerifyCodeShow${timestamp}`;
    return md5(str).toString();
}

// 首先访问登录页面，获取必要的Cookie
async function initSession() {
    try {
        console.log('初始化会话，访问登录页...');
        const response = await instance.get('https://pan.wo.cn/login');
        console.log('初始化会话完成');
        return response;
    } catch (error) {
        console.error('初始化会话失败:', error.message);
        throw error;
    }
}

// 发送验证码前的预处理请求
async function preRequest(phone) {
    const timestamp = getTimestamp();
    const sign = generateSign(timestamp);
    
    // 加密手机号
    const encryptedPhone = encrypt(phone, 'XFmi9GS2hzk98jGX');
    
    const data = {
        header: {
            key: "PcWebLoginVerifyCodeShow",
            resTime: timestamp,
            reqSeq: Math.floor(Math.random() * 1000000),
            channel: "api-user",
            sign: sign,
            version: ""
        },
        body: {
            param: encryptedPhone,
            clientId: "1001000021",
            secret: true
        }
    };

    try {
        console.log('发送预处理请求...');
        const response = await instance.post(
            'https://panservice.mail.wo.cn/api-user/dispatcher',
            data
        );
        console.log('预处理请求成功:', response.data);
        return response.data;
    } catch (error) {
        console.error('预处理请求失败:', error.response ? error.response.data : error.message);
        throw error;
    }
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
    console.log("使用方法: node send_sms.js <手机号> [验证码]");
    console.log("如果不提供验证码，将自动生成4位随机字母数字组合");
    process.exit(1);
}

// 发送验证码
sendSmsCode(phone, verifyCode).catch(console.error); 