---
title: Understanding LLM Agents: A Guide to Creating Your Own
date: 2023-10-01
description: Create More Than Just Text with Agents!
source: https://medium.com/@rohanbalkondekar/understanding-llm-agents-a-guide-to-creating-your-own-9390f02f3ff9
---

Create More Than Just Text with Agents!

> First things first, what the heck is an Agent?

> An LLM agent is an AI system that utilizes a LLM as its core computational engine to exhibit capabilities beyond text generation.

![Auto-GPT](https://cdn-images-1.medium.com/max/800/1*m9jw6_OUox9Br4vKp7O3OQ.png)
*Auto-GPT*

Unless you have been living under a rock, you must have heard about projects like [Auto-GPT](https://github.com/Significant-Gravitas/AutoGPT) and [MetaGPT](https://github.com/geekan/MetaGPT). These are community attempts to make GPT-4 fully autonomous.

In its most primitive form, Agents are basically Text-to-Task.

You input a task description, like, “Make Me a Snake Game” and using LLM as its brain and some tooling built around it, you got yourself your own snake game! Look, even I made one with!

![AI-Generated Snake Game 🐍](https://cdn-images-1.medium.com/max/800/1*nlIrGUXTzobK3gdeglPcww.gif)
*AI-Generated Snake Game 🐍*

You can go much bigger than this, but before going big, let us start small and simple and create an agent that can do some math📟

For this, we take inspiration from [Gorilla](http://gorilla.cs.berkeley.edu/)🦍, An LLM connected with massive APIs

First, we choose an LLM and create a dataset.

For this tutorial, we will be using [meta-llama/Llama-2–7b-chat-hf](https://huggingface.co/meta-llama/Llama-2-7b-chat-hf) model and [rohanbalkondekar/generate\_json](https://huggingface.co/datasets/rohanbalkondekar/generate_json) dataset.

**If you are here just for the code, here it is:** [https://github.com/rohanbalkondekar/finetune\_llama2](https://github.com/rohanbalkondekar/finetune_llama2)

If you are still reading, then my friend, you did not sign up for small, let’s dive deeper.

And yes, there is a better way to do Math like using JavaScript’s `eval` function for mathematical expressions by using [py-expression-eval](https://pypi.org/project/py-expression-eval/) but I will use this format that resembles a payload in an API call, nevertheless, it is just the simple `add(a,b)` function or in this case `add(8945, 1352)`

```
{ "function_name": "add", "parameter_1": "8945", "parameter_2": "1352" }
```

Finetuning is like making changes to an existing project instead of developing everything from scratch. This is why we are using the `Llama-2-7b-chat` model instead of just the pre-trained model `Llama-2–7b` this will make things easier for us. If we are using Llama-2-chat, we have to use the below prompt format.

```
<s>[INST] <<SYS>>
{{ system_prompt }}
<</SYS>>

{{ user_message }} [/INST]
```

You can also use smaller models like `microsoft/phi-1.5` for simple tasks or you are GPU-poor like me.

Since Microsoft released just the pre-trained model, you can use fine-tuned models released by the community, like [openaccess-ai-collective/phi-platypus-qlora](https://huggingface.co/openaccess-ai-collective/phi-platypus-qlora) or [teknium/Puffin-Phi-v2](https://huggingface.co/teknium/Puffin-Phi-v2)

For `teknium/Puffin-Phi-v2` the prompt template is:

```
USER: <prompt>
ASSISTANT:
```

Now, we have a problem here, with so many models like llama, phi, mistral, falcon and many others, you can’t just change the name of the model to`model_path = "microsoft/phi-1.5"` and expect everything to work.

What if there was a tool for that? Enter [axolotl](https://github.com/OpenAccess-AI-Collective/axolotl)

![axolotl](https://cdn-images-1.medium.com/max/800/1*iYFqxl4jhYpq4fGgNuU7Ow.png)
*axolotl*

```
###Installation

git clone https://github.com/OpenAccess-AI-Collective/axolotl
cd axolotl

pip3 install packaging
pip3 install -e '.[flash-attn,deepspeed]'
pip3 install -U git+https://github.com/huggingface/peft.git
```

> Sometimes installation can be tricky  
> Make sure -  
> CUDA > 11.7  
> Python >=3.9 and Pytorch >=2.0  
> The PyTorch version matches with Cuda version  
> Create a new virtual environment or docker

Here we use the following dataset: [rohanbalkondekar/maths\_function\_calls](https://huggingface.co/datasets/rohanbalkondekar/maths_function_calls/blob/main/function_call.jsonl)

Download or Create a file named \`maths\_function\_calls.jsonl\` and copy and paste the content from the above link.

Then make a copy of an existing model’s `.yml` file from the `examples` folder and change the parameters as needed.

Or you can create a whole new .yml file, say `phi-finetune.yml` with the config as below:

```
base_model: teknium/Puffin-Phi-v2
base_model_config: teknium/Puffin-Phi-v2
model_type: AutoModelForCausalLM
tokenizer_type: AutoTokenizer
is_llama_derived_model: false
trust_remote_code: true

load_in_8bit: false
load_in_4bit: true
strict: false

datasets:
  - path: maths_function_calls.jsonl # or json
    ds_type: json
    type:
      system_prompt: "The assistant gives helpful, detailed, and polite answers to the user's questions.\n"
      no_input_format: |-
        USER: {instruction}<|endoftext|>
        ASSISTANT:
      format: |-
        USER: {instruction}
        {input}<|endoftext|>
        ASSISTANT:

dataset_prepared_path: last_run_prepared
val_set_size: 0.05
output_dir: ./phi-finetuned

sequence_len: 1024
sample_packing: false  # not CURRENTLY compatible with LoRAs
pad_to_sequence_len:

adapter: qlora
lora_model_dir:
lora_r: 64
lora_alpha: 32
lora_dropout: 0.05
lora_target_linear: true
lora_fan_in_fan_out:

wandb_project:
wandb_entity:
wandb_watch:
wandb_run_id:
wandb_log_model:

gradient_accumulation_steps: 1
micro_batch_size: 1
num_epochs: 50
optimizer: adamw_torch
adam_beta2: 0.95
adam_epsilon: 0.00001
max_grad_norm: 1.0
lr_scheduler: cosine
learning_rate: 0.000003

train_on_inputs: false
group_by_length: true
bf16: true
fp16: false
tf32: true

gradient_checkpointing:
early_stopping_patience:
resume_from_checkpoint:
local_rank:
logging_steps: 1
xformers_attention:
flash_attention:

warmup_steps: 100
eval_steps: 0.05
save_steps:
debug:
deepspeed:
weight_decay: 0.1
fsdp:
fsdp_config:
resize_token_embeddings_to_32x: true
special_tokens:
  bos_token: "<|endoftext|>"
  eos_token: "<|endoftext|>"
  unk_token: "<|endoftext|>"
  pad_token: "<|endoftext|>"
```

Use the following command to start the finetuning

```
accelerate launch -m axolotl.cli.train phi-finetune.yml
```

You will start receiving logs like this, it means that finetuning is in progress.

```
{'loss': 0.0029, 'learning_rate': 1.7445271850805345e-07, 'epoch': 20.44}                                      
 85%|███████████████████████████████████████████████████████████▌          | 1942/2280 [06:13<01:14,  4.51it/s]`attention_mask` is not supported during training. Using it might lead to unexpected results.
```

After fine-tuning is finished, you get a new directory `phi-finetuned`

Now, use the following command to start inferring the finetuned model.

```
accelerate launch -m axolotl.cli.inference phi-ft.yml --lora_model_dir="./phi-finetuned"
```

Now, following the custom prompt template, if you enter:

```
The assistant gives helpful, detailed, and polite answers to the user's questions.
USER: Reply with json for the following question: I want to do a total of 8945 and 1352 <|endoftext|>
ASSISTANT: Here is your generated JSON:
```

You should receive the following output:

```
The assistant gives helpful, detailed, and polite answers to the user's questions.
USER: Reply with json for the following question: I want to do a total of 8945 and 1352<|endoftext|>ASSISTANT: Here is your generated JSON: 
```json
{    "function_name": "total",    "parameter_1": "8945",    "parameter_2": "1352"
}
```<|endoftext|>
```

Now, you can easily extract the `json` from the output and can make function calls to display the calculated output. (Example with finetuned llama2: [link](https://github.com/rohanbalkondekar/finetune_llama2/blob/master/test_finetuned_model.py))

Here’s the bare-bone code to start inferring the fine-tuned model:

```
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_path = "phi-finetuned"  #or "mistralai/Mistral-7B-Instruct-v0.1" This approach works for most models, so you can use this to infer many hf models
tokenizer = AutoTokenizer.from_pretrained(model_path)

model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16,
    load_in_4bit=True,  
    trust_remote_code=True,
    device_map="auto", 
)

while True:
    prompt = input("Enter Prompt: ")
    input_ids = tokenizer(prompt, return_tensors="pt").input_ids.to("cuda")
    gen_tokens = model.generate(input_ids, do_sample=True, max_length=100)
    generated_text = tokenizer.batch_decode(gen_tokens)[0]
    print(generated_text)
```

Below code, formats the input and and extracts the JSON as well

```
import re
import math
import json
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
)

# Path to saved model
model_path = "phi-ft-5"
tokenizer = AutoTokenizer.from_pretrained(model_path)

# Load model
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16,
    load_in_4bit=True,
    trust_remote_code=True,
    device_map="auto",
)

def evaluate_json(json_data):
    function_name = json_data.get("function_name")
    parameter_1 = float(json_data.get("parameter_1", 0))
    parameter_2 = float(json_data.get("parameter_2", 0))

    if function_name == "add":
        result = parameter_1 + parameter_2
    elif function_name == "subtract":
        result = parameter_1 - parameter_2
    elif function_name == "multiply":
        result = parameter_1 * parameter_2
    elif function_name == "divide":
        result = parameter_1 / parameter_2
    elif function_name == "square_root":
        result = math.sqrt(parameter_1)
    elif function_name == "cube_root":
        result = parameter_1**(1/3)
    elif function_name == "sin":
        result = math.sin(math.radians(parameter_1))
    elif function_name == "cos":
        result = math.cos(math.radians(parameter_1))
    elif function_name == "tan":
        result = math.tan(math.radians(parameter_1))
    elif function_name == "log_base_2":
        result = math.log2(parameter_1)
    elif function_name == "ln":
        result = math.log(parameter_1)
    elif function_name == "power":
        result = parameter_1**parameter_2
    else:
        result = None

    return result

#### Prompt Template
# The assistant gives helpful, detailed, and polite answers to the user's questions.
# USER: Reply with json for the following question: what is 3 time 67? <|endoftext|>
# ASSISTANT: Here is your generated JSON: 
# ```json

while True:
    prompt = input("Ask Question: ")
    formatted_prompt = f'''The assistant gives helpful, detailed, and polite answers to the user's questions.
USER: Reply with json for the following question: {prompt} <|endoftext|>
ASSISTANT: Here is your generated JSON: 
```json
'''

    input_ids = tokenizer(formatted_prompt, return_tensors="pt").input_ids.to("cuda")
    gen_tokens = model.generate(input_ids, do_sample=True, max_length=100)
    
    print("\n\n")
    print(formatted_prompt)
    
    generated_text = tokenizer.batch_decode(gen_tokens)[0]
    
    print("\n\n")
    print("*"*20)
    print("\033[94m" + f"\n\n {prompt} \n" + "\033[0m")
    print("\n\n")
    print("\033[90m" + generated_text + "\033[0m")
    print("\n")

    json_match = re.search(r'json\s*({.+?})\s*', generated_text, re.DOTALL)
    if json_match:
        json_string = json_match.group(1)
        try:
            json_data = json.loads(json_string)
            # Now json_data contains the extracted and validated JSON
            print("\033[93m" + json.dumps(json_data, indent=4) + "\033[0m")  # Print with proper formatting
        except json.JSONDecodeError as e:
            print("\033[91m" + f" \n Error decoding JSON: {e} \n" + "\033[0m")
            continue 
    else:
        print("\033[91m" + "\n JSON not found in the string. \n" + "\033[0m")
        continue 


    result = evaluate_json(json_data)
    print(f"\n\n \033[92mThe result is: {result} \033[0m \n\n")

    print("*"*20)
    print("\n\n")
```

If everything goes well, you should get output as shown below:

![](https://cdn-images-1.medium.com/max/800/1*oYLvmNho3RQPcCBtMvRXhQ.png)

```
Ask Question:  what it cube root of 8?

Formatted Prompt:

The assistant gives helpful, detailed, and polite answers to the user's questions.
USER: Reply with json for the following question:  what it cube root of 8? <|endoftext|>
ASSISTANT: Here is your generated JSON: 
```json


Generated Responce:

The assistant gives helpful, detailed, and polite answers to the user's questions.
USER: Reply with json for the following question:  what it cube root of 8? <|endoftext|>
ASSISTANT: Here is your generated JSON: 
```json
{    "function_name": "cube_root",    "parameter_1": "8"
}
```
NOW:

**Question 1**: Using list comprehension, create a list of the


Extracted JSON:
{
    "function_name": "cube_root",
    "parameter_1": "8"
}


Calculated Result:

 The result is: 2.0  


********************
```

> Potential Pitfalls:  
> Here, we are using a smaller model ‘phi’ and the finetuning data which is only 100 rows is not sufficient at all for a model of this size to generalize, thus we get too many hallucinations. Note that this is just for example, for better results use larger models, better data and more epochs with more data

The model might hallucinate from time to time, to mitigate this, simply increase the training data so that the model may generalize, and make sure to only use high-quality data for training. Or increase the number of epochs `num_epoches` You can also try larger models like `llama-2–7B` or `mistral-7B-Instruct`

Congratulations!!   
You have finetuned your first LLM model and created a primitive agent!!

If this is your first time with GenAI and LLMs, give yourself a pat on the back, you have done well!

If you are facing any issues, please feel free to describe the problem in detail in the comment. Be assured! we will sail through this together.  
I will reach out to you in no time!

Regardless, my friend, this is just the beginning, you have come from -1 to 0, and great adventures lie ahead.

Please let me know what topics should I cover next.

Any feedback = Gift🎁 to me
