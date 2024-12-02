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
        openEditModal();
    });

    title.appendChild(editText);
}

// Vérifier si le formulaire est valide
function checkFormValidity(modal) {
    const form = modal.querySelector('form');
    if (!form) return;

    const title = form.querySelector("#title")?.value.trim() || "";
    const category = form.querySelector("#category")?.value || "";
    const photoInput = form.querySelector("#photo-input");
    const submitButton = form.querySelector("#upload-photo-btn");

    if (!submitButton || !photoInput) return;

    const file = photoInput.files?.[0];
    const isValid = title !== "" && category !== "" && file;
    
    submitButton.disabled = !isValid;
    if (isValid) {
        submitButton.classList.remove('button-disabled');
    } else {
        submitButton.classList.add('button-disabled');
    }
}

// Ouvrir modal d'édition
function openEditModal() {
    const modal = document.createElement("div");
    modal.classList.add("edit-modal");
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2 class="modal-title">Galerie photo</h2>
            <div class="gallery-items"></div>
            <hr class="separator">
            <button class="add-photo-btn">Ajouter une photo</button>
        </div>
    `;
    document.body.appendChild(modal);

    const galleryContainer = modal.querySelector(".gallery-items");
    allData.forEach(item => {
        const projectElement = document.createElement("div");
        projectElement.classList.add("gallery-item");
        projectElement.dataset.imageId = item.id;
        projectElement.innerHTML = `
            <div class="delete-icon">
                <i class="fa-solid fa-trash-can"></i>
            </div>
            <img src="${item.imageUrl}" alt="${item.title}">
        `;
        galleryContainer.appendChild(projectElement);
    });

    const closeButton = modal.querySelector(".close-btn");
    closeButton.addEventListener("click", () => closeEditModal(modal));

    const addPhotoButton = modal.querySelector(".add-photo-btn");
    addPhotoButton.addEventListener("click", () => {
        closeEditModal(modal);
        setTimeout(() => openAddPhotoModal(), 500);
    });

    const deleteIcons = modal.querySelectorAll(".delete-icon");
    deleteIcons.forEach(icon => {
        icon.addEventListener("click", async function(e) {
            e.preventDefault();
            const galleryItem = e.target.closest(".gallery-item");
            const imageId = galleryItem.dataset.imageId;
            await deleteImage(imageId);
            galleryItem.remove();
            
            const updatedResponse = await fetch('http://localhost:5678/api/works');
            allData = await updatedResponse.json();
            displayData(allData);
        });
    });

    modal.classList.add("show");
}

// Fermer modal d'édition
function closeEditModal(modal) {
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.add('hide-content');
    setTimeout(() => {
        modal.remove();
    }, 500);
}

// Ouvrir modal d'ajout de photo
function openAddPhotoModal() {
    const modal = document.createElement("div");
    modal.classList.add("edit-modal");
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-return"><i class="fa-solid fa-arrow-left"></i></button>
            <span class="close-btn">&times;</span>
            <h2 class="modal-title">Ajout photo</h2>
            <form enctype="multipart/form-data" method="POST">
                <div class="photo-div">
                    <i class="fa-regular fa-image"></i>
                    <div class="image">+ Ajouter photo</div>
                    <input type="file" name="imgPreview" id="photo-input" accept="image/png, image/jpeg" style="display: none;">
                    <p>jpg, png : 4mo max</p>
                </div>
                <div class="form-group">
                    <label for="title">Titre</label>
                    <input type="text" name="title" id="title" required>
                </div>
                <div class="form-group">
                    <label for="category">Catégorie</label>
                    <select name="category" id="category" required>
                        <option value=""></option>
                    </select>
                </div>
                <hr class="separator">
                <button type="submit" class="add-photo-btn button-disabled" id="upload-photo-btn" disabled>Valider</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector(".close-btn");
    closeButton.addEventListener("click", () => closeAddPhotoModal(modal));

    const returnButton = modal.querySelector(".modal-return");
    returnButton.addEventListener("click", () => {
        closeAddPhotoModal(modal);
        setTimeout(() => openEditModal(), 500);
    });

    const form = modal.querySelector('form');
    const photoInput = form.querySelector("#photo-input");
    const imagePreview = form.querySelector(".photo-div");
    const addPhotoButton = form.querySelector(".image");
    const titleInput = form.querySelector("#title");
    const categorySelect = form.querySelector("#category");

    checkFormValidity(modal);

    titleInput.addEventListener("input", () => checkFormValidity(modal));
    categorySelect.addEventListener("change", () => checkFormValidity(modal));

    addPhotoButton.addEventListener("click", () => {
        photoInput.click();
    });

    photoInput.addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert("Le fichier est trop volumineux. Taille maximum : 4Mo");
                this.value = "";
                checkFormValidity(modal);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const currentInput = imagePreview.querySelector('#photo-input');
                imagePreview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                `;
                imagePreview.appendChild(currentInput);
                checkFormValidity(modal);
            };
            reader.readAsDataURL(file);
        }
        checkFormValidity(modal);
    });

    populateCategoryDropdown(categorySelect);

    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        const title = titleInput.value.trim();
        const category = categorySelect.value;
        const file = photoInput.files[0];

        if (title && category && file) {
            await uploadPhoto(title, category, file);
            closeAddPhotoModal(modal);
        }
    });

    modal.classList.add("show");
}

// Fermer modal d'ajout de photo
function closeAddPhotoModal(modal) {
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.add('hide-content');
    setTimeout(() => {
        modal.remove();
    }, 500);
}

// Remplir le dropdown des catégories
function populateCategoryDropdown(dropdown) {
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        dropdown.appendChild(option);
    });
}

// Télécharger la photo
async function uploadPhoto(title, category, file) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", file);

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de l\'upload');
        }
        
        const worksResponse = await fetch('http://localhost:5678/api/works');
        allData = await worksResponse.json();
        
        const uniqueCategories = [...new Set(allData.map(item => item.categoryId))];
        categories = uniqueCategories.map(id => allData.find(item => item.categoryId === id).category);
        
        displayData(allData);
    } catch (error) {
        console.error("Erreur lors de l'ajout de la photo:", error);
        alert("Une erreur est survenue lors de l'ajout de la photo");
    }
}

// Supprimer une image
async function deleteImage(imageId) {
    try {
        const response = await fetch(`http://localhost:5678/api/works/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
            }
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error("Erreur lors de la suppression de l'image:", error);
        alert("Une erreur est survenue lors de la suppression de l'image");
    }
}

// Récupérer les données de l'API
async function fetchInitialData() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        allData = await response.json();

        const uniqueCategories = [...new Set(allData.map(item => item.categoryId))];
        categories = uniqueCategories.map(id => allData.find(item => item.categoryId === id).category);

        displayData(allData);
        initFilters();
        checkAdminMode();
        checkIfLoggedIn();
    } catch (error) {
        console.error("Erreur de récupération des données:", error);
    }
}

// Afficher les projets dans la galerie
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

// Filtrer les projets
function fetchData(categoryId = 'all') {
    let filteredData = allData;
    if (categoryId !== 'all') {
        filteredData = allData.filter(item => item.categoryId === Number(categoryId));
    }
    displayData(filteredData);
}

// Initialiser les filtres
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

    categories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('filterBtn');
        button.setAttribute('value', category.id);
        button.textContent = category.name;
        button.addEventListener('click', function() {
            fetchData(category.id);
            setActiveButton(button);
        });
        filtersContainer.appendChild(button);
    });
}

// Mettre à jour le bouton actif
function setActiveButton(activeButton) {
    const buttons = document.querySelectorAll('.filterBtn');
    buttons.forEach(button => button.classList.remove('filterBtn--active'));
    activeButton.classList.add('filterBtn--active');
}

// Initialisation
fetchInitialData();