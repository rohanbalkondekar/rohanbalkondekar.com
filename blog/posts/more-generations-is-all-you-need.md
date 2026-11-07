---
title: More Generations Is All You Need
date: 2024-04-09
description: More Agents Is All You Need 🤖
canonical: https://medium.com/@rohanbalkondekar/more-generations-is-all-you-need-8c902256e4db
---

![](https://cdn-images-1.medium.com/max/857/0*3ZTWpFGoyKFmdj2Q)

More Agents Is All You Need 🤖

We’ve all heard about scaling the number of parameters, but what about scaling the number of agents?

According to the paper, “LLM performance may likely be improved by a brute-force scaling up of the number of agents instantiated.”

This paper introduces a method which simply runs the same query multiple times on the same LLM, without any context shared across queries.

Then they run a similarity algorithm on the answers and pick the most common answer.

I.e. They consider a single agent that predicts multiple generations.  
And Multiple generations from say GPT-3.5 model produces results close to GPT-4.

This simple algorithm performs just as well (and sometimes better) than all the other multi-agent algorithms.

Which makes sense, if an LLM is giving you a mix of hallucinations and correct answers, the correct answers will be similar and the hallucinations will be chaotic.

![](https://cdn-images-1.medium.com/max/200/0*QMHbl3mM8tvlskkm.gif)

This seems to essentially raise questions on the whole idea of multi-agent setups like Chain-of-thought and LLM-Debate.

It suggests that the other multi-agent schemes with their clever prompts aren’t really doing anything special; Their improved results are coming mostly from the fact that the LLM is run multiple times and that the prompt asks the LLM to pick the best answer.

Feeding LLMs the same input and averaging the output is going to get you a better guess.

This idea of ensemble models has been used for a long time in ML and has proven to be very effective.

You average out the results of several predictors (or you let them vote and pick the most common prediction value), thereby reducing the noise in the prediction by choosing the common denominator of multiple predictions.

The accuracy increases with ensemble size across all models.

![](https://cdn-images-1.medium.com/max/696/0*e0iMO8uZAl5XBnqx)

When the ensemble size scales up to 15, Llama2–13B achieves comparable accuracy with Llama2–70B.

Similarly, When the ensemble size scales up to 15 and 20, Llama2–70B and GPT-3.5-Turbo achieve comparable accuracy with GPT-4.

The performance can be further improved across different LLMs and tasks, despite these methods, have different implementations.

![The accuracy scales with the ensemble size across different tasks](https://cdn-images-1.medium.com/max/1024/1*iXqlyHhM4AidOJi5DB4yAQ.png)
*The accuracy scales with the ensemble size across different tasks*

With the sampling-and-voting method, the performance of large language models (LLMs) scales with the number of agents instantiated.

Simply adding more instantiated LLM agents is what you need to obtain a better LLM performance in processing complex tasks.

Paper Link: [https://arxiv.org/pdf/2402.05120.pdf](https://arxiv.org/pdf/2402.05120.pdf)
