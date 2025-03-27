document.addEventListener("DOMContentLoaded", function () {
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let timer;
    let timeLeft = 1800; // 30 minutes (1800 seconds)

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
            currentQuestion.options.forEach((option, i) => {
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
                userAnswers[index] = integerAnswerInput.value;
            };
        }

        updateNavButtons();
    }

    // Select an answer
    function selectAnswer(index, answer) {
        userAnswers[index] = answer;
        loadQuestion(index); // Refresh question to update UI
    }

    // Update navigation buttons
    function updateNavButtons() {
        const buttons = document.querySelectorAll(".nav-btn");
        buttons.forEach((btn, i) => {
            btn.classList.remove("active");
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
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerDisplay.innerText = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
            
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

        questions.forEach((question, index) => {
            if (userAnswers[index] === question.answer) {
                score++;
            }
        });

        resultContainer.innerHTML = `<h2>Quiz Completed!</h2><p>Your Score: ${score} / ${totalQuestions}</p>`;
        resultContainer.style.display = "block";
    }
});
