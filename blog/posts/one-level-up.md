---
title: One Level Up
date: 2026-11-16
description: The architecture behind VibeGrow.
layout: book
---

<figure class="plate"><img src="/img/blog/power-loom-1835.png" alt="Engraving of a weaving floor with rows of power looms driven from overhead shafts, and one overseer standing in the aisle" width="2400" height="1600"><figcaption>One overseer, a floor of machines.<small>Power loom weaving, <i>History of the Cotton Manufacture in Great Britain</i>, 1835</small></figcaption></figure>

Software has moved from punch cards → assembly → C → Python → English.

Engineers who used agents to write features and fix bugs now build systems that get agents to do those things autonomously. These systems are called software factories. Done for marketing, it is a marketing factory.

We build the business factory: agent swarms that run your business.

It's already happening in the market:

- Stripe: its agents merge [1,300+ pull requests a week](https://www.lennysnewsletter.com/p/how-stripe-built-minionsai-coding).
- Ramp: its background agent writes [about 75% of merged PRs](https://linear.app/customers/ramp).
- Shopify: its Slack agent River coauthors [1 in 8 merged pull requests](https://shopify.engineering/under-the-river).
- Klarna: runs marketing campaigns with AI, [cutting marketing spend by about $10 million a year](https://www.marketingdive.com/news/klarna-gen-ai-openai-cut-marketing-spend-efficiency/717332/).

Stripe, Ramp and Shopify each spent a platform team and many months building this in-house, on systems that took years.

Everyone else is still prompting one agent at a time. The bottleneck is starting the work and giving it the proper runtime, governance, access, tracking, and approval flow. That is what we build.

## Where the others stop

- Factory, Devin and Vorflux build engineering agents. They stop at code.
- Coder and the VM providers sell infrastructure. You still build the agents and the workflows.
- OpenAI, Anthropic and xAI ship AI teammates on their own models. A teammate helps your people do the work.
- Building in-house covers everything. It takes a platform team and months or years, as at Stripe and Ramp.

VibeGrow covers engineering and growth on one platform, with any model. The swarms already run the work, and we run our own businesses on them.

I wrote an in-depth guide on the architectures behind these agentic systems, the ones that power Grok Bot, Dot, Muse, Instinct, Duet and more.

The full architecture diagram: [vibegrow.io/blog/the-architecture-behind-vibegrow](https://vibegrow.io/blog/the-architecture-behind-vibegrow?v=2)
