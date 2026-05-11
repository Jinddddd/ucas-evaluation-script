// ==UserScript==
// @name         UCAS课程评估自动填写
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  自动填写中国科学院大学课程评估和教师评估表单
// @author       You
// @match        *://jwxk.ucas.ac.cn/*
// @match        *://sep.ucas.ac.cn/*
// @match        *://xkcts.ucas.ac.cn:8443/*
// @match        *://xkcts.ucas.ac.cn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 配置项
    const CONFIG = {
        // 主观题答案
        subjectiveAnswers: {
            // 课程评估答案
            q1: '课程内容丰富充实，教学方式生动有趣，老师讲解清晰透彻，实践环节设计合理，理论与实践结合紧密，收获很大。',
            q2: '建议增加更多实践案例和前沿技术介绍，适当调整课程难度梯度，增加师生互动环节，提供更多课后答疑时间。',
            q3: '我平均每周在这门课程上花费两个半小时', // 每周学习小时数
            q4: '在参与这门课之前，我对该学科领域有较强的兴趣，希望通过课程学习深入了解相关知识和技能。',
            q5: '我对该课程的课堂参与度较高，出勤率良好，积极回答问题，认真完成作业，主动与老师和同学交流讨论。',
            // 教师评估答案
            teacher1: '老师教学认真负责，讲解清晰透彻，能够深入浅出地阐述复杂概念，课堂氛围活跃，注重与学生互动。',
            teacher2: '希望老师能够提供更多课后答疑时间，增加一些实践案例的讲解，帮助学生更好地理解和应用所学知识。'
        }
    };

    // ========== 表单填写函数 ==========

    // 填写客观题（单选题，选择value=5，即"非常符合"）
    function fillObjectiveQuestions() {
        const radios = document.querySelectorAll('input[type="radio"][value="5"]');
        console.log(`找到 ${radios.length} 个客观题选项`);

        radios.forEach(radio => {
            radio.checked = true;
            radio.click();
            radio.dispatchEvent(new Event('change', { bubbles: true }));
        });

        console.log('客观题填写完成');
    }

    // 填写主观题（textarea）
    function fillSubjectiveQuestions() {
        const textareas = document.querySelectorAll('textarea');
        console.log(`找到 ${textareas.length} 个textarea`);

        textareas.forEach((textarea, index) => {
            // 查找题目文本
            let questionText = '';
            let prevElement = textarea.previousElementSibling;

            while (prevElement && !questionText) {
                if (prevElement.textContent && prevElement.textContent.trim()) {
                    questionText = prevElement.textContent.trim();
                    break;
                }
                prevElement = prevElement.previousElementSibling;
            }

            if (!questionText && textarea.parentElement && textarea.parentElement.previousElementSibling) {
                questionText = textarea.parentElement.previousElementSibling.textContent.trim();
            }

            console.log(`题目 ${index + 1}: ${questionText.substring(0, 50)}`);

            // 匹配答案
            let answer = '';

            if (questionText.includes('老师') && (questionText.includes('喜欢') || questionText.includes('教学'))) {
                answer = CONFIG.subjectiveAnswers.teacher1;
            } else if (questionText.includes('老师') && (questionText.includes('意见') || questionText.includes('建议'))) {
                answer = CONFIG.subjectiveAnswers.teacher2;
            } else if (questionText.includes('喜欢') || questionText.includes('最好')) {
                answer = CONFIG.subjectiveAnswers.q1;
            } else if (questionText.includes('改进') || questionText.includes('提高') || questionText.includes('意见') || questionText.includes('建议')) {
                answer = CONFIG.subjectiveAnswers.q2;
            } else if (questionText.includes('小时') || questionText.includes('花费')) {
                answer = CONFIG.subjectiveAnswers.q3;
            } else if (questionText.includes('之前') || questionText.includes('兴趣')) {
                answer = CONFIG.subjectiveAnswers.q4;
            } else if (questionText.includes('课堂参与') || questionText.includes('出勤')) {
                answer = CONFIG.subjectiveAnswers.q5;
            } else {
                answer = '课程设计合理，内容充实，教学效果良好，对我的学习和研究有较大帮助，总体比较满意。';
            }

            textarea.value = answer;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.dispatchEvent(new Event('change', { bubbles: true }));

            console.log(`  -> 填入答案: ${answer.substring(0, 30)}...`);
        });

        console.log('主观题填写完成');
    }

    // 填写多选题（修读原因等）
    function fillMultipleChoice() {
        console.log('=== 开始填写多选题 ===');

        const questionDivs = Array.from(document.querySelectorAll('div[style*="margin-top:20px"]')).filter(div => {
            return /^\d+\./.test(div.textContent.trim());
        });

        console.log(`找到 ${questionDivs.length} 个题目`);

        questionDivs.forEach(questionDiv => {
            const questionText = questionDiv.textContent.trim();
            console.log(`\n检查题目: ${questionText.substring(0, 50)}`);

            if (questionText.includes('修读原因')) {
                console.log('  -> 识别为修读原因题（多选）');

                let nextDiv = questionDiv.nextElementSibling;
                let divCount = 0;
                while (nextDiv && !nextDiv.textContent.match(/^\d+\./)) {
                    divCount++;
                    const checkboxes = nextDiv.querySelectorAll('input[type="checkbox"]');
                    console.log(`  -> 第${divCount}个div，找到 ${checkboxes.length} 个checkbox`);

                    checkboxes.forEach((checkbox, idx) => {
                        const label = checkbox.parentElement?.textContent || '';
                        console.log(`    [${idx}] label: ${label.trim().substring(0, 30)}`);

                        const shouldCheck = label.includes('需求') || label.includes('兴趣') ||
                                          label.trim().startsWith('B.') ||
                                          label.includes('核心课') || label.trim().startsWith('C.');

                        if (shouldCheck) {
                            console.log(`    [${idx}] 应该选中这个选项`);

                            // 设置checked
                            checkbox.checked = true;

                            // 尝试点击label（如果存在）
                            const labelElement = document.querySelector(`label[for="${checkbox.id}"]`);
                            if (labelElement) {
                                console.log(`    [${idx}] 找到label元素，尝试点击`);
                                labelElement.click();
                            }

                            // 触发各种事件
                            checkbox.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                            checkbox.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                            checkbox.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                            checkbox.dispatchEvent(new Event('input', { bubbles: true }));

                            // 如果页面使用jQuery，触发jQuery事件
                            if (window.jQuery) {
                                window.jQuery(checkbox).trigger('click').trigger('change');
                            }

                            console.log(`    [${idx}] 最终checked状态: ${checkbox.checked}`);
                        }
                    });
                    nextDiv = nextDiv.nextElementSibling;
                }
            }
        });

        console.log('\n=== 多选题填写完成 ===');
    }

    // ========== 流程控制函数 ==========

    // 查找评估按钮
    function findEvaluationButtons() {
        return Array.from(document.querySelectorAll('button, a')).filter(btn => {
            const text = btn.textContent.trim();
            return text === '评估';
        });
    }

    // 开始批量评估
    function startBatchEvaluation() {
        const buttons = findEvaluationButtons();
        if (buttons.length === 0) {
            console.log('没有找到待评估项目');
            return;
        }

        const state = {
            isRunning: true,
            currentIndex: 0,
            totalCourses: buttons.length
        };
        localStorage.setItem('ucas_batch_eval_state', JSON.stringify(state));

        console.log(`开始批量评估，共 ${buttons.length} 项`);
        setTimeout(() => buttons[0].click(), 1000);
    }

    // 填写表单
    function fillForm() {
        console.log('=== 开始自动填写表单 ===');

        fillObjectiveQuestions();
        setTimeout(() => fillSubjectiveQuestions(), 500);
        setTimeout(() => fillMultipleChoice(), 1000);

        console.log('=== 表单填写完成，等待验证码 ===');
    }

    // 等待验证码并提交
    function waitForCaptchaAndSubmit() {
        fillForm();

        const captchaInput = document.querySelector('input#adminValidateCode') ||
                           document.querySelector('input[placeholder*="验证码"]');

        if (captchaInput) {
            console.log('找到验证码输入框，等待用户输入...');
            captchaInput.focus();

            const checkCaptcha = setInterval(() => {
                if (captchaInput.value && captchaInput.value.length === 4) {
                    clearInterval(checkCaptcha);
                    console.log('检测到4位验证码，准备保存...');
                    setTimeout(() => submitForm(), 500);
                }
            }, 500);
        } else {
            console.log('未检测到验证码');
        }
    }

    // 提交表单
    function submitForm() {
        const saveBtn = Array.from(document.querySelectorAll('button')).find(btn =>
            btn.textContent.includes('保存')
        );

        if (saveBtn) {
            console.log('正在保存...');
            saveBtn.click();

            setTimeout(() => {
                const confirmBtn = Array.from(document.querySelectorAll('button')).find(btn =>
                    btn.textContent.includes('确定')
                );

                if (confirmBtn) {
                    console.log('点击确定...');
                    confirmBtn.click();
                }

                setTimeout(() => returnToListAndContinue(), 2000);
            }, 1000);
        } else {
            console.log('❌ 未找到保存按钮');
        }
    }

    // 返回列表并继续
    function returnToListAndContinue() {
        const state = JSON.parse(localStorage.getItem('ucas_batch_eval_state') || '{}');

        if (state.isRunning) {
            state.currentIndex++;
            localStorage.setItem('ucas_batch_eval_state', JSON.stringify(state));

            if (state.currentIndex < state.totalCourses) {
                console.log(`✅ 已完成 ${state.currentIndex}/${state.totalCourses}，返回列表...`);
                setTimeout(() => window.history.back(), 1000);
            } else {
                console.log('🎉 所有评估完成！');
                localStorage.removeItem('ucas_batch_eval_state');
            }
        }
    }

    // ========== 主程序 ==========

    function init() {
        const url = window.location.href;

        // 判断页面类型
        const isListPage = (url.includes('/evaluate/course/') || url.includes('/evaluate/teacher/')) &&
                          !url.includes('/evaluateCourse/') && !url.includes('/evaluateTeacher/');

        const isFormPage = url.includes('/evaluateCourse/') || url.includes('/evaluateTeacher/');

        if (isListPage) {
            console.log('检测到列表页面');

            setTimeout(() => {
                const buttons = findEvaluationButtons();
                if (buttons.length > 0) {
                    console.log(`发现 ${buttons.length} 个待评估项目`);
                    startBatchEvaluation();
                }
            }, 2000);

            // 批量模式返回后继续
            const state = JSON.parse(localStorage.getItem('ucas_batch_eval_state') || '{}');
            if (state.isRunning && state.currentIndex > 0) {
                setTimeout(() => {
                    const buttons = findEvaluationButtons();
                    if (state.currentIndex < buttons.length) {
                        console.log(`继续评估第 ${state.currentIndex + 1} 项...`);
                        setTimeout(() => buttons[state.currentIndex].click(), 2000);
                    }
                }, 1000);
            }
        } else if (isFormPage) {
            console.log('检测到评估表单页面');
            setTimeout(() => waitForCaptchaAndSubmit(), 1500);
        }
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
