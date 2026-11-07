---
title: Flow Engineering is All You Need
date: 2024-02-26
description: We’re pushing the boundaries of what’s possible with Large Language Models (LLMs) by employing innovative frameworks that enhance their capabilities.
canonical: https://medium.com/@rohanbalkondekar/flow-engineering-is-all-you-need-9046a5e7351d
---

We’re pushing the boundaries of what’s possible with Large Language Models (LLMs) by employing innovative frameworks that enhance their capabilities.

Leveraging frameworks like [ReAct](https://arxiv.org/pdf/2210.03629.pdf), [CoT](https://arxiv.org/pdf/2201.11903.pdf), [ToT](https://arxiv.org/pdf/2305.10601.pdf), among others, has conclusively demonstrated to unlock significant capabilities of Large Language Models (LLMs), thereby enabling the automation of complex tasks previously unattainable by using LLMs straight out of the box.

By proper prompting and feedback, Generalist Foundation Models can [outcompete](https://arxiv.org/pdf/2311.16452.pdf) special-purpose fine-tuned models.

For instance, the accuracy of GPT-4 on competitive programming problems increased from 19% with a single well-designed direct prompt to 44% with [Flow Engineering](https://arxiv.org/pdf/2401.08500.pdf).

### **So what is Flow Engineering?**

A Flow is an iterative process where multiple agents collaborate and interact with the environment and each other to get a task done. Flow Engineering elevates [prompt engineering](https://www.lyzr.ai/prompt-engineering-101-how-to-write-powerful-prompts/), by breaking tasks into smaller steps and prompting the LLM to self-refine its answers, leading to enhanced accuracy and better performance.

To put Impact of using Advanced Frameworks into perspective, let’s consider the Language Agent Tree Search ([LATS](https://arxiv.org/pdf/2310.04406v2.pdf)) framework.

When paired with GPT-4, LATS has achieved a remarkable **94.4%** success rate on the [HumanEval](https://paperswithcode.com/sota/code-generation-on-humaneval) benchmark for programming tasks. In contrast, GPT-4 alone, without any specialized prompting, scores **67.0%**. This striking difference of **27.4%** highlights the untapped potential within LLMs that can be harnessed through Flow Engineering.

![Figure 1: An overview of the six operations of LATS.](https://cdn-images-1.medium.com/max/1024/0*xmpdizRS99QO_d6E)
*Figure 1: An overview of the six operations of LATS.*

Drawing inspiration from the Monte-Carlo Tree Search, LATS operates through a sequence of steps: selection, expansion, evaluation, and simulation. A node is selected, expanded, evaluated, then simulated until a terminal node is reached, then the resulting value is back propagated.

Research on “dual process” models suggests that people have two modes in which they engage with decisions — a fast, automatic, unconscious mode (“System 1”) and a slow, deliberate, conscious mode (“[System 2](https://arxiv.org/pdf/2311.11829.pdf)”)

The simple associative token-level choices of LMs are also reminiscent of “System 1”, and thus might benefit from augmentation by a more deliberate “System 2” planning process that maintains and explores diverse alternatives for current choices instead of just picking one, and evaluates its current status and actively looks ahead or backtracks to make more global decisions.

System 2 thinking with LLMs can be achieved at both prompt level and flow level. By including few examples of thorough and deliberate thinking at prompt Level or splitting the end goal into smaller, detailed steps at the flow level.

We at [Lyzr](https://www.lyzr.ai/) utilize research-backed prompting techniques, [prompt engineering](https://arxiv.org/pdf/2311.05661.pdf), paired with our own rigorous research and comprehensive benchmarking for selection of best prompts and prompting techniques for an enterprise workflow.

### **Few techniques that we regularly use with Flow Engineering while developing Agents**

\- [Let’s Verify Step by Step](https://arxiv.org/pdf/2305.20050.pdf): Using process supervision by providing feedback for each intermediate reasoning step.

\- [Reflexion](https://arxiv.org/pdf/2303.11366.pdf): A framework to reinforce language agents through linguistic feedback instead of updating weights. Reflexion converts binary or scalar feedback from the environment into verbal feedback in the form of a textual summary, which is then added as additional

context for the LLM agent.

![Figure 2: Diagram of Reflexion](https://cdn-images-1.medium.com/max/601/0*SwPS3sKMhBUgmwQk)
*Figure 2: Diagram of Reflexion*

\- [OPRO](https://arxiv.org/pdf/2309.03409.pdf): Optimization by PROmpting. Using LLM to generate new solutions from the prompt that contains previously generated solutions with their values. Prompts optimized by OPRO outperform human-designed prompts by up to 50%.

![Figure 3: An overview of the OPRO framework](https://cdn-images-1.medium.com/max/624/0*9v3g5Z0I-yNl4uTE)
*Figure 3: An overview of the OPRO framework*

\- [Automatic Prompt Engineering](https://arxiv.org/pdf/2211.01910.pdf): LLMs are very good at optimizing their own prompts and are human-level prompt engineers. We can take vague requirements from users and turn them into high quality prompts using the LLM itself.

\- [Rephrase and Respond](https://arxiv.org/pdf/2311.04205.pdf): Using LLMs to rephrase and expand questions posed by humans and provide responses. This method is complementary to Chain-of-Thought prompting.

\- [Step-Back Prompting](https://arxiv.org/pdf/2310.06117.pdf): Using the concepts and principles, paired with abstraction to guide the reasoning steps of LLMs.

\- [Chain-of-Verification](https://arxiv.org/pdf/2309.11495.pdf): Generate Baseline Response -> Plan Verifications -> Execute Verifications ->Generate Final Verified Response.

\- [Emotional Stimuli](https://arxiv.org/pdf/2307.11760.pdf): By combining the original prompt with emotional stimuli e.g. ‘This is a Critical Scenario’ can enhance performance by as much as 115% in specific scenarios.

\- [EVOPROMPT](https://arxiv.org/pdf/2309.08532.pdf): Using Evolutionary Algorithms for automatic prompt generation, outperforming human-engineered prompts by up to 25%

### **Why use Flow Engineering?**

Efficiently leveraging LLMs for automating roles and streamlining processes begins with meticulous Flow Engineering, which involves designing task automation to reduce iterative rounds and ensure that LLM capabilities align with our expectations from the outset.

Flow Engineering enhances LLM performance, lowers operational costs, and provides improved output control. As the industry advances from chatbots to GenAI agents, mastering this approach becomes crucial for automating sophisticated processes effectively.

The use of LLMs started as assistants, supporting humans in specific tasks while the human remained always in charge and in the loop. As the LLM models become more and more powerful, they also become increasingly reliable and capable of achieving goals on their own.

Flow Engineering helps in designing robust flows with focus on thorough testing, fault tolerance and creating foolproof systems to ensure safe failure, if it occurs.

### **How are we using Flow Engineering?**

Not all flows are equal, even the latest [SOTA](https://www.lyzr.ai/how-to-build-a-state-of-the-art-sota-rag-engine/)(State-of-the-Art) framework might not perform well for a specific use case.

Then there is an issue of latency and cost. Flows generally have two or more steps. This means multiple back and forth with the LLM and additional token costs and latency, which can quickly add up! Thorough testing and validation has to be done to select the best flow.

Frameworks like [AutoGen](https://github.com/microsoft/autogen) and [CrewAI](https://github.com/joaomdmoura/crewAI) are popular options to create AI Agents that work together to achieve a given task. While these frameworks are great to get started for simple to medium workflows, they are not sufficient to build advanced agents like Lyzr’s [DataAnalyzr](https://docs.lyzr.ai/lyzr-sdk/opensource/data-analyzr/) and Knowledge ChatBot.

We at Lyzr developed the agents from scratch by leveraging the best available tools, so that we have complete control over the agent behavior.

Below is a simplified illustration of Lyzr’s conversational Data Analysis agent DataAnalyzr. The actual flow is far more sophisticated with individual steps thoroughly optimized for task efficiency, accuracy and overall agent performance.

![Figure 4: Conversational Data Analysis Flow](https://cdn-images-1.medium.com/max/1024/0*GzIQtTBJtD91lCxv)
*Figure 4: Conversational Data Analysis Flow*

The approach is Modular so that individual agents and tasks can be modified to have fine grained control over the overall performance and outcome.

Process supervision significantly outperforms outcome supervision. Thus, in DataAnalyzr flow, we maintain both synthetic supervision on the flow using agents and also with a human in the loop who can correct the intermittent steps to steer the model to the right/expected outcome.

### **Why are We Developing Automata, A New Agent Framework**

Developing an Agent from scratch can be tedious, time consuming and prone to failures. There is no established framework for developing scalable, performant and advanced GenAI agents for enterprise.

That is why, we at [Lyzr](https://lyzr.ai/) are developing [Lyzr Automata](https://www.youtube.com/watch?v=CauN4T5D-Cg), an agent framework incorporating all the best practices and learnings from building enterprise grade agents.

![Figure 5: Lyzr Automata Agent Framework](https://cdn-images-1.medium.com/max/1024/0*op7gknqgkWbTU40u)
*Figure 5: Lyzr Automata Agent Framework*

The agents built at Lyzr — DataAnalyzr, Knowledge Bot, RAG Bot, Voice Bot and more are being enhanced and integrated with Lyzr Automata and they fit elegantly with the entire Lyzr ecosystem.

Lyzr Automata is a multi-agent framework for process automation. You can create multiple agents running autonomously, and automate processes end to end.

It is an agent + task architecture where tasks can be executed parallelly to reduce latency

With Automata, our aim is to democratize flow engineering with a low code approach, while also making it powerful enough for power users to develop customized flows and agents to automate enterprise workloads with ease.

The Version 0.2 of Automata is out and it is open source. The code can be found on [GitHub](https://github.com/LyzrCore/lyzr-experimental-automata). Don’t forget to ⭐ the repo to show your support.
