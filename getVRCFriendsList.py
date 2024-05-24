import requests
from urllib.parse import quote
from dotenv import load_dotenv
import os

BASE_URL = "https://api.vrchat.cloud/api/1"
APIKEY = "JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26"

baseURL = "https://api.vrchat.cloud/api/1/"

# .envファイルを読み込む
load_dotenv()

# VCRhatのAuthCookieｗ取得する。
def get_vrchat_authcookie():
    # .envファイルを読み込む


    # ユーザー名とパスワードをURLエンコードする
    username = quote(os.getenv('VRCHAT_USERNAME').encode('utf-8'))
    password = quote(os.getenv('VRCHAT_PASSWORD').encode('utf-8'))

    data = {
        "apiKey": APIKEY
    }

    headers = {
        "User-Agent": "VRCX"
    }

    try:
        # リクエスト送信
        res = requests.get(f"{baseURL}auth/user",
                                data=data,
                                headers=headers,
                                auth=(username,password))
        print(res)

        res.raise_for_status()  # エラーがある場合は例外を発生させる

        # レスポンスからauthcookieを取得
        authcookie = res.cookies.get('auth')

        if authcookie:
            return authcookie
        else:
            print("authcookieの取得に失敗しました")
            return None

    except requests.exceptions.RequestException as e:
        print(f"リクエストエラー: {e}")
        return None

# 2段階認証を行う。
def f2a(cookie:str):
    f2acode = input("f2acode: ")

    headers = {
        "User-Agent": "VRCX"
    }

    res = requests.post(f"{baseURL}auth/twofactorauth/emailotp/verify",
                      headers=headers,
                      cookies={"auth": cookie},
                      json={"code": f2acode})
    print("f2a", res)

# フレンドリストの取得
def getFriendsList(authcookie):
    res = send(authcookie)

    # HTTPステータスコードが401の場合は2段階認証を行う
    if res.status_code == 401:
        f2a(authcookie)
        res = send(authcookie)

    return res

def send(authcookie):
    headers = {
        "User-Agent": "VRCX"
    }
    res = requests.get(f"{baseURL}auth/user/friends?offline=true",
                        headers=headers,
                        cookies={"auth": authcookie})
    print("friends", res)

    return res

#メイン関数
if __name__ == "__main__":
    authcookie = get_vrchat_authcookie()
    if authcookie:
        print(f"authcookie: {authcookie}")
        ret = getFriendsList(authcookie)
        print(ret.json())
    else:
        print("authcookieの取得に失敗しました")
