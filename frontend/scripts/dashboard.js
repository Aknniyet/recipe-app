document.addEventListener('DOMContentLoaded', () => {
    const searchContainer = document.createElement("div");
    searchContainer.classList.add("search-container");

    const searchInput = document.createElement("input");
    searchInput.setAttribute("type", "text");
    searchInput.setAttribute("id", "searchInput");
    searchInput.setAttribute("placeholder", "Search recipes...");
    searchInput.classList.add("search-bar");

    const searchButton = document.createElement("button");
    searchButton.innerText = "Search";
    searchButton.classList.add("search-button");
    searchButton.addEventListener("click", filterRecipes);

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);

    const container = document.querySelector(".container");
    container.insertBefore(searchContainer, container.children[1]);

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    let allRecipes = []; // Store all recipes globally for filtering

    async function loadRecipes() {
        try {
            const response = await fetch('http://localhost:5000/api/recipes');
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }
            allRecipes = await response.json(); // Store recipes globally
            displayRecipes(allRecipes);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    function displayRecipes(recipes) {
        const recipeList = document.getElementById('recipeList');
        if (!recipeList) return;

        recipeList.innerHTML = '';

        if (recipes.length === 0) {
            recipeList.innerHTML = "<p>No recipes found.</p>";
            return;
        }

        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.innerHTML = `
                <img src="${recipe.image ? `http://localhost:5000${recipe.image}` : 'https://via.placeholder.com/300'}" alt="Recipe Image">
                <div class="recipe-card-content">
                    <h3>${recipe.title}</h3>
                    <p><strong>Ingredients:</strong> ${Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : recipe.ingredients}</p>
                </div>
                <div class="buttons">
                    <button class="view-recipe" data-id="${recipe._id}">View More</button>
                    <button class="delete-recipe" data-id="${recipe._id}">Delete</button>
                </div>
            `;
            recipeList.appendChild(recipeCard);
        });

        document.querySelectorAll('.view-recipe').forEach(button => {
            button.addEventListener('click', (e) => {
                const recipeId = e.target.getAttribute('data-id');
                viewRecipe(recipeId);
            });
        });

        document.querySelectorAll('.delete-recipe').forEach(button => {
            button.addEventListener('click', async (e) => {
                const recipeId = e.target.getAttribute('data-id');
                await deleteRecipe(recipeId);
            });
        });
    }

    function filterRecipes() {
        const searchValue = searchInput.value.toLowerCase().trim(); // Get search value and remove spaces
        if (searchValue === "") {
            displayRecipes(allRecipes); // Show all recipes if search is empty
            return;
        }

        const filteredRecipes = allRecipes.filter(recipe =>
            recipe.title.toLowerCase().includes(searchValue) // Search only in title
        );

        displayRecipes(filteredRecipes);
    }

    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            filterRecipes();
        }
    });

    loadRecipes();
});
