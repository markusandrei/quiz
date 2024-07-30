// Data for cache
let categories = [];
let selectedCategory = "";
let questions = [];
let currentQuestion = "";
let usedQuestions = [];

// DOM elements for cache
let mainContainer;
let infoContainer;
let cardElement;
let menuContainer;
let categoriesContainer;
let quizContainer;
let questionElement;
let optionsContainer;

window.addEventListener("resize", () => {
  const categoryElement = document.getElementById("category-info");
  if (categoryElement) {
    updateCategoryText(categoryElement, selectedCategory);
  }
});

function updateCategoryText(element) {
  if (window.innerWidth <= 800) {
    element.innerHTML = `<span class="fontColorAccent">${selectedCategory}</span>`;
  } else {
    element.innerHTML = `Category: <span class="fontColorAccent">${selectedCategory}</span>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Caching DOM elements
  mainContainer = document.getElementById("main");
  infoContainer = document.getElementById("info");
  cardElement = document.getElementById("card");
  menuContainer = document.getElementById("menu");
  categoriesContainer = document.getElementById("categories");
  quizContainer = document.getElementById("quiz");
  questionElement = document.getElementById("question");
  optionsContainer = document.getElementById("options");

  fetch("./questions/categories.json")
    .then((response) => response.json())
    .then((categoryData) => {
      // Block of code to execute when the fetch is successful
      categories = Object.keys(categoryData);

      displayCategories();
      showElement(menuContainer);
    })
    .catch((error) => {
      // Block of code to execute when the fetch fails
      console.error("Error loading the JSON file:", error);

      const errorMsg = document.createElement("p");
      errorMsg.textContent = ("Error loading the JSON file:", error);
      errorMsg.className = "fontMedium errorMessage";
      cardElement.appendChild(errorMsg);

      return;
    })
    .finally(() => {
      showElement(cardElement);
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
    categoriesContainer.appendChild(categoryElement);
  });
}

function categoryClicked(category) {
  selectedCategory = category;

  loadQuestions()
    .then(() => {
      hideElement(menuContainer);
      startQuiz();
      displayInfo();
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

          console.log("Questions fetched:", questions);
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
  displayQuestion();
  displayOptions();
  showElement(quizContainer);
}

function displayInfo() {
  const categoryElement = document.createElement("p");
  categoryElement.classList.add("fontMedium", "fontBold");
  categoryElement.id = "category-info";
  updateCategoryText(categoryElement);
  infoContainer.appendChild(categoryElement);

  const itemElement = document.createElement("p");
  itemElement.textContent =
    usedQuestions.length + 1 + " of " + questions.length;
  itemElement.id = "itemCount";
  infoContainer.appendChild(itemElement);
}

function updateItemCount() {
  const itemElement = document.getElementById("itemCount");
  itemElement.textContent =
    usedQuestions.length + 1 + " of " + questions.length;
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
      optionElement.onclick = () => correctClicked();
    } else {
      optionElement.onclick = () => wrongClicked();
    }

    optionElement.classList.add("option");
    optionsContainer.appendChild(optionElement);
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

function wrongClicked() {
  cardElement.classList.add("redBorder");

  // 1 second delay
  setTimeout(function () {
    cardElement.classList.remove("redBorder");
  }, 250);
}

function correctClicked() {
  usedQuestions.push(questions[currentQuestion].id);
  cardElement.classList.add("greenBorder");

  setTimeout(function () {
    cardElement.classList.remove("greenBorder");
    clearOptions();
    startQuiz();
    if (usedQuestions.length !== questions.length) {
      updateItemCount();
    }
  }, 250);
}

function clearOptions() {
  while (optionsContainer.firstChild) {
    optionsContainer.removeChild(optionsContainer.firstChild);
  }
}
