import os
from dataclasses import dataclass
from typing import List

from openai import OpenAI


@dataclass
class WorkflowInput:
    topic: str
    audience: str
    style_words: List[str]
    visual_keywords: List[str]
    prompt_keywords: List[str]
    model_image: str = "gpt-image-1"
    model_text: str = "gpt-5-mini"


class XiaohongshuWorkflow:
    def __init__(self, api_key: str | None = None):
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))

    def build_image_prompt(self, data: WorkflowInput) -> str:
        style = "、".join(data.style_words)
        visual = "、".join(data.visual_keywords)
        extra = "、".join(data.prompt_keywords)
        return (
            f"请生成一张适合小红书封面的高质感图片。\n"
            f"主题：{data.topic}\n"
            f"受众：{data.audience}\n"
            f"风格词：{style}\n"
            f"画面元素：{visual}\n"
            f"提示词增强：{extra}\n"
            "要求：构图干净、主体突出、留白适合后期加标题、真实自然光、高清细节。"
        )

    def generate_image(self, prompt: str, size: str = "1024x1024") -> str:
        result = self.client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size=size,
        )
        return result.data[0].b64_json

    def generate_copy(self, data: WorkflowInput, image_prompt: str) -> str:
        instruction = f"""
你是小红书资深运营，请基于以下内容生成一篇可直接发布的笔记文案：

主题：{data.topic}
受众：{data.audience}
风格词：{'、'.join(data.style_words)}
用于制图的提示词：{image_prompt}

输出格式：
1) 吸引点击的标题（3个备选，20字以内）
2) 正文（150-250字，口语化、真诚、有步骤）
3) 话题标签（8-12个）
4) 评论区引导语（1句）
"""
        completion = self.client.responses.create(
            model=data.model_text,
            input=instruction,
        )
        return completion.output_text


def run_demo() -> None:
    workflow = XiaohongshuWorkflow()
    params = WorkflowInput(
        topic="5分钟通勤妆",
        audience="25-35岁上班族女生",
        style_words=["通透", "高级", "干净", "日常可复制"],
        visual_keywords=["自然光", "梳妆台", "化妆刷", "半身特写"],
        prompt_keywords=["ins风", "胶片色调", "高对比细节"],
    )

    image_prompt = workflow.build_image_prompt(params)
    image_b64 = workflow.generate_image(image_prompt)
    copy_text = workflow.generate_copy(params, image_prompt)

    with open("xhs_cover.b64.txt", "w", encoding="utf-8") as f:
        f.write(image_b64)

    with open("xhs_copy.txt", "w", encoding="utf-8") as f:
        f.write(copy_text)

    print("✅ 已生成：xhs_cover.b64.txt 和 xhs_copy.txt")


if __name__ == "__main__":
    run_demo()
