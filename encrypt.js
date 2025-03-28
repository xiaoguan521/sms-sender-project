const CryptoJS = require('crypto-js');

// 加密函数
function encrypt(text, key) {
    // 确保key适合使用
    key = getSuitableKey(key);
    
    // 将文本和密钥转换为UTF8格式
    const textUtf8 = CryptoJS.enc.Utf8.parse(text);
    const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.enc.Utf8.parse('wNSOYIB1k1DjY5lA');

    // 使用AES-CBC模式加密
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

// 使用实际测试数据
const text = '{"operateType":"1","phone":"18034582033","uuid":"bb3ecd8a-022f-4eb0-84f9-4db92303a8fa","verifyCode":"d6rt"}';
const key = 'XFmi9GS2hzk98jGX';
console.log("加密结果:", encrypt(text, key));

// 导出函数供其他模块使用
module.exports = {
    encrypt,
    getSuitableKey
}; 