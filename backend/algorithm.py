def calculate_bsi(temp, wind, rain, tide_height, lifeguard_present=True):
    score = 0

     
    if 26 <= temp <= 32:
        score += 30
    elif 22 <= temp < 26 or 32 < temp <= 35:
        score += 22
    elif 18 <= temp < 22 or 35 < temp <= 38:
        score += 15
    else:
        score += 8

     
    if wind < 15:
        score += 25
    elif 15 <= wind <= 30:
        score += 18
    elif 30 < wind <= 45:
        score += 10
    else:
        score += 5

    
    if rain == 0:
        score += 20
    elif rain < 2:
        score += 15
    elif rain < 10:
        score += 8
    else:
        score += 0

     
    if tide_height < 1.2:
        score += 15
    elif 1.2 <= tide_height <= 2.0:
        score += 10
    else:
        score += 5

     
    if lifeguard_present:
        score += 10
    else:
        score -= 15

    
    if wind > 40 and tide_height > 2:
        score -= 15  # very dangerous combo
    if rain > 10 and wind > 35:
        score -= 10  # storm-like condition

     
    score = min(max(score, 0), 100)

     
    if score >= 90:
        rating = "🏖️ Excellent"
        color = "🟢"
        advice = "Perfect conditions for beach activities."
    elif 75 <= score < 90:
        rating = "🌤️ Very Good"
        color = "🟢"
        advice = "Safe and enjoyable."
    elif 60 <= score < 75:
        rating = "😊 Good"
        color = "🟡"
        advice = "Mostly safe, stay alert."
    elif 45 <= score < 60:
        rating = "😐 Moderate"
        color = "🟠"
        advice = "Be cautious, conditions may change."
    elif 30 <= score < 45:
        rating = "⚠️ Not Suitable"
        color = "🔴"
        advice = "Avoid swimming."
    else:
        rating = "🚫 Dangerous"
        color = "⚫"
        advice = "Do not enter water."

    return {
        "bsi_score": score,
        "rating": f"{rating} {color}",
        "advice": advice   
    }