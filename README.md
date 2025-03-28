# WO脚本文件集合

这是一个用于管理和执行WO云盘相关服务的工具集合，主要实现了SMS验证码发送功能。

## 项目背景

该项目提供了一套与WO云盘服务交互的工具，包括加密模块、短信验证码发送模块和Web界面。这些工具可用于自动化操作WO云盘相关服务。

## 文件说明

- `encrypt.js`: 加密模块，提供AES-CBC加密功能
  - 使用CryptoJS实现的加密功能
  - 包含密钥处理和文本加密方法

- `send_sms.js`: SMS验证码发送功能(命令行版)
  - 支持向指定手机号发送验证码
  - 实现了与WO云盘API的完整交互流程
  - 包含会话初始化、预处理请求和发送验证码功能

- `send_sms_clean.js`: 精简版SMS发送功能
  - 移除了调试信息的精简版本
  - 适用于集成到其他系统

- `sms_sender.html`: SMS发送网页界面
  - 提供友好的用户界面
  - 可在浏览器中直接使用，无需安装Node.js

## 核心功能

1. **AES加密**
   - 使用AES-CBC模式进行文本加密
   - 支持密钥自动处理

2. **短信验证码发送**
   - 支持自定义验证码或自动生成
   - 完整实现与WO云盘API的交互流程

3. **Web界面**
   - 响应式设计，适合各种设备使用
   - 提供发送结果实时反馈

## 技术栈

- **前端**: HTML, CSS, JavaScript
- **后端**: Node.js
- **加密**: CryptoJS
- **网络请求**: Axios
- **Cookie管理**: tough-cookie

## 依赖项

项目使用Node.js，依赖以下库：
- `axios`: 用于发送HTTP请求
- `axios-cookiejar-support`: 提供cookie管理支持
- `crypto-js`: 用于加密功能
- `tough-cookie`: 用于cookie管理

## 安装方法

1. 克隆此仓库
```bash
git clone https://github.com/xiaoguan521/wo-scripts.git
cd wo-scripts
```

2. 安装依赖
```bash
npm install
```

## 使用方法

### 命令行发送短信验证码

```bash
node send_sms.js <手机号> [验证码]
```
如不提供验证码参数，将自动生成4位随机字母数字组合。

### 使用Web界面

直接在浏览器中打开`sms_sender.html`文件，填写手机号码，点击"发送验证码"按钮。

## 示例

```javascript
// 使用加密模块
const { encrypt } = require('./encrypt.js');
const encryptedText = encrypt('需要加密的文本', '密钥');

// 发送验证码
const phone = '13812345678';
const verifyCode = 'a1b2'; // 自定义验证码
sendSmsCode(phone, verifyCode);
```

## 注意事项

- 本工具仅用于学习和研究目的
- 请勿用于任何非法用途
- 请遵守相关服务条款和法律法规

## 贡献

欢迎提交问题和改进建议。 