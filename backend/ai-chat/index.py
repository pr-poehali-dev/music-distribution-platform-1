import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: AI-powered chat support using OpenAI GPT-4
    Args: event with httpMethod, body containing user message
          context with request_id
    Returns: HTTP response with AI answer
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        user_message: str = body_data.get('message', '')
        
        if not user_message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Message is required'})
            }
        
        openai_key = os.environ.get('OPENAI_API_KEY')
        
        if not openai_key:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'response': 'Спасибо за ваш вопрос! Наши специалисты скоро свяжутся с вами. В среднем время ответа — 5-10 минут.'
                })
            }
        
        import openai
        
        client = openai.OpenAI(api_key=openai_key)
        
        system_prompt = """Ты — ИИ-ассистент службы поддержки OLPROD, платформы дистрибуции музыки.

OLPROD помогает артистам:
- Публиковать музыку на 150+ платформах (Spotify, Apple Music, VK Музыка, Яндекс Музыка и др.)
- Отслеживать прослушивания и доход в реальном времени
- Выводить деньги от 100₽ на карту
- Создавать смартлинки для промо

Твоя задача:
1. Отвечать на вопросы о сервисе кратко и по делу
2. Помогать с загрузкой релизов, выводом средств, созданием смартлинков
3. Если не уверен — предложить обратиться в поддержку
4. Быть дружелюбным и профессиональным

Отвечай на русском языке, максимум 2-3 предложения."""

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        ai_response = completion.choices[0].message.content
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'response': ai_response})
        }
        
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'response': 'Спасибо за ваш вопрос! Наши специалисты скоро свяжутся с вами.'
            })
        }
