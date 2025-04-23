import random
import time
import os

# --- Easy Riddles ---
easy_riddles = [
    {
        'question': "I am the king of the jungle. What am I?",
        'answer': 'lion',
        'animal': 'Lion'
    },
    {
        'question': "What has a tail but no body?",
        'answer': 'comet',
        'animal': 'Comet'
    },
    {
        'question': "I am small, have a big nose, and live in forests. What am I?",
        'answer': 'mouse',
        'animal': 'Mouse'
    }
]

# --- Medium Riddles ---
medium_riddles = [
    {
        'question': "I fly without wings, sting without a bite. What am I?",
        'answer': 'bee',
        'animal': 'Bee'
    },
    {
        'question': "What has many eyes but cannot see?",
        'answer': 'a hunting net',
        'animal': 'Hunting Net'
    },
    {
        'question': "What is full of holes but still holds water?",
        'answer': 'a hunting decoy',
        'animal': 'Decoy'
    }
]

# --- Hard Riddles ---
hard_riddles = [
    {
        'question': "What is always coming, but never arrives?",
        'answer': 'a hunted animal',
        'animal': 'Hunted Animal'
    },
    {
        'question': "What comes after E and before ant?",
        'answer': 'elephant',
        'animal': 'Elephant'
    },
    {
        'question': "What is white, but can be black?",
        'answer': 'a hunting dog',
        'animal': 'Hunting Dog'
    }
]

# --- Boss Battle Riddle ---
boss_riddle = {
    'question': "I am invisible, yet I can make things disappear. What am I?",
    'answer': 'time',
    'animal': 'The Final Boss: Time itself!'
}

# --- Function to play based on difficulty ---
def play_game(riddles_pool, time_limit=40):
    score = 0
    print("\n🎯 New Hunting Challenge Begins!\n")
    
    random.shuffle(riddles_pool)
    
    for riddle in riddles_pool:
        print("\nNew Riddle:", riddle['question'])
        start_time = time.time()
        answer = input(f"You have {time_limit} seconds! What's your answer? ").lower().strip()
        end_time = time.time()
        
        if end_time - start_time > time_limit:
            print(f"⏰ Time's up! You took too long.")
            print(f"The correct answer was: {riddle['answer']}")
            continue
        
        if answer == riddle['answer'].lower():
            score += 1
            print(f"✅ Correct! You 'hunted' the {riddle['animal']}!")
        else:
            print(f"❌ Wrong! The correct answer was: {riddle['answer']}")
    
    if score == len(riddles_pool):
        print("\n🏆 Perfect round! You earned +5 bonus points!")
        score += 5
    
    print("\n🏁 End of Round!")
    print(f"Score: {score} points")
    return score

# --- Boss Battle ---
def boss_battle(time_limit=15):
    print("\n💀 FINAL HUNT: The Boss Battle Begins! 💀")
    print(f"⚔️ You have {time_limit} seconds to answer...")
    
    print("\nBOSS RIDDLE:", boss_riddle['question'])
    start_time = time.time()
    answer = input("Final Answer: ").lower().strip()
    end_time = time.time()
    
    if end_time - start_time > time_limit:
        print("\n⏰ Time's up! You failed to defeat the boss...")
        return False
    
    if answer == boss_riddle['answer']:
        print("\n🎉 YOU WIN!!! You defeated Time itself! 🏆👑")
        return True
    else:
        print(f"\n❌ Wrong! The correct answer was '{boss_riddle['answer']}'. You have been defeated...")
        return False

# --- Save High Score ---
def save_high_score(name, score):
    with open('highscores.txt', 'a') as file:
        file.write(f"{name}:{score}\n")

# --- Show High Scores ---
def show_high_scores():
    print("\n🏆 HALL OF FAME 🏆")
    if not os.path.exists('highscores.txt'):
        print("No high scores yet. Be the first legend!")
        return
    
    scores = []
    with open('highscores.txt', 'r') as file:
        for line in file:
            if ':' in line:
                name, score = line.strip().split(':')
                scores.append((name, int(score)))
    
    # Sort scores high to low
    scores.sort(key=lambda x: x[1], reverse=True)
    
    medals = ['🥇', '🥈', '🥉']  # Gold, Silver, Bronze
    for idx, (name, score) in enumerate(scores[:10], 1):  # top 10 only
        medal = medals[idx-1] if idx <= 3 else f"#{idx}"
        print(f"{medal} {name} - {score} points")

# --- Checking  if player is returning ---
def check_returning_player(player_name):
    if not os.path.exists('highscores.txt'):
        return False
    
    with open('highscores.txt', 'r') as file:
        for line in file:
            if ':' in line:
                name, _ = line.strip().split(':')
                if name.lower() == player_name.lower():
                    return True
    return False

# --- Tournament Mode ---
games_played = 0
best_score = 0
total_score = 0

player_name = input("🎯 Welcome, brave hunter! What is your name? ").strip()

# --- Welcome message ---
if check_returning_player(player_name):
    print(f"\n👑 Welcome back, {player_name}! Ready to beat your own record? 🏆")
else:
    print(f"\n🎯 Welcome, {player_name}! Let's begin your hunting adventure! 🌟")

while True:
    if games_played < 2:
        riddles_pool = easy_riddles
        difficulty = "Easy"
    elif games_played < 4:
        riddles_pool = medium_riddles
        difficulty = "Medium"
    else:
        riddles_pool = hard_riddles
        difficulty = "Hard"
    
    print(f"\n🏹 Difficulty Level: {difficulty}")
    score = play_game(riddles_pool)
    
    games_played += 1
    total_score += score
    best_score = max(best_score, score)
    
    if games_played == 5:
        won_boss = boss_battle(time_limit=15)
        if not won_boss:
            print("\n💀 GAME OVER after BOSS BATTLE 💀")
            break
        else:
            print("\n🏆 You are the ULTIMATE HUNTER!! 🏆")
            break

    again = input("\nPlay another hunting round? (y/n): ").lower().strip()
    if again != 'y':
        break

# Save High Score
save_high_score(player_name, total_score)

# Show High Scores
show_high_scores()

print("\n🏹 See you again, mighty hunter!")
