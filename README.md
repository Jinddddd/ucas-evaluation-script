# 中国科学院大学教师和课程评估自动脚本

自动填写中国科学院大学（UCAS）的课程评估和教师评估表单，支持批量评估。

## 功能特性

- ✅ 自动填写客观题（选择"非常符合"）
- ✅ 自动填写主观题（支持自定义答案）
- ✅ 自动填写多选题（修读原因等）
- ✅ 等待验证码输入后自动提交
- ✅ 自动返回列表继续下一个评估
- ✅ 支持课程评估和教师评估

## 部署方法

### 1. 安装浏览器扩展

首先需要安装用户脚本管理器，推荐使用 Tampermonkey：

- **Chrome/Edge**: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- **Safari**: [Tampermonkey](https://apps.apple.com/app/tampermonkey/id1482490089)

### 2. 安装脚本

1. 点击 [ucas-course-evaluation-auto.user.js](https://github.com/Jinddddd/ucas-evaluation-script/raw/main/ucas-course-evaluation-auto.user.js) 下载脚本
2. Tampermonkey 会自动识别并提示安装
3. 点击"安装"按钮

### 3. 使用方法

1. 登录 [中国科学院大学选课系统](https://xkcts.ucas.ac.cn:8443/)
2. 进入"课程评估"或"教师评估"页面
3. 脚本会自动开始批量评估：
   - 自动点击"评估"按钮
   - 自动填写所有题目
   - 等待你输入4位验证码
   - 输入验证码后自动保存并继续下一个

### 4. 自定义答案

如果需要修改主观题答案，可以编辑脚本中的 `CONFIG.subjectiveAnswers` 部分：

```javascript
const CONFIG = {
    subjectiveAnswers: {
        q1: '课程内容丰富充实...',  // 课程评估-喜欢什么
        q2: '建议增加更多实践...',  // 课程评估-改进建议
        q3: '我平均每周在这门课程上花费两个半小时',  // 学习时间
        q4: '在参与这门课之前...',  // 课程评估-兴趣
        q5: '我对该课程的课堂参与度较高...',  // 课堂参与
        teacher1: '老师教学认真负责...',  // 教师评估-喜欢什么
        teacher2: '希望老师能够提供...'  // 教师评估-改进建议
    }
};
```

## 注意事项

- 脚本会自动填写所有题目，但验证码需要手动输入
- 输入4位验证码后会自动提交，无需点击保存按钮
- 评估完成后会自动返回列表继续下一个
- 所有课程/教师评估完成后会自动停止

## 许可证

MIT License
