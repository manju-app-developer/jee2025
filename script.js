document.addEventListener("DOMContentLoaded", function () {
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || {};
    let timer;
    let timeLeft = parseInt(localStorage.getItem("timeLeft")) || 10800; // 3 hours in seconds

    const questionContainer = document.getElementById("question-container");
    const questionText = document.getElementById("question-text");
    const questionImage = document.getElementById("question-image");
    const optionsContainer = document.getElementById("options-container");
    const integerAnswerInput = document.getElementById("integer-answer");
    const prevButton = document.getElementById("prev-btn");
    const nextButton = document.getElementById("next-btn");
    const submitButton = document.getElementById("submit-btn");
    const resultContainer = document.getElementById("result-container");
    const timerDisplay = document.getElementById("timer");
    const navButtonsContainer = document.getElementById("nav-buttons");
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    // Load questions from JSON file
    fetch("questions.json")
        .then(response => response.json())
        .then(data => {
            questions = data;
            createNavButtons();
            loadQuestion(0);
            startTimer();
        })
        .catch(error => console.error("Error loading questions:", error));

    // Create navigation buttons
    function createNavButtons() {
        navButtonsContainer.innerHTML = "";
        questions.forEach((_, index) => {
            const btn = document.createElement("button");
            btn.classList.add("nav-btn");
            btn.innerText = index + 1;
            btn.onclick = () => loadQuestion(index);
            navButtonsContainer.appendChild(btn);
        });
        updateNavButtons();
    }

    // Load a question
    function loadQuestion(index) {
        currentQuestionIndex = index;
        const currentQuestion = questions[index];

        questionText.innerText = currentQuestion.question;
        
        if (currentQuestion.image) {
            questionImage.src = currentQuestion.image;
            questionImage.style.display = "block";
        } else {
            questionImage.style.display = "none";
        }

        optionsContainer.innerHTML = "";
        integerAnswerInput.style.display = "none";

        if (currentQuestion.type === "MCQ") {
            currentQuestion.options.forEach((option) => {
                const button = document.createElement("button");
                button.classList.add("option-btn");
                button.innerText = option;
                button.onclick = () => selectAnswer(index, option);
                if (userAnswers[index] === option) {
                    button.classList.add("selected");
                }
                optionsContainer.appendChild(button);
            });
        } else if (currentQuestion.type === "Integer") {
            integerAnswerInput.style.display = "block";
            integerAnswerInput.value = userAnswers[index] || "";
            integerAnswerInput.oninput = () => {
                userAnswers[index] = integerAnswerInput.value.trim();
                saveProgress();
            };
        }

        updateNavButtons();
    }

    // Select an answer
    function selectAnswer(index, answer) {
        userAnswers[index] = answer;
        saveProgress();
        loadQuestion(index);
    }

    // Save progress to localStorage
    function saveProgress() {
        localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    }

    // Update navigation buttons
    function updateNavButtons() {
        const buttons = document.querySelectorAll(".nav-btn");
        buttons.forEach((btn, i) => {
            btn.classList.remove("active", "answered", "unanswered");
            if (userAnswers[i]) {
                btn.classList.add("answered");
            } else {
                btn.classList.add("unanswered");
            }
        });
        buttons[currentQuestionIndex].classList.add("active");
    }

    // Timer function
    function startTimer() {
        timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                submitQuiz();
            } else {
                timeLeft--;
                localStorage.setItem("timeLeft", timeLeft);
                let hours = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
                let minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
                let seconds = String(timeLeft % 60).padStart(2, "0");
                timerDisplay.innerText = `${hours}:${minutes}:${seconds}`;
            }
        }, 1000);
    }

    // Navigation controls
    prevButton.onclick = () => {
        if (currentQuestionIndex > 0) {
            loadQuestion(currentQuestionIndex - 1);
        }
    };

    nextButton.onclick = () => {
        if (currentQuestionIndex < questions.length - 1) {
            loadQuestion(currentQuestionIndex + 1);
        }
    };

    // Submit quiz
    submitButton.onclick = submitQuiz;

    function submitQuiz() {
        clearInterval(timer);
        localStorage.removeItem("userAnswers");
        localStorage.removeItem("timeLeft");

        let score = 0;
        let maxMarks = 300; // Total marks
        let correctMarks = 4;
        let incorrectMarks = -1;

        questions.forEach((question, index) => {
            if (userAnswers[index] !== undefined) {
                let userAnswer = userAnswers[index];
                if (question.type === "Integer") {
                    userAnswer = parseInt(userAnswer);
                }
                if (userAnswer == question.answer) {
                    score += correctMarks;
                } else {
                    score += incorrectMarks;
                }
            }
        });

        // Display Results
        let percentage = (score / maxMarks) * 100;
        resultContainer.innerHTML = `
            <h2>Quiz Completed!</h2>
            <p><strong>Your Score:</strong> ${score} / ${maxMarks}</p>
            <p><strong>Percentage:</strong> ${percentage.toFixed(2)}%</p>
        `;
        resultContainer.style.display = "block";
    }

    // Dark mode toggle
    darkModeToggle.onclick = () => {
        document.body.classList.toggle("dark-mode");
        let mode = document.body.classList.contains("dark-mode") ? "Dark" : "Light";
        darkModeToggle.innerHTML = `<i class="fas fa-${mode === "Dark" ? "sun" : "moon"}"></i>`;
        localStorage.setItem("theme", mode);
    };

    // Load theme from localStorage
    if (localStorage.getItem("theme") === "Dark") {
        document.body.classList.add("dark-mode");
        darkModeToggle.innerHTML = `<i class="fas fa-sun"></i>`;
    }
});
