---
title: Streaming OpenAI completions
date: 2024-01-20
description: How to stream OpenAI chat completions token by token in Python, compared with a normal call.
source: https://medium.com/@rohanbalkondekar/streaming-openai-completions-4d6db3c21191
---

![cool-image-for-effect](https://cdn-images-1.medium.com/max/800/1*UidTfVAqY0GETTyRlOFKsA.png)
*cool-image-for-effect*

This is how you stream OpenAI completions:

```
import sys
import openai

client = openai.OpenAI(api_key="sk-")

messages=[
  {"role": "system", "content": "you are a math professor"},
  {"role": "user", "content": "count to 10"},
]

completion = client.chat.completions.create(
    model='gpt-3.5-turbo',
    messages=messages,
    temperature=0,
    stream=True  
)

for chunk in completion:
    content = chunk.choices[0].delta.content
    if content is not None:
        sys.stdout.write(content)
        sys.stdout.flush()
```

This is how you do it normally (without streaming)

```
messages=[
  {"role": "system", "content": system_prompt},
  {"role": "user", "content": user_prompt},
]

completion = client.chat.completions.create(
  model="gpt-4-1106-preview",
  messages=messages,
)

print(completion.choices[0].message.content)
```

To stream the output, we set `strean=True`

Then you loop through each of the completion tokens

```
for chunk in completion:
        sys.stdout.write(chunk.choices[0].delta.content)
        sys.stdout.flush()
```

We are writing the `content` to `sys.stdout` (which is typically the console) and manually flush the output buffer. `sys.stdout.write` is a lower-level function for writing to standard output, and `sys.stdout.flush` ensures that the text is actually sent out to the terminal immediately.

You can even just print the chunks

```
for chunk in completion:
        print(chunk.choices[0].delta.content, end="")
```

it will print something like this

```
1, 2, 3, 4, 5, 6, 7, 8, 9, 10None
```

The loop throws a `TypeError` when used with `sys.stdout.write`at the end of the completion. It prevents your program from trying to write \`None\` to \`sys.stdout\`, which throws a \`TypeError\` as \`sys.stdout.write\` expects a string as its argument.

Thus we add a check to check if we are getting output or None

```
    content = chunk.choices[0].delta.content
    if content is not None:
```

then we

```
      sys.stdout.write(content)
```

or you can just print them

```
for chunk in completion:
    content = chunk.choices[0].delta.content
    if content is not None:
        print(content, end="")
```

\`sys.stdout.write\` can be faster in certain scenarios as it does not have the overhead of the \`print\` function, which handles multiple arguments, string formatting, and appending newline characters.

choosing one over the other probably won’t make a significant difference for the given task, as you are simply outputting text to the console. It’s often a matter of personal or project-specific coding standards. If readability and simplicity are your main concerns, you might prefer \`print(content, end=””)\`. If you are after performance and explicit control over buffering, then \`sys.stdout.write\` with \`sys.stdout.flush\` would be the way to go.
