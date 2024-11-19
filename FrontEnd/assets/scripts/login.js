// DOM
const errorContainer = document.querySelector(".error-box");
const emailInput = document.getElementById("email-field");
const passwordInput = document.getElementById("password-field");
const submitButton = document.getElementById("login-button");

// Événement clic - + formulaire
submitButton.addEventListener("click", handleAuthentication);

async function handleAuthentication() {
    // Récupération des valeurs
    const email = emailInput.value;
    const password = passwordInput.value;
    
    // Réinitialisation erreurs
    errorContainer.innerHTML = "";

    // Modèles de validation
    const validEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-z]{2,4}$/;
    const validPassword = /^[a-zA-Z0-9]+$/;

    // Affichage erreurs
    function displayError(message) {
        const errorText = document.createElement("p");
        errorText.textContent = message;
        errorContainer.appendChild(errorText);
    }

    // Valid e-mail
    if (!validEmail.test(email)) {
        displayError("Veuillez entrer une adresse e-mail valide.");
        return;
    }

    // Valid mot de passe
    if (!validPassword.test(password)) {
        displayError("Veuillez entrer un mot de passe valide (lettres et chiffres uniquement).");
        return;
    }

    // Requête API - connexion
    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({ email, password })
        });

        // Traitement réponse
        const data = await response.json();
        const { error, message, token } = data;

        // Gestion erreurs d'authentification
        if (error || message) {
            displayError("Erreur dans l’identifiant ou le mot de passe");
        } else if (token) {
            // Stockage token et redirection
            localStorage.setItem("accessToken", token);
            window.location.href = "index.html";
        }
    } catch (err) {
        // Erreur réseau/serveur
        console.error("Erreur lors de la connexion:", err);
        displayError("Une erreur s'est produite. Veuillez réessayer plus tard.");
    }
}
