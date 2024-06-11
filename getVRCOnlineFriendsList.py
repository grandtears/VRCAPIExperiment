# 要 pip install vrchatapi
import json
import time
import vrchatapi
from vrchatapi.api import authentication_api, friends_api
from vrchatapi.exceptions import UnauthorizedException
from vrchatapi.models.two_factor_auth_code import TwoFactorAuthCode

# VRChat APIの設定を行う
configuration = vrchatapi.Configuration(
    username = username,
    password = password,
)

# APIクライアントを作成し、ユーザーエージェントを設定する
api_client = vrchatapi.ApiClient(configuration)
api_client.user_agent = "MyApplicationName/1.0.0 (contact@example.com)"

# APIクライアントを使用してAPIにアクセスする
with api_client:
    # 認証APIのインスタンスを作成する
    auth_api = authentication_api.AuthenticationApi(api_client)

    try:
        # ユーザーを取得し、ログイン状態を確認する
        current_user = auth_api.get_current_user()
        print("Logged in as:", current_user.display_name)

        # フレンドAPIのインスタンスを作成する
        friends_api_instance = friends_api.FriendsApi(api_client)

        # オンラインのフレンドリストを取得する
        friend_list = friends_api_instance.get_friends(offline=False)
        print("Online Friends:")

        # 各オンラインフレンドの表示名を表示する
        for friend in friend_list:
            print(friend.display_name)

    except UnauthorizedException as e:
        if e.status == 401:
            print("Error: Invalid Username/Email or Password. Please check your credentials and try again.")
        elif e.status == 200:
            body = json.loads(e.body)
            if "requiresTwoFactorAuth" in body and "emailOtp" in body["requiresTwoFactorAuth"]:
                print("2FA required. Please check your email for the authentication code.")
                auth_code = input("Enter the authentication code from the email: ")
                # 2要素認証コードを検証する
                auth_api.verify2_fa(two_factor_auth_code=TwoFactorAuthCode(auth_code))
                current_user = auth_api.get_current_user()
                print("Logged in as:", current_user.display_name)

                friends_api_instance = friends_api.FriendsApi(api_client)
                friend_list = friends_api_instance.get_friends(offline=False)
                print("Online Friends:")
                for friend in friend_list:
                    print(friend.display_name)
                    time.sleep(1)  # 各リクエスト間に1秒の遅延を追加
            else:
                print("Exception when calling API: %s\n", e)
        else:
            print("Exception when calling API: %s\n", e)
    except vrchatapi.ApiException as e:
        if e.status == 429:  # Too Many Requests エラーの場合
            print("Too Many Requests. Retrying in 5 seconds...")
            time.sleep(5)  # 5秒待機してからリクエストを再試行
            # ここでリクエストを再試行する処理を追加する
        else:
            print("Exception when calling API: %s\n", e)