document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const nameEntryDiv = document.getElementById('name-entry');
    const playerNameInput = document.getElementById('player-name');
    const startGameButton = document.getElementById('start-game-button');
    const welcomeMessageP = document.getElementById('welcome-message');

    const gameAreaDiv = document.getElementById('game-area');
    const difficultyLevelH2 = document.getElementById('difficulty-level');
    const gameStatusP = document.getElementById('game-status');
    const riddleQuestionSpan = document.getElementById('riddle-question');
    const timerSpan = document.getElementById('timer');
    const answerInput = document.getElementById('answer-input');
    const submitAnswerButton = document.getElementById('submit-answer-button');
    const feedbackP = document.getElementById('feedback');
    const totalScoreSpan = document.getElementById('total-score');
    const nextRoundButton = document.getElementById('next-round-button');
    const quitButton = document.getElementById('quit-button');

    const highScoresAreaDiv = document.getElementById('high-scores-area');
    const highScoresListUl = document.getElementById('high-scores-list');
    const playAgainButton = document.getElementById('play-again-button');
    const finalMessageP = document.getElementById('final-message');

    // --- Riddle Data (Converted from Python) ---
    const easyRiddles = [
        { question: "I am the king of the jungle. What am I?", answer: 'lion', animal: 'Lion' },
        { question: "What has a tail but no body?", answer: 'comet', animal: 'Comet' },
        { question: "I am small, have a big nose, and live in forests. What am I?", answer: 'mouse', animal: 'Mouse' }
    ];
    const mediumRiddles = [
        { question: "I fly without wings, sting without a bite. What am I?", answer: 'bee', animal: 'Bee' },
        { question: "What has many eyes but cannot see?", answer: 'a hunting net', animal: 'Hunting Net' },
        { question: "What is full of holes but still holds water?", answer: 'a hunting decoy', animal: 'Decoy' }
    ];
    const hardRiddles = [
        { question: "What is always coming, but never arrives?", answer: 'a hunted animal', animal: 'Hunted Animal' },
        { question: "What comes after E and before ant?", answer: 'elephant', animal: 'Elephant' },
        { question: "What is white, but can be black?", answer: 'a hunting dog', animal: 'Hunting Dog' }
    ];
    const bossRiddle = {
        question: "I am invisible, yet I can make things disappear. What am I?", answer: 'time', animal: 'The Final Boss: Time itself!'
    };

    // --- Game State Variables ---
    let currentPlayerName = "";
    let currentRiddlePool = [];
    let currentRiddleIndex = 0;
    let roundScore = 0;
    let totalScore = 0;
    let gamesPlayed = 0; // How many rounds completed
    let timerInterval = null;
    let timeLeft = 0;
    let startTime = 0;
    let currentDifficulty = "";
    let isBossBattle = false;

    const TIME_LIMIT_NORMAL = 40;
    const TIME_LIMIT_BOSS = 15;
    const MAX_ROUNDS_BEFORE_BOSS = 5; // Play 5 rounds then boss

    // --- Utility Functions ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    function updateTimerDisplay() {
        timerSpan.textContent = timeLeft;
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function startTimer(limit) {
        stopTimer(); // Ensure previous timer is stopped
        timeLeft = limit;
        startTime = Date.now();
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                stopTimer();
                handleTimeUp();
            }
        }, 1000); // Update every second
    }

    // --- High Score Functions (using localStorage) ---
    function loadHighScores() {
        const scoresJSON = localStorage.getItem('riddleHunterHighScores');
        return scoresJSON ? JSON.parse(scoresJSON) : [];
    }

    function saveHighScore(name, score) {
        const scores = loadHighScores();
        scores.push({ name: name, score: score });
        // Sort scores descending
        scores.sort((a, b) => b.score - a.score);
        // Keep only top 10 (optional)
        const topScores = scores.slice(0, 10);
        localStorage.setItem('riddleHunterHighScores', JSON.stringify(topScores));
    }

    function displayHighScores() {
        highScoresListUl.innerHTML = ''; // Clear previous list
        const scores = loadHighScores();
        const medals = ['🥇', '🥈', '🥉'];

        if (scores.length === 0) {
            highScoresListUl.innerHTML = '<li>No high scores yet. Be the first legend!</li>';
            return;
        }

        scores.forEach((scoreEntry, index) => {
            const li = document.createElement('li');
            const medal = index < 3 ? medals[index] : `#${index + 1}`;
            li.textContent = `${medal} ${scoreEntry.name} - ${scoreEntry.score} points`;
            highScoresListUl.appendChild(li);
        });
    }

    function checkReturningPlayer(name) {
        const scores = loadHighScores();
        return scores.some(entry => entry.name.toLowerCase() === name.toLowerCase());
    }

    // --- Game Logic Functions ---
    function showScreen(screenToShow) {
        nameEntryDiv.style.display = 'none';
        gameAreaDiv.style.display = 'none';
        highScoresAreaDiv.style.display = 'none';

        if (screenToShow === 'name') nameEntryDiv.style.display = 'block';
        if (screenToShow === 'game') gameAreaDiv.style.display = 'block';
        if (screenToShow === 'scores') highScoresAreaDiv.style.display = 'block';
    }

    function displayRiddle() {
        if (currentRiddleIndex >= currentRiddlePool.length) {
            endRound();
            return;
        }

        const riddle = currentRiddlePool[currentRiddleIndex];
        riddleQuestionSpan.textContent = riddle.question;
        answerInput.value = '';
        answerInput.disabled = false;
        submitAnswerButton.disabled = false;
        feedbackP.textContent = '';
        feedbackP.className = ''; // Reset feedback style
        gameStatusP.textContent = `Riddle ${currentRiddleIndex + 1} of ${currentRiddlePool.length}`;
        startTimer(isBossBattle ? TIME_LIMIT_BOSS : TIME_LIMIT_NORMAL);
        answerInput.focus();
    }

     function handleTimeUp() {
        feedbackP.textContent = `⏰ Time's up! The correct answer was: ${currentRiddlePool[currentRiddleIndex].answer}`;
        feedbackP.className = 'timeup';
        answerInput.disabled = true;
        submitAnswerButton.disabled = true;
        proceedToNext();
    }

    function checkAnswer() {
        stopTimer();
        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = currentRiddlePool[currentRiddleIndex].answer.toLowerCase();
        const riddle = currentRiddlePool[currentRiddleIndex];

        answerInput.disabled = true;
        submitAnswerButton.disabled = true;

        if (userAnswer === correctAnswer) {
            roundScore++;
            totalScore++;
            feedbackP.textContent = `✅ Correct! You 'hunted' the ${riddle.animal}!`;
            feedbackP.className = 'correct';
        } else {
            feedbackP.textContent = `❌ Wrong! The correct answer was: ${riddle.answer}`;
            feedbackP.className = 'incorrect';
        }
        totalScoreSpan.textContent = totalScore;

        proceedToNext();
    }

    function proceedToNext() {
         // Add a short delay before showing the next riddle or ending the round/game
         setTimeout(() => {
            currentRiddleIndex++;
            if (isBossBattle) {
                 // Boss battle only has one riddle
                 endBossBattle(feedbackP.className === 'correct'); // Pass if the player was correct
            } else if (currentRiddleIndex < currentRiddlePool.length) {
                 displayRiddle(); // Next riddle in the current round
             } else {
                 endRound(); // Finished all riddles in the round
             }
         }, 2000); // 2 second delay
    }

    function endRound() {
        feedbackP.textContent += ` |🏁 End of ${currentDifficulty} Round! Round Score: ${roundScore}`;
        if (roundScore === currentRiddlePool.length) {
            feedbackP.textContent += " | 🏆 Perfect round! +5 bonus points!";
            totalScore += 5;
            totalScoreSpan.textContent = totalScore;
        }
        gamesPlayed++;

        // Decide next step
        if (gamesPlayed >= MAX_ROUNDS_BEFORE_BOSS || (currentDifficulty == "Hard" && roundScore === currentRiddlePool.length) ) {
            startBossBattle();
        } else {
            // Show "Next Round" button or allow quitting
             nextRoundButton.style.display = 'inline-block';
             quitButton.textContent = "Quit Game (End Hunt)"; // Change quit button text
        }
    }

    function startBossBattle() {
        isBossBattle = true;
        currentDifficulty = "💀 FINAL HUNT: Boss Battle 💀";
        currentRiddlePool = [bossRiddle]; // Boss has only one riddle
        currentRiddleIndex = 0;
        roundScore = 0; // Reset round score for boss

        difficultyLevelH2.textContent = currentDifficulty;
        nextRoundButton.style.display = 'none'; // Hide next round button
        quitButton.style.display = 'none'; // Cannot quit during boss battle
        feedbackP.textContent = `⚔️ You have ${TIME_LIMIT_BOSS} seconds to answer...`;
        displayRiddle();
    }

     function endBossBattle(won) {
         stopTimer();
         if (won) {
             feedbackP.textContent = "🎉 YOU WIN!!! You defeated Time itself! 🏆👑";
             feedbackP.className = 'final-win';
             // Add boss bonus? Let's add 10 points for winning
             totalScore += 10;
             totalScoreSpan.textContent = totalScore;
             endGame(true); // End game, won boss
         } else {
             // Ensure the correct answer is shown if they lost due to wrong answer (not time up)
             if (feedbackP.className !== 'timeup') {
                feedbackP.textContent = `❌ Wrong! The correct answer was '${bossRiddle.answer}'. You have been defeated...`;
             } else {
                 feedbackP.textContent += " | You have been defeated..."
             }
             feedbackP.className = 'final-loss';
             endGame(false); // End game, lost boss
         }
     }


    function determineNextDifficulty() {
        if (currentDifficulty == "Easy" && roundScore === currentRiddlePool.length) return { pool: mediumRiddles, name: "Medium" };
        if (currentDifficulty == "Medium" && roundScore === currentRiddlePool.length) return { pool: hardRiddles, name: "Hard" };
        if (currentDifficulty == "Hard" && roundScore === currentRiddlePool.length) return { pool: hardRiddles, name: "Hard" };
        return { pool: easyRiddles, name: "Easy" };
    }

    function setupNextRound() {
        isBossBattle = false;
        const difficultyInfo = determineNextDifficulty();
        currentDifficulty = difficultyInfo.name;
        currentRiddlePool = [...difficultyInfo.pool]; // Copy the array
        shuffleArray(currentRiddlePool);
        currentRiddleIndex = 0;
        roundScore = 0;

        difficultyLevelH2.textContent = `🏹 Difficulty Level: ${currentDifficulty}`;
        nextRoundButton.style.display = 'none'; // Hide button until round ends
        quitButton.textContent = "Quit Game"; // Reset quit button text
        quitButton.style.display = 'inline-block'; // Ensure quit button is visible

        displayRiddle();
    }

    function endGame(finishedBoss = false) {
        stopTimer();
        saveHighScore(currentPlayerName, totalScore);
        displayHighScores();
        showScreen('scores'); // Show the high scores screen

        if (!finishedBoss) { // If quit before boss
            finalMessageP.textContent = `🏹 See you again, ${currentPlayerName}! Your final score: ${totalScore}`;
        } else {
            if (feedbackP.className === 'final-win') {
                 finalMessageP.textContent = `🏆 You are the ULTIMATE HUNTER, ${currentPlayerName}! Final Score: ${totalScore} 🏆`;
            } else {
                 finalMessageP.textContent = `💀 GAME OVER, ${currentPlayerName}. You fought bravely. Final Score: ${totalScore} 💀`;
            }
        }
    }

    // --- Event Listeners ---
    startGameButton.addEventListener('click', () => {
        currentPlayerName = playerNameInput.value.trim();
        if (!currentPlayerName) {
            alert("Please enter your hunter name!");
            return;
        }

        // Reset game state for a new game
        totalScore = 0;
        gamesPlayed = 0;
        isBossBattle = false;
        totalScoreSpan.textContent = totalScore;
        finalMessageP.textContent = ''; // Clear final message

        if (checkReturningPlayer(currentPlayerName)) {
            welcomeMessageP.textContent = `👑 Welcome back, ${currentPlayerName}! Ready to beat your own record? 🏆`;
        } else {
            welcomeMessageP.textContent = `🎯 Welcome, ${currentPlayerName}! Let's begin your hunting adventure! 🌟`;
        }
        // Short delay to read welcome message
        setTimeout(() => {
            showScreen('game');
            setupNextRound();
        }, 1500); // 1.5 second delay
    });

    submitAnswerButton.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (event) => {
        // Allow submitting with Enter key
        if (event.key === 'Enter' && !submitAnswerButton.disabled) {
            checkAnswer();
        }
    });

    nextRoundButton.addEventListener('click', () => {
        setupNextRound();
    });

    quitButton.addEventListener('click', () => {
        if (confirm("Are you sure you want to end your hunt now?")) {
             endGame(false); // End game prematurely (did not finish boss)
        }
    });

    playAgainButton.addEventListener('click', () => {
        // Reset UI to initial state
        showScreen('name');
        welcomeMessageP.textContent = ''; // Clear previous welcome message
        playerNameInput.value = ''; // Clear name input for next player
        finalMessageP.textContent = ''; // Clear final message
    });

    // --- Initial Setup ---
    showScreen('name'); // Start by showing the name entry screen

}); // End DOMContentLoaded