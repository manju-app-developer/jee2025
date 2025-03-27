document.addEventListener("DOMContentLoaded", function () {
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let timer;
    let timeLeft = 10800; // 3 hours (10800 seconds)

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
            };
        }

        updateNavButtons();
    }

    // Select an answer
    function selectAnswer(index, answer) {
        userAnswers[index] = answer;
        loadQuestion(index);
    }

    // Update navigation buttons
    function updateNavButtons() {
        const buttons = document.querySelectorAll(".nav-btn");
        buttons.forEach((btn, i) => {
            btn.classList.remove("active", "answered");
            if (userAnswers[i]) {
                btn.classList.add("answered");
            }
        });
        buttons[currentQuestionIndex].classList.add("active");
    }

    // Timer function
    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            let hours = Math.floor(timeLeft / 3600);
            let minutes = Math.floor((timeLeft % 3600) / 60);
            let seconds = timeLeft % 60;
            timerDisplay.innerText = `Time Left: ${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                submitQuiz();
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
        let score = 0;
        let totalQuestions = questions.length;
        let maxMarks = 300; // Total marks
        let correctMarks = 4;
        let incorrectMarks = -1;

        questions.forEach((question, index) => {
            if (userAnswers[index] !== undefined) {
                if (userAnswers[index] == question.answer) {
                    score += correctMarks;
                } else {
                    score += incorrectMarks;
                }
            }
        });

        // Display Results
        let percentage = (score / maxMarks) * 100;
        let resultMessage = `
            <h2>Quiz Completed!</h2>
            <p><strong>Your Score:</strong> ${score} / ${maxMarks}</p>
            <p><strong>Percentage:</strong> ${percentage.toFixed(2)}%</p>
        `;
        
        resultContainer.innerHTML = resultMessage;
        resultContainer.style.display = "block";
    }
});
