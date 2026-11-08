---
title: LLMs Were Supposed to Hit a Wall
date: 2026-11-08
description: So why didn't they? We found more levers 🕹️
layout: book
---

You remember all the talk about LLMs plateauing out.

The bubble is gonna pop. Anytime now!

It was especially strong during 2025 when the only thing going for GPT-4.5 with est. 5-7T params was its “tasteful writing”🤌

It was starting to feel like we were maxing out the scale lever.

But we kept finding more:

- Pre-training scale
- Test-time compute
- Synthetic data
- Deep reinforcement learning
- Multi-agent swarms
- Longer task horizons

These levers overlap, and they didn't happen neatly one after another.

But they help explain why “we're hitting a wall” kept being followed by another performance jump.

## The original scaling lever

For a while, the recipe was pretty simple.

More data + more compute + bigger model → Better performance

Back in 2020, Dario Amodei and his colleagues at OpenAI had mapped out how language-model prediction loss improved with more parameters, data and training compute.

You could literally plot a curve and predict how much better a larger run would get at predicting the next token. OpenAI later predicted parts of GPT-4's performance from much smaller runs.

It was kinda Moore's law for intelligence. At least, that was the appeal.

Then there are the LLM and brain comparisons.

Funny comparison: A zebrafish has as many synapses as Qwen 3.8 27B has parameters but lacks the ability to one-shot Minecraft in Three.js. Disappointing.

A human brain has around 86 billion neurons and 164 trillion synapses in the neocortex alone, and is ~1,000,000x more sample efficient than LLMs, and there are no good explanations.

## Test Time Compute

You remember the prompting hacks

“Think harder”

“Let's think step by step”

People were already getting better answers by asking for intermediate steps.

The 2022 chain-of-thought papers measured gains on reasoning tasks from prompts like these.

With reasoning models, spending more compute before answering became something researchers deliberately trained and measured.

OpenAI reported that o1 improved with both more reinforcement learning (RL) training and more time spent reasoning at test time.

So you had another lever to pull after the model was trained.

But thinking longer can only take you so far.

If the problem is super hard, you can't always wait three years for the answer.

And more thinking doesn't guarantee that the answer will be right.

## Running out of Data

These models were trained on the entire internet and there is only so much useful human-written text. (Dead internet theory, scary!)

Filling the internet with AI slop doesn't automatically give us more useful material.

So where do you go from there?

### Synthetic data

Give a model good starting material, have it produce questions, explanations or code, then check and filter what comes back.

That gets you more mileage out of the data you have.

Then there's compute and energy. You still have to buy the chips, build the data centres and power the whole thing.

## Deep reinforcement learning

This is where the whole "Agent" thing comes from.

An agent observes its environment, takes an action and gets feedback through a reward.

It learns from those interactions to improve its cumulative reward over time.

This is how AI learns to learn. You give agents a set of verifiable tasks and the agent figures out the solution itself.

For an LLM, maths and code give you some fairly direct checks.

Did it get the answer right? Did the code pass the tests?

And bang! Coding is commoditized! And we are already seeing great progress in other verifiable domains like maths, physics, biology and more.

## Multi-agent swarms

A few years ago, to get more mileage, you would split the task between multiple chat sessions and break down a big problem into multiple smaller problems so that the models had a real chance of getting it right.

Now you don't have to worry about that anymore. The model itself spins up multiple subagents (essentially copies of itself) to get things done in parallel.

Generally it's just a couple dozen agents max, but the frontier labs are already on tens of thousands of agents all working together. That's how the Hugging Face hack happened.

## Long Horizon

But even then, you have compounding errors.

One agent gets something wrong. Another builds on it. A few steps later, the whole thing is confidently heading in the wrong direction.

Take a simplified example: 100 independent steps, each with a 99% chance of success. The chance of getting every single step right is only about 37%. Letting the agent run for longer gives it more opportunities to mess up.

Some of the fixes look almost comically basic. Write down what you've done in a `.md` file. Keep a progress log. Run the tests. Leave the next session enough information to pick up where you stopped.

Anthropic's work on long-running agents used progress files, git history and small chunks of work across sessions. Compaction helped, but wasn't enough on its own. The agent also needed to check what actually worked before handing the project over.

Context windows got bigger too. But being able to fit more text doesn't mean the model will use all of it well. Remember the needle-in-a-haystack tests and the lost-in-the-middle problem?

So how do you measure whether this is getting better?

METR tracks task horizons: the length of tasks (measured by how long they take human professionals) that generalist frontier model agents can complete autonomously with 50% reliability has been doubling approximately every 7 months for the last 6 years.

As we move forward, finding a new lever and pushing it to the extreme got harder and harder, but the AI also got smarter and smarter and now it's fueling its own advancements.

If finding new levers and pushing them to the extreme gets harder faster than the LLMs get better, we will plateau off. If not, AI becomes SI.

We at Vibegrow are working on finding new levers and maximising the existing levers for your business outcomes. If this sounds interesting to you, [get in touch with us](https://vibegrow.io)!

## Further reading

- Kaplan et al., [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361), 2020
- OpenAI, [GPT-4 Technical Report](https://cdn.openai.com/papers/gpt-4.pdf), 2023
- Wei et al., [Chain-of-Thought Prompting](https://arxiv.org/abs/2201.11903), 2022
- OpenAI, [Learning to reason with LLMs](https://openai.com/index/learning-to-reason-with-llms/), 2024
- Epoch AI, [Will we run out of data?](https://epoch.ai/publications/will-we-run-out-of-data-limits-of-llm-scaling-based-on-human-generated-data), 2024
- Abdin et al., [Phi-4 Technical Report](https://arxiv.org/abs/2412.08905), 2024
- DeepSeek-AI, [DeepSeek-R1](https://arxiv.org/abs/2501.12948), 2025
- Anthropic, [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system), 2025
- Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), 2025
- Liu et al., [Lost in the Middle](https://arxiv.org/abs/2307.03172), 2023
- METR, [Measuring AI ability to complete long tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/), 2025
