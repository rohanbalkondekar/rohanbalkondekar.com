---
title: How Far Are We From Automating Software Engineering?
date: 2024-03-13
description: Big Claims Huh?
canonical: https://medium.com/@rohanbalkondekar/how-far-are-we-from-automating-software-engineering-3d48d0292246
---

![this-is-how-exponential-growth-looks-like](https://cdn-images-1.medium.com/max/1024/1*kMoX_KhLVNY_Z3jwvQzrjA.png)
*this-is-how-exponential-growth-looks-like*

> “The First AI Software Engineer”

> “Code 55% Faster with Copilot”

> “Ceiling is being raised. cursor’s copilot helped us write ‘superhuman code’ for a critical feature. We can read this code, but VERY few engineers out there could write it from scratch.”

Big Claims Huh?

First of all “Coding” was never the source of value, Problem-Solving is. However, the discipline and precision demanded by traditional programming will remain valuable.

Devin is better than Claude 2 and GPT-4 at the coding task.

Devin is built into a very sophisticated environment with tools for it: shell, code editor, and web search so it has more resources than Claude 2 + interpreter would.

But the gap would likely be smaller if Claude 2 or GPT-4 were provided an environment similar to Devin’s.

Also, we saw 4 major GPT-4 rivels, all in one month!

![](https://cdn-images-1.medium.com/max/1024/1*RydHkhiflz2JM11_VWDxUQ.png)

The Goalposts are moving fast! 🥅

This is yet another indication of agent building ruling the incoming job landscape.

Now back to the coding part — If your code is long-lived, the time to write the first time isn’t a primary consideration. Maintainability and extensibility are core.

AI doesn’t help with those (certainly this batch doesn’t and it only increases the tech debt)

But do you what the good part is?  
\-> The Tools Are Only Gonna Get BETTER (so does the job of an engineer)

Andrej Karpathy puts forward an excellent analogy:  
Automating Software Engineering will look similar to automating driving

1\. first the human performs all driving actions manually  
2\. then the AI helps keep the lane  
3\. then it slows for the car ahead  
4\. then it also does lane changes and takes forks  
5\. then it also stops at signs/lights and takes turns  
6\. eventually you take a feature-complete solution and grind on the quality until you achieve full self-driving.

There is a progression of the AI doing more and the human doing less, but still providing oversight. In Software engineering, the progression is shaping up similarly -

1\. first the human writes the code manually  
2\. then GitHub Copilot autocompletes a few lines  
3\. then ChatGPT writes chunks of code  
4\. then you move to larger and larger code diffs (e.g. Cursor copilot++)  
5\. Devin is an impressive demo of what perhaps follows next

In any case, software engineering is on track to change substantially.

Let’s ask a Better Question  
 — How Far Are We From Being Fully Dependent On Multimodal LLMs?

![Design2Code](https://cdn-images-1.medium.com/max/1024/1*NbNWpmfqsOvrR03UwEF_ew.png)
*Design2Code*

Let’s look at a coarse timeline:

\- The first capable Visual-Language Model (VLM) ([OpenAI CLIP](https://openai.com/research/clip), Google ALIGN) emerged around 2021  
\- First varients of [Screenshot2Code](https://github.com/abi/screenshot-to-code) came out a year ago  
\- HuggingFace released [WebSight](https://huggingface.co/datasets/HuggingFaceM4/WebSight) dataset two months ago  
\- ELLA, DeepSeek-VL and Design2Code, all came out in a week

With the scope of improvement — large and the pace of progress — rapid, we are not far behind from truly extraordinary AI assistants and fully autonomous AI agents.

This week we saw:

[DeepSeek-VL](https://github.com/deepseek-ai/DeepSeek-VL) — An open-source Vision-Language Model, outperforming LLaVA through diverse data construction, an efficient model architecture, and proficient training strategies, demonstrating enhanced user experiences in real-world applications.

![DeepSeek-VL Visualization results](https://cdn-images-1.medium.com/max/787/1*w2qKE5ZIJp7eZNPOT9qQTw.png)
*DeepSeek-VL Visualization results*

[ELLA](https://arxiv.org/pdf/2403.05135.pdf) — Efficient Large Language Model Adapter (ELLA) improves text-to-image models with LLMs, outperforming CLIP in understanding complex prompts.

![The comparison between ELLA, SDXL, PixArt-α, playgroundai-v2 andDALL-E 3](https://cdn-images-1.medium.com/max/1024/1*uVxMetKum245kya8rErceQ.png)
*The comparison between ELLA, SDXL, PixArt-α, playgroundai-v2 andDALL-E 3*

[Design2Code](https://salt-nlp.github.io/Design2Code/) — Benchmarking AI’s ability to auto-generate web code from designs. It uses 484 diverse real-world webpages and automatic evaluation metrics to assess the code generation capabilities of multimodal Large Language Models. GPT-4V excels in this task, with evaluators preferring its generated webpages over the originals. (Not tested with Claude-3-Opus yet, it might perform even better)

Quoting [Yann LeCun](https://www.linkedin.com/in/ACoAAAADFk0BbiOeu2Wrer11SaPH_5m1GM8pG6Q) here:  
“Language is low bandwidth: less than 12 bytes/second.  
Vision is much higher bandwidth: about 20MB/s.

The data bandwidth of visual perception is roughly 16 million times higher than the data bandwidth of written (or spoken) language.

Human learning is inherently multi-modal as jointly leveraging multiple senses helps us understand and analyze new information better.

Most of human knowledge (and almost all of animal knowledge) comes from our sensory experience of the physical world. Language is the icing on the cake. We need the cake to support the icing.

There is no way we will ever reach human-level AI without getting machines to learn from high-bandwidth sensory inputs, such as vision.”

We are advancing in both the LLM reasoning and multimodal capabilities, and when we rightly chain all of these together, a lot of processes will be optimized and automated.

There is a great opportunity for businesses to start integrating AI and GenAI into their workflows to see massive ROI, with some gains becoming evident immediately, while others may take time to materialize but will certainly be fruitful.
