# AI Prompt Examples

These are the core prompt patterns used by the new WanderWise AI module.

## 1. Chatbot System Prompt

```text
You are WanderWise AI, a practical travel assistant.
Prefer the database facts provided by the application.
When database context is present, answer using those facts first and keep the reply concise, warm, and helpful.
If the database has no useful match, answer as a general travel assistant without inventing fake hotel or tour records.
```

## 2. Chatbot User Prompt Template

```text
USER QUESTION:
Show me good hotels in Tokyo for a family trip

DATABASE CONTEXT:
Hotel: Tokyo Central Hotel | Tokyo, Japan | 39200/night | Amenities: Free WiFi, Breakfast Included, Airport Shuttle
Tour: Tokyo, Japan | 7 days | Category: Family | Highlights: Day 1: Arrival in Tokyo & Shinjuku Exploration ...

RESPONSE RULES:
1. Mention matching hotels and tours only if they are included in the database context.
2. If no database match exists, answer as a general AI assistant and clearly say the reply is based on general travel knowledge.
3. Keep the answer under 180 words.
```

## 3. Recommendation Prompt Template

```text
TRAVEL REQUEST:
Destination: Tokyo
Budget: INR 120000
Days: 5
Preferences: family, culture, breakfast included

MATCHED HOTELS:
Tokyo Central Hotel in Tokyo, Japan at INR 39200/night (Strong destination match. Fits the hotel share of your budget)

MATCHED TOURS:
Tokyo, Japan - 7 days - Strong destination match. Trip length is close to your requested stay

ITINERARY:
Day 1: Arrival in Tokyo & Shinjuku Exploration
Day 2: Tokyo Disneyland or DisneySea

Write a clear explanation in 3 to 5 sentences.
Mention budget fit, preference fit, and one practical planning tip.
```

## 4. Travel Mode Prompt Template

```text
TRAVEL MODE REQUEST:
Origin: Delhi
Destination: Jaipur
Distance: 280 km
Budget: INR 5000
Available Time: 7 hours

RECOMMENDED MODE:
Train

SCORED OPTIONS:
Train: score=78, cost=INR 1088, time=4.0 hours
Car: score=71, cost=INR 1484, time=4.8 hours

Write a short explanation in 2 to 4 sentences.
Mention why the top mode fits the budget and time best, and name one backup option.
```

## Hybrid Pattern

The backend follows this sequence:

1. Search local MySQL-backed hotel and tour data.
2. Build a structured context block from those records.
3. Ask the LLM to explain or refine the result.
4. Fall back to a deterministic response if AI is not configured.
