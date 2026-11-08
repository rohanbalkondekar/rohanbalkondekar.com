---
title: Fuck You, Show Me The Prompt [UPDATE]
date: 2025-02-09
description: If you clicked, there’s high chance that you have already read Fuck You, Show Me The Prompt by Hamel
source: https://medium.com/@rohanbalkondekar/fuck-you-show-me-the-prompt-update-454edb03aec0
---

![Intercepting LLM API calls](https://cdn-images-1.medium.com/max/508/1*6-7XuhB2mGBVuVjhnwYJFg.png)
*Intercepting LLM API calls*

If you clicked, there’s high chance that you have already read [Fuck You, Show Me The Prompt](https://hamel.dev/blog/posts/prompt/) by [Hamel](https://x.com/HamelHusain)

Lets take this a step further, and take a closer look at LLM observability, and the various frameworks that are available for the same.

I wanted something like [LangSmith](https://www.langchain.com/langsmith) but opensource and I came accross [Phoenix](https://phoenix.arize.com/)

![Example Trace in Phoenix](https://cdn-images-1.medium.com/max/1024/1*Ew37gbmpijg6k5F8oupNMA.png)
*Example Trace in Phoenix*

**Pros:**

++ can create multiple projects  
++ can export traces easily  
++ good ui for displaying conversations (doesn’t display images tho)

**Cons:**

— doesn’t have inbuilt cost monitoring  
 — bugs when exporting traces, for a project I was not able to export user messages and it was super hard to debug why  
 — can’t selectively delete traces in the UI

Next, I tried [Portkey](https://portkey.ai/):

![](https://cdn-images-1.medium.com/max/1024/1*YNDWwE1gPhIfwYfKc3AV5g.png)

**Pros:**

++ inbuilt ui for cost tracking  
++ inbuilt caching and guardrails

**Cons:**

— many essential features requires enterprise upgrade  
 — falls behind pheonix with respect to free tier  
 — not opensource

I do not recommend portkey

What I am using now?

[Langfuse](https://langfuse.com/):

![](https://cdn-images-1.medium.com/max/1024/1*Wf8bPtzBE4Bm0CtrrYxp1w.png)

**pros:**

++ shows both traces and high level dashboard  
++ generous free tier  
++ opensource

since its opensource and provides a good starting point for LLM observebility, you can use it as a starting point and make changes in the code as necessary

Bottom Line: LLM observebility and evals are crutial while building Generative AI apps, use any tool that you like, but monitor how people are using your GenAI Apps
