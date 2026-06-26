// Global variables
let questions = [];
let answers = {};
let index = 0;
let selectedOption = [];

// Switching screens
function screenActive(id) {
    const screens = document.querySelectorAll('.screen');
    for (let i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
    document.getElementById(id).classList.add('active');
}

// Loading JSON question file
const questionFileInput = document.getElementById('question-file-input');

questionFileInput.addEventListener('change', function (event) {
    if (event.target.files[0]) {
        readJSONFile(event.target.files[0]);
    }
});

function readJSONFile(jsonFile) {
    const jsonFileReader = new FileReader();
    jsonFileReader.onload = (event) => {
        try {
            initProblems(JSON.parse(event.target.result));
        } catch {
            alert('Invalid file');
        }
    };
    jsonFileReader.readAsText(jsonFile);
}

// Initialize Problem Set
function initProblems(data) {
    questions = data.questions; // Original order of questions

    answers = {};
    index = 0;
    selectedOption = [];

    screenActive('screen-questions');
    showQuestion();
}

// Showing questions
function showQuestion() {
    const container = document.getElementById('questions-container');

    const question = questions[index];
    const answer = answers[question.id]; //A6 or A7 for example
    const locked = answer;
    
    showMultipleChoice(question, answer, locked, container);     

    selectedOption = [];
    updateNavigation();
}

function showMultipleChoice(question, answer, locked, container) {
    const optionsHTML = question.options.map(function(opt, i) {
        let className = 'option';
        if (locked) {
            const isCorrect = question.correct.includes(i);
            const isSelected = answer.selected.includes(i);
            if (isCorrect && isSelected) {
                className += ' correct locked';
            } else if (!isCorrect && isSelected) {
                className += ' wrong locked';
            } else if (isCorrect && !isSelected) {
                className += ' reveal locked';
            } else {
                className += ' locked';
            }
        }
        // start from A '65'
        return `<div class="${className}" onclick="selectOption(${i})" data-i="${i}">
            <div>${String.fromCharCode(65 + i)}</div>
            <div>${opt}</div>
            </div>`;
    }).join('');    

    let feedbackHTML, submitButtonHTML;
    // (TODO): Check if there are is an explanation for the answer in the json file.
    //const explanation = !question.explanation ? "Correct Answer!" : question.explanation[answer.selected[0]];

    if (locked) {        
        feedbackHTML = `<div class="feedback ${answer.correct ? 'ok' : 'no'}">
        <div>${answer.correct ? 'Correct' : 'Incorrect'}</div>
        <div>${question.explanation[answer.selected[0]]}</div>`

        submitButtonHTML = '';
    } else {
        submitButtonHTML = `<div class="submit-row">
            <button class="button-submit" id="button-submit" onclick="submitOption('${question.id}')" disabled> Submit </button>
            </div>`;
        feedbackHTML = '';
    }    

    container.innerHTML = `<div class="question-card">
        <div class="question-meta">
            <span class="question-id number">${question.id}</span>
        </div>
        <div class="question-text">${question.text}</div>
        <div class="options">${optionsHTML}</div>
        ${feedbackHTML}
        ${submitButtonHTML}
    </div>`;
}

function selectOption(optIndex) {
    const question = questions[index];
    if (answers[question.id]) return;

    if (question.type === 'multi') {
        const selectedPosition = selectedOption.indexOf(optIndex);
        if (selectedPosition > -1 )
            selectedOption.splice(selectedPosition, 1) 
        else 
            selectedOption.push(optIndex);
    } else {
        selectedOption = [optIndex];
    }
    document.querySelectorAll('.option').forEach(function(element) {
        element.classList.toggle('selected', selectedOption.includes(parseInt(element.dataset.i)));
    });
    const button = document.getElementById('button-submit');
    if (button) 
        button.disabled = (selectedOption.length === 0);
}

function submitOption(id) {
    if (selectedOption === 0) 
        return;

    let question;
    for (let i = 0; i < questions.length; i++) {
        if (questions[i].id == id) {
            question = questions[i];
            break;
        }
    }
    
    const select = [...selectedOption];

    let isCorrect;
    for (let i = 0; i < question.correct.length; i++) {
        if (select.includes(question.correct[i])) {
            isCorrect = true;
        } else {
            isCorrect = false;
        }
    }    
    answers[id] = { selected: select, correct: isCorrect };
    showQuestion();
}

// Navigation
function updateNavigation() {
    const totalQuestions = questions.length;    
    let current;
    if (totalQuestions === 0)
        current = 0;
    else
        current = index + 1;

    document.getElementById('navigation-text').textContent = `${current} / ${totalQuestions}`;

    const previousButton = document.getElementById('button-previous');
    const nextButton = document.getElementById('button-next');

    if (totalQuestions === 0) {
        previousButton.disabled = true;
        nextButton.disabled = true;
    } else if (index === 0) {
        previousButton.disabled = true;
        nextButton.disabled = false;
    } else if (index >= (totalQuestions - 1)) {
        previousButton.disabled = false;
        nextButton.disabled = true;
    } else {
        previousButton.disabled = false;
        nextButton.disabled = false;
    }    
}

function navigate(direction) {
    const totalQuestions = questions.length;
    const nextQuestion = index + direction;
    if (nextQuestion >= 0 && nextQuestion < totalQuestions) {
        index = nextQuestion;
        showQuestion();
    }
}

document.addEventListener("keydown", function(event) { // Arrow presses to navigate
    if (event.key == 'ArrowRight') {
        navigate(1);
    } else if (event.key == 'ArrowLeft') {
        navigate(-1);
    }
});