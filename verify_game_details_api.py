import requests
import json

# 使用之前日志中出现问题的比赛ID
GAME_ID = "8fbae369-43b1-404e-aece-9eaba4be7692"

# API的根地址 (根据项目已知信息推断)
BASE_URL = "https://risemobile-backend-83y7tbad.e2.run.app"

# 完整的API端点URL
API_URL = f"{BASE_URL}/api/v1/games/{GAME_ID}"

print(f"正在请求API: {API_URL}")

try:
    # 为了确保获取最新数据，不使用缓存
    headers = {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
    response = requests.get(API_URL, headers=headers)
    response.raise_for_status()  # 如果请求失败 (例如 404, 500), 则会抛出异常

    game_data = response.json()

    print("\n--- 验证结果 ---")
    print(f"比赛ID: {game_data.get('id')}")
    print(f"主队: {game_data.get('home_team_name')}")
    print(f"客队: {game_data.get('away_team_name')}")
    
    home_logo_url = game_data.get('home_team_logo_url')
    away_logo_url = game_data.get('away_team_logo_url')

    print(f"主队Logo URL: '{home_logo_url}'")
    print(f"客队Logo URL: '{away_logo_url}'")

    if not home_logo_url or not away_logo_url:
        print("\n[结论]: 至少有一个球队的Logo URL为空或不存在，后端问题得到验证。" )
    else:
        print("\n[结论]: 两个球队的Logo URL都存在。" )

except requests.exceptions.RequestException as e:
    print(f"\n请求API时发生错误: {e}")
except json.JSONDecodeError:
    print("\n无法解析API响应，请检查API是否返回了有效的JSON。" )