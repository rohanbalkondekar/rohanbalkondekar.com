---
title: Claude 3 — The New SOTA?
date: 2024-03-07
description: Claude 3 Opus is now the new SOTA LLM (Not taking Anthropic’s self-reported benchmark as the basis for this claim)
canonical: https://medium.com/@rohanbalkondekar/claude-3-the-new-sota-5755af7f6fb8
---

![](https://cdn-images-1.medium.com/max/1000/1*sxUhu58f_2LyFtBPP3at3g.png)

-   Claude is known for being objective and unaligned.
-   The Code Outputs are Huge, Rich, and complete.
-   I am loving programming with Claude-3-opus

![](https://cdn-images-1.medium.com/max/1024/1*KXI1Z1aCV_UdIuS_45Sp3w.png)

### Yes

Claude 3 Opus is now the new SOTA LLM (Not taking Anthropic’s self-reported benchmark as the basis for this claim)

Opus writes beautifully. It has a long context length, it is multi-model, and the censorship is not excessive.

It is good at 0-shot and also displays excellent step-by-step (CoT) reasoning

The Refusal rate is lower, the instruction following seems good and the planning ability is also improved.

In a [New RAG benchmark](https://github.com/h2oai/enterprise-h2ogpte/blob/main/rag_benchmark/results/test_client_e2e.md) with Claude 3, Gemini Pro, MistralAI vs. OSS models

\- Claude 3 Opus scores **100%** Accuracy  
\- Claude 3 Sonnet is a close second, only dipping 2% in Accuracy but with 80% Cost Savings

![](https://cdn-images-1.medium.com/max/1024/1*fdl5BJmpcuvHQ41FFs2ifg.png)

Pricing per 1M tokens:  
\- Claude Opus: $15 input, $75 output  
\- GPT-4-Turbo: $10 input, $30 output

Claude is **55%** more expensive than GPT-4-Turbo on average.  
Higher accuracy and overall fewer API calls might justify the cost for Opus.

RAG on PDFs and images has a few steps to give good answers to questions:  
\- Convert PDF/image to text via OCR, Vision Model, etc.  
\- Retrieve relevant information (bm\_25, semantic, re-ranking, etc.)  
\- Prompting for LLM  
\- LLM generation

Here the first 3 things are fixed, so this benchmark is only measuring how intelligent the LLM is in being able to find and understand the documents.

The Cost is in USD and Time in Seconds across all 124 Documents + Image Q/A, retrieval, LLM generation, etc.

Claude 3 is really something! The recall ability is impressive so is the training data

![](https://cdn-images-1.medium.com/max/1024/1*NcOpBi_xGNM4b322xX4Fqg.png)

In a Needle-in-Haystack test Opus not only found the needle (target sentence) in a haystack (random docs) but also figured out that this was an artificial test because the needle was so out of place in that haystack, It had to be an artificial attention test.

Looks like the Constitutional AI approach to align LLMs is on par, if not better than RLHF.

It is working out well, in the long run, I think this approach might be the go-to choice then followed by RLHF if needed.

Below are interesting examples of Claude’s Code Generation Capabilities:

It generates a multiplayer drawing app where the strokes appear on everyone else’s screens in real-time.

This is a full-fledged app developed in minutes

### murat 🍥 on Twitter: ""Make a multiplayer drawing app where the strokes appear on everyone else's screens in realtime. let user pick a name and color. save users to db on login"2m48s, no bugs:- users & drawings persist to sqlite- socket multiplayerone-shot video (claude 3 opus) demo at end pic.twitter.com/lI8k9o7Nn4 / Twitter"

"Make a multiplayer drawing app where the strokes appear on everyone else's screens in realtime. let user pick a name and color. save users to db on login"2m48s, no bugs:- users & drawings persist to sqlite- socket multiplayerone-shot video (claude 3 opus) demo at end pic.twitter.com/lI8k9o7Nn4

Not only coding and writing, but Claude is alsonailing finance too, given that Anthropic is focussing on Enterprise usecases

[Embedded: twitter.com/balajis/status/1765685404794290631](https://twitter.com/balajis/status/1765685404794290631?s=20)

Another example is in-context learning, which is going to be a big deal moving forward because Layers in Large Language Models are More Redundant Than You Expect and finetuning may not be as efficient as you may think

[Embedded: twitter.com/skirano/status/1765461051896721439](https://twitter.com/skirano/status/1765461051896721439?s=20)

Here is another example of Claude’s excellent instruction following (doing what it is asked to do) and code generation capability

where it writes complete code for a chrome extension to download YouTube videos

[Embedded: twitter.com/jamescodez/status/1765491195730706433](https://twitter.com/jamescodez/status/1765491195730706433?s=20)

To top it off, here is the system prompt that Claude 3 uses, they have certainly done a better job than OpenAI here

![](https://cdn-images-1.medium.com/max/1024/0*oKQ574lu3JvwyG3j)
