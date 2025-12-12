# test_bot.py

from chat.career_bot import chat_with_bot

print("Career Mentor Bot 🤖 (type 'exit' to quit)\n")

while True:
    user_input = input("You: ")
    if user_input.lower() in ["exit", "quit"]:
        print("Bot: Goodbye! Wishing you success. 🚀")
        break
    response = chat_with_bot(user_input)
    print(f"Bot: {response}\n")
