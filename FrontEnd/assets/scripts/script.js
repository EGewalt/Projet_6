
let allData = [];
let categories = [];
const gallery = document.querySelector(".gallery");
const filtersContainer = document.getElementById("filters");

// Fonction récuperation API
async function fetchInitialData() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        allData = await response.json();

        // catégories
        const uniqueCategories = [...new Set(allData.map(item => item.categoryId))];
        categories = uniqueCategories;

        // galerie
        displayData(allData);

        // filtres
        initFilters();

    } catch (error) {
        console.error("Une erreur est survenue lors de la récupération des données:", error);
    }
}

// Fonction afficher galerie
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

// Fonction récupérer les données filtrées
function fetchData(categoryId = 'all') {
    let filteredData = allData;

    if (categoryId !== 'all') {
        filteredData = allData.filter(item => item.categoryId === Number(categoryId));
    }

    displayData(filteredData);
}

// Fonction pour initialiser les filtres
function initFilters() {
    // Ajouter le bouton "Tous"
    const allButton = document.createElement('button');
    allButton.classList.add('filterBtn');
    allButton.classList.add('filterBtn--active');
    allButton.setAttribute('value', 'all');
    allButton.textContent = 'Tous';

    allButton.addEventListener('click', function() {
        fetchData('all');
        setActiveButton(allButton);
    });

    filtersContainer.appendChild(allButton);

    // Ajouter les boutons pour chaque catégorie
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

// Fonction mettre à jour l'état du bouton actif
function setActiveButton(activeButton) {
    const buttons = document.querySelectorAll('.filterBtn');
    buttons.forEach(button => {
        button.classList.remove('filterBtn--active');
    });
    activeButton.classList.add('filterBtn--active');
}

fetchInitialData();
