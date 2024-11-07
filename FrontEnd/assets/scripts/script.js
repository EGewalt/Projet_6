
async function loadProjects() {
    try {
        const response = await fetch('http://localhost:5678/api/works'); 
        const projects = await response.json();
        
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';

        projects.forEach(project => {
            const figure = document.createElement('figure');
            const img = document.createElement('img');
            const figcaption = document.createElement('figcaption');

            img.src = project.imageUrl;
            img.alt = project.title;
            figcaption.textContent = project.title;

            figure.appendChild(img);
            figure.appendChild(figcaption);

            gallery.appendChild(figure);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des projets :", error);
    }
}

document.addEventListener("DOMContentLoaded", loadProjects);
