// Data for cache
let categories = [];
let selectedCategory = "";
let questions = [];
let currentQuestion = "";
let usedQuestions = [];
let selectedDifficulty = "";

const shortDuration = 5; // 5 seconds
const mediumDuration = 10; // 10 seconds
const longDuration = 15; // 15 seconds

let totalTime = 0;
let endTime = 0;
let timerInterval = null;

// DOM elements for cache
let categoryContainer;
let categoryList;
let difficultyContainer;
let quizContainer;
let infoContainer;
let questionElement;
let optionList;
let progressBar;

window.addEventListener("resize", () => {
  const categoryElement = document.getElementById("category-info");
  if (categoryElement) {
    updateCategoryText(categoryElement, selectedCategory);
  }
});

function updateCategoryText(element) {
  if (window.innerWidth <= 800) {
    element.innerHTML = `<span class="fontColorAccent fontBold">${selectedCategory}</span>`;
  } else {
    element.innerHTML = `Category: <span class="fontColorAccent fontBold">${selectedCategory}</span>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Caching DOM elements
  categoryContainer = document.getElementById("categoryCard");
  categoryList = document.getElementById("categories");
  difficultyContainer = document.getElementById("difficultyCard");
  quizContainer = document.getElementById("quizCard");
  infoContainer = document.getElementById("infoContainer");
  questionElement = document.getElementById("question");
  optionList = document.getElementById("options");
  progressBar = document.getElementById("progress-bar");

  fetch("./questions/categories.json")
    .then((response) => response.json())
    .then((categoryData) => {
      // Block of code to execute when the fetch is successful
      categories = Object.keys(categoryData);
      categories = shuffleArray(categories);
      displayCategories();
      //showElement(menuContainer);
    })
    .catch((error) => {
      // Block of code to execute when the fetch fails
      console.error("Error loading the JSON file:", error);

      const errorMsg = document.createElement("p");
      errorMsg.textContent = ("Error loading the JSON file:", error);
      errorMsg.className = "fontMedium errorMessage";
      // quizContainer.appendChild(errorMsg);

      return;
    })
    .finally(() => {
      //showElement(quizContainer);
    });

  const categoryElement = document.getElementById("category-info");
  if (categoryElement) {
    updateCategoryText(categoryElement);
  }
});

function displayCategories() {
  categories.forEach((category) => {
    const categoryElement = document.createElement("p");
    categoryElement.textContent = category;
    categoryElement.onclick = () => categoryClicked(category);
    categoryElement.className = "fontMedium";
    categoryList.appendChild(categoryElement);
  });
}

function categoryClicked(category) {
  selectedCategory = category;

  loadQuestions()
    .then(() => {
      hideElement(categoryContainer);
      showElement(difficultyContainer);
    })
    .catch((error) => {
      console.error("Error loading questions or starting quiz:", error);
    });
}

function loadQuestions() {
  return fetch("./questions/categories.json")
    .then((response) => response.json())
    .then((categoryData) => {
      const categoryFile = categoryData[selectedCategory];

      return fetch(categoryFile)
        .then((response) => response.json())
        .then((questionData) => {
          questions = questionData;
        })
        .catch((error) =>
          console.error("Error loading the questions JSON file:", error)
        );
    })
    .catch((error) =>
      console.error("Error loading the categories JSON file:", error)
    );
}

function startQuiz() {
  if (questions.length === usedQuestions.length) {
    alert("finished");
    location.reload();
    return;
  }
  clearOptions();
  displayQuestion();
  displayOptions();
  stopTimer();

  switch (selectedDifficulty) {
    case "Easy":
      startTimer(longDuration);
      break;

    case "Medium":
      startTimer(mediumDuration);
      break;

    case "Hard":
      startTimer(shortDuration);
      break;

    case "Extreme":
      startTimer(shortDuration);
      break;

    default:
      break;
  }
  showElement(quizContainer);
}

function displayInfo() {
  const categoryElement = document.createElement("p");
  categoryElement.classList.add("fontMedium", "no-wrap");
  categoryElement.id = "category-info";
  updateCategoryText(categoryElement);
  infoContainer.appendChild(categoryElement);
  infoContainer.classList.remove("display-none");

  const itemElement = document.createElement("p");
  itemElement.textContent =
    usedQuestions.length + 1 + " of " + questions.length;
  itemElement.id = "itemCount";
  itemElement.classList.add("no-wrap");
  infoContainer.appendChild(itemElement);
}

function updateItemCount() {
  const itemElement = document.getElementById("itemCount");
  itemElement.textContent = usedQuestions.length + " of " + questions.length;
}

function displayQuestion() {
  if (questions.length > 0) {
    let index;
    do {
      index = getRandomInt(0, questions.length - 1);
    } while (usedQuestions.includes(index));

    currentQuestion = questions[index].id;
    const question = questions[index].question;
    questionElement.textContent = question;
    usedQuestions.push(questions[currentQuestion].id);
    updateItemCount();
  }
}

function displayOptions() {
  let options = [questions[currentQuestion].answer];

  for (let i = 0; i < 3; i++) {
    let answer;

    do {
      const index = getRandomInt(0, questions.length - 1);
      answer = questions[index].answer;
    } while (options.includes(answer));

    options.push(answer);
  }

  options = shuffleArray(options);

  options.forEach((option, i) => {
    const optionElement = document.createElement("p");
    optionElement.textContent = option;

    if (option === questions[currentQuestion].answer) {
      optionElement.onclick = () => answerClicked("correct");
    } else {
      optionElement.onclick = () => answerClicked("wrong");
    }

    optionElement.classList.add("option");
    optionList.appendChild(optionElement);
  });
}

function hideElement(element) {
  element.classList.add("display-none");
}

function showElement(element) {
  element.classList.remove("display-none");
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function answerClicked(truth) {
  if (truth === "correct") {
    quizContainer.classList.add("greenBorder");
    clearOptions();
    stopTimer();
    startQuiz();
  } else {
    quizContainer.classList.add("redBorder");
  }

  setTimeout(function () {
    quizContainer.classList.remove("redBorder", "greenBorder");
  }, 250);
}

function clearOptions() {
  while (optionList.firstChild) {
    optionList.removeChild(optionList.firstChild);
  }
}

function setDifficulty(difficulty) {
  selectedDifficulty = difficulty;
  hideElement(difficultyContainer);
  displayInfo();
  startQuiz();
  showElement(quizContainer);
}

function startTimer(duration) {
  totalTime = duration;
  endTime = Date.now() + totalTime * 1000;

  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Start the new timer
  timerInterval = setInterval(() => {
    const timeRemaining = Math.max(0, (endTime - Date.now()) / 1000);

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      startQuiz();

      // Reset the progress bar to 100% without animation
      progressBar.classList.add("no-animation");
      progressBar.style.width = "100%";

      // Force a reflow to apply the width change without animation
      progressBar.offsetHeight; // Trigger reflow

      // Enable animation for the countdown
      progressBar.classList.remove("no-animation");

      return;
    }

    // Animate the progress bar
    progressBar.style.transition = `width ${totalTime}s linear`;
    progressBar.style.width = "0%";
  }, 1000 / 60); // Run the interval more frequently for better accuracy
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Reset the progress bar
  progressBar.classList.add("no-animation");
  progressBar.style.width = "100%";
  progressBar.offsetHeight; // Trigger reflow
  progressBar.classList.remove("no-animation");

  // Reset variables
  totalTime = 0;
  endTime = 0;
}
