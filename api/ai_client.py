import os
import openai

OPENAI_API_KEY = os.environ.get('AIzaSyC669X-KXbkhO_wmm063q7sTSYJAaso4zY')
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

def simplify_and_structure(text: str) -> dict:
    if not OPENAI_API_KEY:
        sentences = text.split('.')[:6]
        summary = '.'.join([s.strip() for s in sentences if s.strip()]) + ('.' if sentences else '')
        structured_html = '<div>'+summary+'</div>'
        return {'summary': summary, 'structured_html': structured_html, 'plain_text': summary}
    prompt = f"Simplify and structure the following document for readability and accessibility. Provide a short plain-language summary (2-3 sentences), and give an HTML-friendly structured version with headings and lists.\n\nDocument:\n{text[:20000]}"
    resp = openai.ChatCompletion.create(
        model='gpt-4o-mini',
        messages=[{'role':'user','content':prompt}],
        max_tokens=800
    )
    out = resp['choices'][0]['message']['content']
    return {'summary': out[:600], 'structured_html': '<div>'+out+'</div>', 'plain_text': out}