---
title: Finetuning LLMs For Text-to-Task
date: 2023-10-15
description: Fine-tune a small LLM to turn messy banking requests into structured API calls, a cheaper alternative to RAG.
source: https://medium.com/@rohanbalkondekar/finetuning-llms-for-text-to-task-c04374454ac0
---

![Banking Text-to-Task](https://cdn-images-1.medium.com/max/800/1*T8nHF59AE2oy3fYWtjCvPA.jpeg)
*Banking Text-to-Task*

`User: My savings account balance plz   Assistant: {"action" : "account_balance", "type" : "savings" }`   
`system: Your Savings Account balance is $5501`

It also works for `User: savn ac bal` so it does not matter in what way the user requests something or in what context, we can accurately detect the intent and make thousands of function calls or answer FAQs.

This is much Better and Cheaper than using RAG with Foundational models or vendors like OpenAI.

This is what we are going to build here.   
It is an extension of my [previous article](https://medium.com/@rohanbalkondekar/understanding-llm-agents-a-guide-to-creating-your-own-9390f02f3ff9)

We will be finetuning the LLM with below five APIs on [this dataset](https://huggingface.co/datasets/rohanbalkondekar/bank_function_calls)

```
// When the user asks for account balance without specifying the account type
// Example: What is my current account balance?
{"action": "account_balance", "type": "default"}

// When the user asks for the account balance in his checking account
// Example: What's the balance in my checking account?
{"action": "account_balance", "type": "checking"}

// When the user asks for the account balance in his savings account
// Example: What's the balance in my savings account?
{"action": "account_balance", "type": "savings"}

// When the user asks for an account statement without specifying any date range
// Example: I need my account statement.
{"action": "account_statement", "type": "default"}

// When the user asks for an account statement with a specified date range
// Example: Show me my statement from September 10th, 2023 to September 15th, 2023.
{"action": "account_statement", "type": "custom", "start_date": "10/09/2023", "end_date": "15/09/2023" }
```

We will be using [axolotl](https://github.com/OpenAccess-AI-Collective/axolotl) as usual.   
With the below Config File that finetunes with QLoRA.

The Model that we are using is: `[Open-Orca/Mistral-7B-OpenOrca](https://huggingface.co/Open-Orca/Mistral-7B-OpenOrca)`   
The chat format corresponding to the same can be used with type: `alpaca_chat.load_chatml` You can use the same with the latest [HuggingFaceH4/zephyr-7b-alpha](https://huggingface.co/HuggingFaceH4/zephyr-7b-alpha)

```
base_model: Open-Orca/Mistral-7B-OpenOrca
base_model_config: Open-Orca/Mistral-7B-OpenOrca
model_type: MistralForCausalLM
tokenizer_type: LlamaTokenizer
is_mistral_derived_model: true

load_in_8bit: false
load_in_4bit: true
strict: false

datasets:
  - path: data.jsonl
    ds_type: json
    type: alpaca_chat.load_chatml

dataset_prepared_path: last_run_prepared
val_set_size: 0.01
output_dir: ./finetuned-model

adapter: qlora

sequence_len: 256
sample_packing: True
pad_to_sequence_len: True

lora_r: 32
lora_alpha: 16
lora_dropout: 0.05
lora_target_linear: true
lora_fan_in_fan_out:
lora_target_modules:
  - gate_proj
  - down_proj
  - up_proj
  - q_proj
  - v_proj
  - k_proj
  - o_proj

#Optionally use Weights & Biases for tracking
wandb_project: bank_function_calls

gradient_accumulation_steps: 1
micro_batch_size: 1
num_epochs: 3
optimizer: adamw_bnb_8bit
lr_scheduler: cosine
learning_rate: 0.000005

train_on_inputs: false
group_by_length: false
bf16: true
fp16: false
tf32: false

gradient_checkpointing: true
logging_steps: 1
flash_attention: true

warmup_steps: 10
eval_steps: 25
eval_table_size: 5
eval_table_max_new_tokens: 128
weight_decay: 0.0
special_tokens:
  bos_token: "<s>"
  eos_token: "</s>"
  unk_token: "<unk>"
```

Helpful commands

```
# To Begin Finetuning accelerate launch -m axolotl.cli.train ./path/to/config.yml
accelerate launch -m axolotl.cli.train mistral-orca-config.yml

# For inferencing the Finetuned Model
accelerate launch -m axolotl.cli.inference mistral-orca-config.yml --sample_packing False

# For viewing the Prepared Prompts on which the model is being finetuned on
accelerate launch -m axolotl.cli.train mistral-orca-config.yml --debug_text_only --debug

# Use Flag --prepare_ds_only to also see the corresponding tokens
accelerate launch -m axolotl.cli.train mistral-orca-config.yml --prepare_ds_only --debug

# Merge LoRA with base model
python3 -m axolotl.cli.merge_lora mistral-orca-config.yml --lora_model_dir="./finetuned-model" --load_in_8bit=False --load_in_4bit=False
```

Customize the `system_prompt` used for finetuning in `src/axolotl/prompt_strategies/alpa_chat.py`

After Finetuning is completed, you can use `Flask` and `Python` to set up the backend. We are using `[Jsonformer](https://github.com/1rgs/jsonformer)` for `Constraint-based Sampling` so that we can generate `JSON` reliably. There are better alternatives, like [llama.cpp/grammars](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md) that provide more flexibility.

```
import json
import torch
from flask_cors import CORS
from jsonformer import Jsonformer
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig

app = Flask(__name__)
CORS(app)


model_path = "./finetuned-model"
tokenizer = AutoTokenizer.from_pretrained(model_path, padding_side='left')

model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16,
    load_in_4bit=True,
    trust_remote_code=True,
    device_map="auto",
)

def model_response(user_prompt):
    prompt = f'''<|im_start|>system
You are an AI Bank assistant who generates JSON based on user requests.

<|im_end|>
<|im_start|>user
{user_prompt}<|im_end|>
<|im_start|>assistant
'''
    
    json_schema = {
        "type": "object",
        "properties": {
            "action": {"type": "string"},
            "type": {"type": "string"},
        }
    }

    jsonformer = Jsonformer(model, tokenizer, json_schema, prompt)
    generated_data = jsonformer() 
    
    if generated_data["action"] == "account_balance":
        return generated_data
    elif generated_data["action"] == "account_statement" and generated_data["type"] == "default":
        return generated_data
    elif generated_data["action"] == "account_statement" and generated_data["type"] == "custom":
        json_schema = {
        "type": "object",
        "properties": {
            "action": {"type": "string"},
            "type": {"type": "string"},
            "start_date": {"type": "string"},
            "end_date": {"type": "string"},
        }
    }
        jsonformer = Jsonformer(model, tokenizer, json_schema, prompt)
        generated_data = jsonformer()
        return generated_data

    elif generated_data["action"] == "disable_debit_card":
        json_schema = {
        "type": "object",
        "properties": {
            "action": {"type": "string"},
            "type": {"type": "string"},
            "last_digits": {'type': 'integer'},
            "reason": {"type": "string"},
        }
    }
        jsonformer = Jsonformer(model, tokenizer, json_schema, prompt)
        generated_data = jsonformer()
        return generated_data
      
    return generated_data

@app.route('/generate', methods=['POST'])
def generate_text():
    data = request.get_json()
    prompt = data['prompt']

    model_generated_text = model_response(prompt)
    print(f"model_generated_text: {model_generated_text}")
    response_format = {"generated_text": model_generated_text}
    return jsonify(response_format)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

`POST` at [http://127.0.0.1:5000](http://127.0.0.1:5000) with the body

```
{
    "prompt": "savings account bal"
}
```

And you should get

```
{
    "generated_text": {
        "action": "account_balance",
        "type": "savings"
    }
}
```

Another Example:

```
{
  "prompt": "statement from 10 sept 2023 and 15 sept 2023 "
}
```

```
{
    "generated_text": {
        "action": "account_statement",
        "type": "custom",
        "end_date": "15/09/2023",
        "start_date": "10/09/2023"
     }
}
```

That’s it my friend, you have finetuned a LLM for function calling!

Connect it to a backend that stores user data so that it can respond to the function calls that the LLM generated and Modify it to whatever use case you like!

My Finetuned Model: [rohanbalkondekar/MistralOrca-7B-BankingSupport](https://huggingface.co/rohanbalkondekar/MistralOrca-7B-BankingSupport)  
You can see the code here: [rohanbalkondekar/axolotl](https://github.com/rohanbalkondekar/axolotl/tree/main/new_model) on GitHub
