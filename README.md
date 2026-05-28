# 小红书「制图 + 文案」自动化工作流（OpenAI）

这个示例工作流可以：
1. 调用 OpenAI 生图模型生成小红书封面图；
2. 支持添加**描述词（风格词）**和**提示词（关键词增强）**；
3. 再调用文本模型自动生成小红书文案（标题、正文、标签、评论引导）。

## 1) 安装

```bash
pip install openai
```

## 2) 配置 API Key

```bash
export OPENAI_API_KEY="你的Key"
```

## 3) 运行

```bash
python xiaohongshu_workflow.py
```

运行后会输出：
- `xhs_cover.b64.txt`：图片 base64（可自行转成 png）
- `xhs_copy.txt`：生成好的小红书文案

## 4) 如何改你的主题

在 `WorkflowInput` 里修改：
- `topic`：主题（如：减脂早餐、护肤流程、穿搭）
- `audience`：目标受众
- `style_words`：描述词（如：治愈、高级、极简）
- `visual_keywords`：画面元素
- `prompt_keywords`：提示词增强（如：胶片感、柔光）

## 5) 进阶建议

- 把输出文案再做 A/B 测试（标题与标签组合）；
- 用同一主题批量生成 3-5 张封面图做点击率对比；
- 加入发布时间建议（例如晚间 20:00-22:00）。
