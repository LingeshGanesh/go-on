import ollama
import json
import redis
from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = redis.Redis(
    host='190.92.220.185',
    port=6379,
    password='barista12',
    decode_responses=True  # Optional: return strings instead of bytes
)

# Define strict, conversational-only personas by language
models = {
    "chinese_waiter": {
        "language": "Simplified Chinese",
        "system": """
你是上海的一名餐厅服务员，热情健谈，用自然的口语和顾客交谈。
你的回答必须完全是口语化的自然中文，不允许出现任何解释、翻译、括号（如（）或[]）、标注、多种说法或表情符号（如表情包、emoji）。
不要使用任何书面语言，也不要模仿网络语言。
无论用户说什么，只使用简体中文，并保持口语自然、真实。
        """.strip()
    },
    "malay_teacher": {
        "language": "Malay",
        "system": """
Anda seorang guru Bahasa Melayu dari Melaka yang lembut dan suka berbual dengan pelajar secara santai.
Jawapan anda mesti sepenuhnya dalam Bahasa Melayu lisan yang semula jadi — tanpa tanda kurung (seperti () atau []), tanpa penjelasan, tanpa terjemahan, tanpa emoji atau simbol.
Elakkan gaya bahasa bertulis atau rasmi.
Jika pelajar menggunakan Bahasa Inggeris, ingatkan mereka dengan sopan untuk bertutur dalam Bahasa Melayu, tetapi balas hanya dalam Bahasa Melayu lisan.
        """.strip()
    },
    "english_librarian": {
        "language": "English",
        "system": """
You're a quiet, thoughtful librarian from Oxford who prefers natural conversation over formal writing.
All responses must be purely verbal, natural spoken English — no parentheses, no alternative phrasings, no emojis, no symbols, no stage directions.
Never include explanations or write in a formal tone.
Sound like you're having a real conversation in person, not writing an article.
        """.strip()
    },
    "japanese_barista": {
        "language": "Japanese",
        "system": """
あなたは京都の静かなカフェで働く丁寧なバリスタです。
会話はすべて自然な日本語の口語で行ってください。
括弧（（）や[]）、説明、翻訳、別の言い回し、絵文字や記号などは絶対に使わないでください。
あくまで口で話しているように自然に返答してください。
書き言葉や説明的な口調ではなく、日常的なやりとりにしてください。
        """.strip()
    },
    "translate_en": {
        "language": "English",
        "system": """
You are a translator. 
You are in charge of translating any text that is sent from any language to English.
Never include any confirmation message and only send back the translated text.
        """.strip()
    }
}

# Create models if they don't already exist
for model_name, config in models.items():
    try:
        print(f"Checking model: {model_name}")
        ollama.show(model_name)
        print(f"✅ Model '{model_name}' already exists.")
    except Exception:
        print(f"🚧 Model '{model_name}' not found. Creating now...")
        ollama.create(
            model=model_name,
            from_='gemma3',
            system=config["system"]
        )
        print(f"✅ Created model '{model_name}' for {config['language']}.")



print("\n✅ All models checked or created.")

class Chat(BaseModel):
    uid: str
    model_name: str | None = "gemma3"
    message: str
    language: str

class Translate(BaseModel):
    text: str

class UserModel(BaseModel):
    uid: str
    model_uid: str

@app.post("/chat")
def get_chat_response(chat: Chat):
  print(chat.language)
  global client
  key = f"chat:{chat.uid}:{chat.language}"
  print(chat.uid)
  raw_messages = client.lrange(key, 0, -1)

  # Parse JSON
  parsed_messages = [json.loads(msg) for msg in raw_messages]

  response: ollama.ChatResponse = ollama.chat(model=chat.model_name, messages=[
    *parsed_messages,
    {
      'role': 'user',
      'content': chat.message,
    },
  ])

  user_msg = {'role': 'user', 'content': chat.message}
  assistant_msg = {'role': 'assistant', 'content': response.message.content}
  key = f"chat:{chat.uid}:{chat.language}"

  user_json_str = json.dumps(user_msg)
  print(user_json_str)
  client.rpush(key, user_json_str)
  assistant_json_str = json.dumps(assistant_msg)
  print(assistant_json_str)
  client.rpush(key, assistant_json_str)

  return {"response": response.message.content}

@app.post("/translate")
def get_translation(translate: Translate):
    response: ollama.ChatResponse = ollama.chat(model='translate_en', messages=[
        {
        'role': 'user',
        'content': translate.text,
        },
    ])

    return {"translatedText": response.message.content}

@app.get("/log")
def get_log(userModel: UserModel):
    key = f"chat:{userModel.uid}:{userModel.model_uid}"
    raw_messages = client.lrange(key, 0, -1)
    parsed_messages = [json.loads(msg) for msg in raw_messages]

    return {"parsedMessages": parsed_messages}