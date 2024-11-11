// Variables globales
let allData = [];
let categories = [];
const gallery = document.querySelector(".gallery");
const filtersContainer = document.getElementById("filters");

// Vérifier connexion utilisateur
function checkIfLoggedIn() {
    const token = localStorage.getItem("accessToken");
    const loginLink = document.getElementById("login-link");
    
    if (token) {
        loginLink.textContent = "logout";
        loginLink.setAttribute("href", "#");
        loginLink.addEventListener("click", logout);
    } else {
        loginLink.textContent = "login";
        loginLink.setAttribute("href", "login.html");
    }
}

// Déconnexion
function logout() {
    localStorage.removeItem("accessToken");
    window.location.reload();
}

// Vérifier mode admin
function checkAdminMode() {
    const token = localStorage.getItem("accessToken");
    if (token) {
        displayEditMode();
    }
}

// Mode édition
function displayEditMode() {
    const body = document.querySelector("body");
    const topBar = document.createElement("div");
    topBar.className = "topBar";
    topBar.innerHTML = `<p><i class="fa-solid fa-pen-to-square"></i> Mode édition</p>`;
    body.insertAdjacentElement("afterbegin", topBar);

    const title = document.querySelector("#portfolio h2");
    const editText = document.createElement("span");
    editText.classList.add("editText");
    editText.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> modifier`;

    editText.addEventListener("click", function() {
        // Action de modification ici
    });

    title.appendChild(editText);
}

// Récupérer données API
async function fetchInitialData() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        allData = await response.json();

        const uniqueCategories = [...new Set(allData.map(item => item.categoryId))];
        categories = uniqueCategories;

        displayData(allData);
        initFilters();
        checkAdminMode();
        checkIfLoggedIn();
    } catch (error) {
        console.error("Erreur de récupération des données:", error);
    }
}

// Afficher galerie
function displayData(data) {
    gallery.innerHTML = "";
    data.forEach(item => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.title;
        figure.appendChild(img);

        const figcaption = document.createElement("figcaption");
        figcaption.innerHTML = item.title;
        figure.appendChild(figcaption);

        gallery.appendChild(figure);
    });
}

// Filtrer projets
function fetchData(categoryId = 'all') {
    let filteredData = allData;
    if (categoryId !== 'all') {
        filteredData = allData.filter(item => item.categoryId === Number(categoryId));
    }
    displayData(filteredData);
}

// Initialiser filtres
function initFilters() {
    const allButton = document.createElement('button');
    allButton.classList.add('filterBtn', 'filterBtn--active');
    allButton.setAttribute('value', 'all');
    allButton.textContent = 'Tous';

    allButton.addEventListener('click', function() {
        fetchData('all');
        setActiveButton(allButton);
    });

    filtersContainer.appendChild(allButton);

    categories.forEach(categoryId => {
        const category = allData.find(item => item.categoryId === categoryId);
        if (category) {
            const button = document.createElement('button');
            button.classList.add('filterBtn');
            button.setAttribute('value', category.categoryId);
            button.textContent = category.category.name;
            button.addEventListener('click', function() {
                fetchData(category.categoryId);
                setActiveButton(button);
            });
            filtersContainer.appendChild(button);
        }
    });
}

// Mettre à jour bouton actif
function setActiveButton(activeButton) {
    const buttons = document.querySelectorAll('.filterBtn');
    buttons.forEach(button => button.classList.remove('filterBtn--active'));
    activeButton.classList.add('filterBtn--active');
}

// Charger données
fetchInitialData();
