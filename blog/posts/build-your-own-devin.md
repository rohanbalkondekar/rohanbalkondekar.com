---
title: Build Your Own Devin!
date: 2024-03-16
description: More specifically, Build your own AI Agents.
source: https://medium.com/@rohanbalkondekar/build-your-own-devin-8d8794266315
---

![Top-Secret-Devin-Architecture](https://cdn-images-1.medium.com/max/1024/1*Q25yxrDoOL7lTNlUSDxBZQ.png)
*Top-Secret-Devin-Architecture*

More specifically, Build your own AI Agents.

Devin uses GPT-4  
And people have already started building alternatives with Claude-3-Opus

[Embedded: twitter.com/mayfer/status/1766667900390109527](https://twitter.com/mayfer/status/1766667900390109527?s=20)

Devin is a better UI experience.  
For example, it does not even see the browser, but it is there for the user

Also, you can ‘talk’ to it at any time like you would a person, and it just keeps chugging away in the background executing and debugging your ideas. (this is needed as it takes 15–20 minutes to build apps)

Since Devin uses GPT-4, which can get expensive very quickly and Yes, it can get even more expensive than a human.

Of course, a lot of hard work has gone behind it.  
But, Agents are still in their infancy, and there’s a lot of room for improvement.

Any Technology Indistinguishable From Magic is Hiding Something. Openness is the way to go.

Building a sophisticated agent integrated with environment tools: shell, code editor, and web search might not be as difficult as it seems.

We already witnessing elements of Devin-like systems in the open source and in the next few months they will get even better. There are no moats.

Even raw LLMs like Claude Opus achieve 84.9% and GPT-4 gets 81.7% on HumanEval, a test of coding ability.

![Code Generation on HumanEval](https://cdn-images-1.medium.com/max/1024/1*Z4-HLA4KZl7WT61K6g5T7g.png)
*Code Generation on HumanEval*

Multi-agent frameworks like [AgentCoder](https://arxiv.org/pdf/2312.13010.pdf) with GPT-4 already achieved an impressive 96.3% on [human eval](https://paperswithcode.com/sota/code-generation-on-humaneval).

AgentCoder is a research paper, released in late January, that is very similar to Devin!

AgentCoder has:  
— chain-of-thought  
— terminal access  
— test generation  
— error feedback

These are the things that you need to build your own Devin!

AgentCoder has a collaborative system with specialized agents:

— Programmer Agent  
 — Test Designer Agent  
 — Test Executor Agent

During the coding procedure, the programmer agent focuses on the code generation and refinement based on the test executor agent’s feedback.

The test designer agent generates test cases for the generated code, and the test executor agent runs the code with the test cases and writes feedback to the programmer. This collaborative system ensures more effective code generation.

![AutoDev: Automated AI-Driven Development](https://cdn-images-1.medium.com/max/1024/1*CL8bclZkoFYpwyuhiP0stw.png)
*AutoDev: Automated AI-Driven Development*

Microsoft also published [AutoDev](https://arxiv.org/pdf/2403.08299.pdf), a fully automated AI-driven software development framework, designed for autonomous planning and execution of software engineering tasks and achieving 91.5% on HumanEval.

But this isn’t it! Frameworks using [LDB](https://arxiv.org/pdf/2402.16906v3.pdf)+[Reflexion](https://arxiv.org/pdf/2303.11366.pdf) also achieve 95.1%

![Large Language Model Debugger (LDB) - debugging framework](https://cdn-images-1.medium.com/max/1024/1*hR6rcwWFfyQb7YUC5HmocQ.png)
*Large Language Model Debugger (LDB) - debugging framework*

This shows that advancements from these frameworks stack up!

You can take components from these frameworks and build an elaborate new framework that builds upon the best practices and tools from previous research and improves upon them.

You can also build Agentic systems for your own specific use case(something which is very difficult to do with one fit for all solutions)

Say you want to exploit the capabilities of large generative models (LGMs) to develop automated systems for end-to-end data-driven discovery for Machine Learning (ML) purposes, you easily do it if you are building your agents with any capacity.

![Data-driven Discovery with Large Generative Models](https://cdn-images-1.medium.com/max/1024/1*UnZx5Mq5EKJtVbnSO2YYPQ.png)
*Data-driven Discovery with Large Generative Models*

You do not even have to start from scratch, you can build on the previous research and tools, there are numerous opensource projects like [gpt-pilot](https://github.com/Pythagora-io/gpt-pilot) which builds upon the notion of “The first real AI developer”

[GitHub - Pythagora-io/gpt-pilot: The first real AI developer](https://github.com/Pythagora-io/gpt-pilot)

It is a relatively simple framework that works with the developer to create apps. It has the following Agents:

Spec Writer Agent — writes project description from user input  
Architect Agent — creates architecture  
Tech Lead Agent — breaks down the project and creates tasks  
Developer Agent — Implements Tasks  
Reviewer Agent — Checks Code

We also have a Large Action Model framework for automation like [LaVague](https://github.com/lavague-ai/LaVague) for transforming natural language instructions into seamless browser interactions.

[GitHub - lavague-ai/LaVague: Large Action Model framework to develop AI Web Agents](https://github.com/lavague-ai/LaVague)

There are companies like [Magic](https://magic.dev/) that are building from scratch, even the LLM — the brain that goes behind all of it and also uses a different architecture to do so.

With so many tools readily available, you too can build a Devin, not as sophisticated, but you can customize it to optimize for your own metrics and for your own tasks!
