import random
import string


def genUniqueIdentifier(length: int) -> str:
    try:
        if length <= 10: raise Exception("Minimum 10 characters length")
        characters: str = str(string.ascii_uppercase) + str(string.ascii_lowercase) + str(string.digits)
        temp = random.sample(characters, length)
        return ''.join(temp)
    except Exception as error:
        print(f"[ERROR] genUniqueIdentifier: {error}")


# ret: str = genUniqueIdentifier(length=15)
# print(ret)