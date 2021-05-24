import requests
import json


def sendMessage(chatId: int, msg: str) -> bool:
    try:
        URL: str = 'https://api.telegram.org/bot1269950674:AAHwPnDRU1bn3u6fVrEKtF-RLD12J_zNUek/sendMessage'
        payload: dict = {
            "chat_id": chatId,
            "text": msg 
        }
        headers: dict = {
            'content-type': 'application/json'
        }
        print(payload)
        ret = requests.post(url=URL, data=payload)
        print(ret.status_code)
        print(ret.reason)
        print(ret.text)
    except Exception as error:
        print(f"[ERROR] sendMessage: {error}")