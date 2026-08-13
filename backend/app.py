import os
import time
import json
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from algorithm import calculate_bsi
from datetime import datetime, timedelta

import firebase_admin
from firebase_admin import credentials, firestore, auth

# 1. CREATE THE APP FIRST! (This fixes the NameError)
load_dotenv()
app = Flask(__name__)
CORS(app)

# 2. INITIALIZE FIREBASE SECOND!
service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")

if service_account_json:
    try:
        cred_dict = json.loads(service_account_json)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized successfully using Environment Variables.")
    except Exception as e:
        print(f"Error initializing Firebase from Env Var: {e}")
else:
    if os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred)
        print("Firebase initialized using local serviceAccountKey.json.")
    else:
        print("Warning: Firebase credentials not found!")

# 3. SET UP DATABASE & CACHE
db = firestore.client()
tide_cache = {}

# -----------------
# YOUR BEACH LOCATIONS AND ROUTES GO BELOW THIS LINE!
# -----------------

# 🔥 ---------------------------
# ✅ CACHE STORAGE (NEW)
# ---------------------------
tide_cache = {}

# 🔥 ---------------------------
# ✅ CACHING FUNCTION (NEW)
# ---------------------------
def get_tide_cached(lat, lon):
    key = f"{lat},{lon}"
    current_time = time.time()

    # If data exists and is less than 1 hour old
    if key in tide_cache:
        cached_data, timestamp = tide_cache[key]
        if current_time - timestamp < 3600:  # 1 hour
            return cached_data

    # Otherwise call API
    tide_key = os.getenv("TIDES_API_KEY")
    url = f"https://www.worldtides.info/api/v3?heights&lat={lat}&lon={lon}&key={tide_key}"
    
    response = requests.get(url)
    data = response.json()

    if "heights" in data:
        tide_height = data["heights"][-1]["height"]
    else:
        print("Tide API failed:", data)
        tide_height = 1.0  # fallback (no crash)

    # Save in cache
    tide_cache[key] = (tide_height, current_time)

    return tide_height

# -----------------
#  BEACH "DATABASE" (WITH YOUR 22 IMAGE URLs)
# -----------------
DEFAULT_IMAGE = "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
BEACH_LOCATIONS = {
    "baga beach": {"lat": 15.5582, "lon": 73.7523, "city": "Goa", "image_url": "https://images.unsplash.com/photo-1757702244726-00198554c4a0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFnYSUyMGJlYWNoJTIwZ29hfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=1000"},
    "calangute beach": {"lat": 15.5485, "lon": 73.7629, "city": "Goa", "image_url": "https://images.unsplash.com/photo-1597820334272-af87b2d917c1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FsYW5ndXRlJTIwYmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"},
    "palolem beach": {"lat": 15.0099, "lon": 74.0237, "city": "Goa", "image_url": "https://plus.unsplash.com/premium_photo-1697729701846-e34563b06d47?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHBhbG9sZW0lMjBiZWFjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"},
    "goa": {"lat": 15.3173, "lon": 74.1240, "city": "Goa", "image_url": "https://images.unsplash.com/photo-1757702244726-00198554c4a0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFnYSUyMGJlYWNoJTIwZ29hfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=1000"},
    "juhu beach": {"lat": 19.1072, "lon": 72.8263, "city": "Mumbai", "image_url": "https://images.unsplash.com/photo-1710144481132-b1702639d4e7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8anVodSUyMGJlYWNofGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"},
    "tarkarli beach": {"lat": 16.0359, "lon": 73.4795, "city": "Tarkarli", "image_url": "https://images.unsplash.com/photo-1672567004357-7dd4f4ed8663?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGFya2FybGklMjBiZWFjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"},
    "ganpatipule beach": {"lat": 17.1472, "lon": 73.2687, "city": "Ganpatipule", "image_url": "https://images.unsplash.com/photo-1616477145655-d30b1ec7882f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FucGF0aXB1bGUlMjBiZWFjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"},
    "mumbai": {"lat": 19.0760, "lon": 72.8777, "city": "Mumbai", "image_url": "https://images.unsplash.com/photo-1710144481132-b1702639d4e7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8anVodSUyMGJlYWNofGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"},
    "kovalam beach": {"lat": 8.3999, "lon": 76.9789, "city": "Kochi", "image_url": "https://images.unsplash.com/photo-1593206216275-2408d30438cc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8a292YWx1bSUyMGJlYWNoJTIwa2VybGF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"}, 
    "varkala beach": {"lat": 8.7371, "lon": 76.7128, "city": "Varkala", "image_url": "https://images.unsplash.com/photo-1708149733421-cc9159810869?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dmFya2FsYSUyMGJlYWNofGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"},
    "marari beach": {"lat": 9.6009, "lon": 76.3134, "city": "Mararikulam", "image_url": "https://images.unsplash.com/photo-1621680860205-c476fb092ad4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFyYXJpJTIwYmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"},
    "marina beach": {"lat": 13.0475, "lon": 80.2826, "city": "Chennai", "image_url": "https://images.unsplash.com/photo-1642474620291-e8b1f92438a6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWFyaW5hJTIwYmVhY2glMjBtdW1iYWl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"},
    "mahabalipuram beach": {"lat": 12.6174, "lon": 80.1983, "city": "Mahabalipuram", "image_url": "https://images.unsplash.com/photo-1708637570263-2a630ffa485e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFoYWJhbGlwdXJhbSUyMGJlYWNofGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"},
    "kanyakumari beach": {"lat": 8.0883, "lon": 77.5385, "city": "Kanyakumari", "image_url": "https://plus.unsplash.com/premium_photo-1697730420879-dc2a8dbaa31f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8a2FueWFrdW1hcml8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"},
    "auroville beach": {"lat": 11.9678, "lon": 79.8407, "city": "Puducherry", "image_url": "https://images.unsplash.com/photo-1709739995392-d5e2defb95ea?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXVyb3ZpbGxlJTIwYmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600"},
    "gokarna beach": {"lat": 14.5479, "lon": 74.3168, "city": "Gokarna", "image_url": "https://images.unsplash.com/photo-1554787990-fd7a431e3b0a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z29rYXJuYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"},
    "om beach": {"lat": 14.5323, "lon": 74.3204, "city": "Gokarna", "image_url": "https://images.pexels.com/photos/5439373/pexels-photo-5439373.jpeg"}, 
    "puri beach": {"lat": 19.8049, "lon": 85.8282, "city": "Puri", "image_url": "https://images.unsplash.com/photo-1588137769937-382684e3d7a8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHVyaSUyMHNlYSUyMGJlYWNoJTIwcHVyaSUyMGluZGlhfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600"}, 
    "digha beach": {"lat": 21.6253, "lon": 87.5250, "city": "Digha", "image_url": "https://images.pexels.com/photos/2373201/pexels-photo-2373201.jpeg"}, 
    "mandarmani beach": {"lat": 21.6582, "lon": 87.6713, "city": "Mandarmani", "image_url": "https://images.pexels.com/photos/3601421/pexels-photo-3601421.jpeg"}, 
    "chandipur beach": {"lat": 21.4646, "lon": 87.0264, "city": "Chandipur", "image_url": "https://images.pexels.com/photos/2611810/pexels-photo-2611810.jpeg"}, 
    "radhanagar beach": {"lat": 11.9840, "lon": 92.9370, "city": "Havelock Island", "image_url": "https://images.pexels.com/photos/1486974/pexels-photo-1486974.jpeg"},
}
BLUE_FLAG_BEACHES = ["puri beach", "kovalam beach", "gokarna beach", "radhanagar beach"]


# --- Weather Route (FIXED) ---
@app.route('/weather/<city>')
def get_weather(city):
    api_key = os.getenv("OPENWEATHER_API_KEY")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    response = requests.get(url)
    return jsonify(response.json())

# --- FUTURE FORECAST ROUTE (LAT/LON BASED 🔥) ---
@app.route('/forecast/<beach>')
def get_forecast(beach):
    search_key = beach.lower()

    location_data = BEACH_LOCATIONS.get(search_key)
    if not location_data:
        return jsonify({"error": "Beach not found"}), 404

    lat = location_data["lat"]
    lon = location_data["lon"]

    weather_key = os.getenv("OPENWEATHER_API_KEY")

    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={weather_key}&units=metric"
    
    response = requests.get(url)
    data = response.json()

    forecast_list = []

    try:
        for item in data["list"][:5]:  # next 5 time slots (~15 hours)
            temp = item["main"]["temp"]
            wind = item["wind"]["speed"] * 3.6
            rain = item.get("rain", {}).get("3h", 0)

            # simple tide fallback (same as before)
            tide_height = 1.0

            result = calculate_bsi(temp, wind, rain, tide_height)

            forecast_list.append({
                "time": item["dt_txt"],
                "temp": round(temp, 1),
                "wind": round(wind, 1),
                "rain": rain,
                "bsi": result["bsi_score"],
                "rating": result["rating"]
            })

        return jsonify(forecast_list)

    except Exception as e:
        print("Forecast error:", e)
        return jsonify([])

# --- SMART FUTURE PREDICTION ---
@app.route('/predict', methods=['GET'])
def predict():
    beach = request.args.get('beach')
    user_time = request.args.get('datetime')

    # 1. Check for missing query parameters
    if not beach or not user_time:
        return jsonify({"error": "Missing input parameters. 'beach' and 'datetime' are required."}), 400

    search_key = beach.lower()
    location_data = BEACH_LOCATIONS.get(search_key)

    if not location_data:
        return jsonify({"error": f"Beach '{beach}' not found."}), 404

    lat = location_data["lat"]
    lon = location_data["lon"]
    weather_key = os.getenv("OPENWEATHER_API_KEY")

    # 2. Supported date formats (handles 12-hr AM/PM, 24-hr, and HTML5 inputs)
    date_formats = [
        "%Y-%m-%d %H:%M",      # 2026-08-14 18:11
        "%d-%m-%Y %I:%M %p",   # 14-08-2026 06:11 PM
        "%d-%m-%Y %H:%M",      # 14-08-2026 18:11
        "%Y-%m-%dT%H:%M",      # 2026-08-14T18:11 (HTML5 datetime-local)
        "%Y-%m-%d %H:%M:%S"    # 2026-08-14 18:11:00
    ]

    user_dt = None
    for fmt in date_formats:
        try:
            user_dt = datetime.strptime(user_time.strip(), fmt)
            break
        except ValueError:
            continue

    if not user_dt:
        return jsonify({"error": "Invalid date format. Received: " + str(user_time)}), 400

    # 3. Date range validation
    now = datetime.now()
    if user_dt <= now:
        return jsonify({"error": "⚠️ Please select a future time"}), 400

    if user_dt > now + timedelta(days=7):
        return jsonify({"error": "⚠️ Only 7-day prediction available"}), 400

    # 4. Fetch OpenWeather forecast data
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={weather_key}&units=metric"
    
    try:
        response = requests.get(url)
        data = response.json()
    except Exception as e:
        return jsonify({"error": "Failed to connect to weather API"}), 500

    # Safety check if OpenWeather API returned an error or bad key response
    if "list" not in data:
        return jsonify({"error": data.get("message", "Weather data unavailable")}), 400

    # 5. Find the closest forecast interval
    closest = None
    min_diff = float('inf')

    for item in data["list"]:
        forecast_time = datetime.strptime(item["dt_txt"], "%Y-%m-%d %H:%M:%S")
        diff = abs((forecast_time - user_dt).total_seconds())

        if diff < min_diff:
            min_diff = diff
            closest = item

    if not closest:
        return jsonify({"error": "No matching forecast data found"}), 404

    # 6. Process metrics & calculate BSI
    temp = closest["main"]["temp"]
    wind = closest["wind"]["speed"] * 3.6  # Convert m/s to km/h
    rain = closest.get("rain", {}).get("3h", 0)
    tide_height = 1.0  # Baseline tide default

    result = calculate_bsi(temp, wind, rain, tide_height)

    # 7. Return JSON response
    return jsonify({
        "time": closest["dt_txt"],
        "temp": round(temp, 1),
        "wind": round(wind, 1),
        "rain": rain,
        "bsi": result["bsi_score"],
        "rating": result["rating"]
    })

# --- Tide Route (FIXED) ---
@app.route('/tide/<lat>/<lon>')
def get_tide(lat, lon):
    api_key = os.getenv("TIDES_API_KEY")
    if not api_key:
        return jsonify({"error": "Missing Tides API key"}), 500
    url = f"https://www.worldtides.info/api/v3?heights&lat={lat}&lon={lon}&key={api_key}"
    response = requests.get(url)
    data = response.json()
    if "heights" in data:
        latest_tide = data["heights"][-1]
        return jsonify({"timestamp": latest_tide["dt"], "tide_height": latest_tide["height"]})
    else:
        return jsonify({"error": "No tide data found", "details": data})

# --- BSI Route (FINAL WITH CACHING + ADVICE 🔥) ---
@app.route('/bsi')
def get_bsi():
    beach_name = request.args.get('beach')
    if not beach_name:
        return jsonify({"error": "Please provide a beach name."}), 400

    search_key = beach_name.lower()
    location_data = BEACH_LOCATIONS.get(search_key)
    
    if not location_data:
        return jsonify({"error": f"Sorry, we don't have data for '{beach_name}'."}), 404

    search_key = beach_name.lower()
    location_data = BEACH_LOCATIONS.get(search_key)
    
    if not location_data:
        return jsonify({"error": f"Sorry, we don't have data for '{beach_name}'."}), 404
    lat = location_data["lat"]
    lon = location_data["lon"]
    is_blue_flag = search_key in BLUE_FLAG_BEACHES
    image_url = location_data.get("image_url", DEFAULT_IMAGE)
    
    weather_key = os.getenv("OPENWEATHER_API_KEY")

    # (Get Weather)
    weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={weather_key}&units=metric"
    weather_data = requests.get(weather_url).json()
    
    if "coord" not in weather_data:
        return jsonify({"error": "Weather data not found"}), 404

    temp = weather_data["main"]["temp"]
    wind = weather_data["wind"]["speed"] * 3.6
    rain = weather_data.get("rain", {}).get("1h", 0)
    weather_icon = weather_data["weather"][0]["icon"] if "weather" in weather_data else "01d"

    # 🔥 (Get Tide using CACHE)
    tide_height = get_tide_cached(lat, lon)

    # 🔥 (Calculate BSI + Advice)
    result = calculate_bsi(temp, wind, rain, tide_height)

    # (Average Rating Calculation)
    categories = ["cleanliness", "accessibility", "washrooms", "food", "transport", "crowdLevel", "parking", "familyFriendly", "waterSports"]
    sums = {key: 0 for key in categories}
    counts = {key: 0 for key in categories}
    average_ratings = {key: 0 for key in categories}

    try:
        reviews_ref = db.collection('reviews').where('beachName', '==', beach_name.title())
        docs = reviews_ref.stream()
        reviews_list = [doc.to_dict() for doc in docs]
        total_reviews = len(reviews_list)

        average_ratings["totalReviews"] = total_reviews

        if total_reviews > 0:
            for review in reviews_list:
                for key in categories:
                    if key in review and isinstance(review[key], (int, float)):
                        sums[key] += review[key]
                        counts[key] += 1

            total_sum = 0
            total_count = 0

            for key in categories:
                if counts[key] > 0:
                    avg = round(sums[key] / counts[key], 1)
                    average_ratings[key] = avg
                    total_sum += avg
                    total_count += 1
                else:
                    average_ratings[key] = 0

            if total_count > 0:
                average_ratings["overallCommunityRating"] = round(total_sum / total_count, 1)
            else:
                average_ratings["overallCommunityRating"] = 0

    except Exception as e:
        print(f"Error calculating average ratings: {e}")
        average_ratings["totalReviews"] = 0
        average_ratings["overallCommunityRating"] = 0

    return jsonify({
        "city": beach_name.title(),
        "lat": lat,
        "lon": lon,
        "temperature": temp,
        "wind_speed": round(wind, 2),
        "rain_mm": rain,
        "tide_height_m": tide_height,
        "bsi_score": result["bsi_score"],
        "rating": result["rating"],
        "advice": result["advice"],  # 🔥 NEW FIELD
        "is_blue_flag": is_blue_flag,
        "average_ratings": average_ratings,
        "image_url": image_url,
        "weather_icon": weather_icon
    })

# --- Leaderboard Route (FINAL WITH CACHING 🔥) ---
@app.route('/leaderboard')
def get_leaderboard():
    leaderboard_beaches = list(BEACH_LOCATIONS.keys())
    results = []
    
    for beach_name in leaderboard_beaches:
        beach_display_name = beach_name.title()
        try:
            # ✅ FIX 1: remove .lower()
            location_data = BEACH_LOCATIONS.get(beach_name)
            if not location_data:
                continue 

            lat = location_data["lat"]
            lon = location_data["lon"]
            image_url = location_data.get("image_url", DEFAULT_IMAGE)
            
            weather_key = os.getenv("OPENWEATHER_API_KEY")

            # (Get Weather)
            weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={weather_key}&units=metric"
            weather_data = requests.get(weather_url).json()

            # 🔥 (Get Tide using CACHE)
            tide_height = get_tide_cached(lat, lon)

            # (Extract Weather Safely)
            weather_icon = weather_data["weather"][0]["icon"] if "weather" in weather_data else "01d"
            temp = weather_data.get("main", {}).get("temp", 28)
            wind = weather_data.get("wind", {}).get("speed", 0) * 3.6
            rain = weather_data.get("rain", {}).get("1h", 0)

            # (Calculate BSI)
            result = calculate_bsi(temp, wind, rain, tide_height)

            results.append({
                # ✅ FIX 2: use display name
                "city": beach_display_name,
                "bsi_score": result["bsi_score"],
                "rating": result["rating"],
                "image_url": image_url,
                "weather_icon": weather_icon
            })

        except Exception as e:
            print(f"Error fetching data for {beach_name}: {e}")
            results.append({
                "city": beach_display_name,
                "bsi_score": 0,
                "rating": "🔴 Error",
                "image_url": DEFAULT_IMAGE,
                "weather_icon": "01d"
            })

    # ✅ Sort by BSI (highest first)
    sorted_results = sorted(results, key=lambda x: x["bsi_score"], reverse=True)[:5]
    
    return jsonify(sorted_results)

# --- Get Reviews Route (FIXED to handle old reviews) ---
@app.route('/get_reviews')
def get_reviews():
    beach_name = request.args.get('beach')
    if not beach_name:
        return jsonify({"error": "Beach name is required"}), 400
    try:
        reviews_ref = db.collection('reviews')
        # This query MUST match the index you built in Firebase
        query = reviews_ref.where('beachName', '==', beach_name).order_by('createdAt', direction=firestore.Query.DESCENDING)
        docs = query.stream()
        reviews_list = []
        for doc in docs:
            review_data = doc.to_dict()
            if 'createdAt' in review_data:
                # This check fixes the "N/A" bug in your review list
                for key in ["cleanliness", "accessibility", "washrooms", "food", "transport", "crowdLevel", "parking", "familyFriendly", "waterSports"]:
                    if key not in review_data:
                        review_data[key] = 0 # Set 0 (N/A) if the old review doesn't have it
                review_data['createdAt'] = doc.to_dict()['createdAt'].strftime('%Y-%m-%d %H:%M')
            reviews_list.append(review_data)
        return jsonify(reviews_list)
    except Exception as e:
        print(f"Error getting reviews: {e}")
        return jsonify({"error": str(e)}), 500

# --- Get "My Reviews" Route (FIXED to match index) ---
@app.route('/get_my_reviews')
def get_my_reviews():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header is missing"}), 401
    try:
        token = auth_header.split(' ')[1]
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        reviews_ref = db.collection('reviews')
        # This query MUST match the index you built in Firebase
        query = reviews_ref.where('userId', '==', uid).order_by('createdAt', direction=firestore.Query.DESCENDING)
        docs = query.stream()
        reviews_list = []
        for doc in docs:
            review_data = doc.to_dict()
            if 'createdAt' in review_data:
                review_data['createdAt'] = doc.to_dict()['createdAt'].strftime('%Y-%m-%d %H:%M')
            reviews_list.append(review_data)
        return jsonify(reviews_list)
    except auth.InvalidIdTokenError:
        return jsonify({"error": "Invalid authentication token"}), 403
    except Exception as e:
        print(f"Error getting my reviews: {e}")
        return jsonify({"error": str(e)}), 500

# 🔥 --- NEW: Submit Live Crowd Vote Route ---
@app.route('/submit_crowd_vote', methods=['POST'])
def submit_crowd_vote():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header is missing"}), 401
    
    try:
        # 1. Verify the secure Firebase Token
        token = auth_header.split(' ')[1]
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        # 2. Get the data from React
        data = request.json
        beach_name = data.get('beachName')
        crowd_vote = data.get('crowdLevel')  # Will be "Quiet", "Busy", or "Packed"
        
        # 3. Convert text vote to a number for the Stars UI (1, 3, or 5)
        crowd_score = 1
        if crowd_vote == "Busy":
            crowd_score = 3
        elif crowd_vote == "Packed":
            crowd_score = 5
            
        # 4. Save it as a lightweight "Review" so it instantly counts for Gamification!
        new_vote = {
            "userId": uid,
            "beachName": beach_name.title() if beach_name else "Unknown Beach",
            "crowdLevel": crowd_score,
            "reviewText": f"🕒 Live Crowd Report: {crowd_vote}",
            "createdAt": datetime.now(),
            "isLiveVote": True
        }
        
        db.collection('reviews').add(new_vote)
        
        return jsonify({"success": True, "message": "Vote saved successfully!"})
        
    except Exception as e:
        print(f"Error saving crowd vote: {e}")
        return jsonify({"error": str(e)}), 500


# --- Run App ---
if __name__ == '__main__':
    app.run(debug=True)