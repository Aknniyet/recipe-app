document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    async function loadRecipes() {
        try {
            const response = await fetch('http://localhost:5000/api/recipes');
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }
            const recipes = await response.json();

            const recipeList = document.getElementById('recipeList');
            if (!recipeList) return;

            recipeList.innerHTML = '';

            recipes.forEach(recipe => {
                const recipeCard = document.createElement('div');
                recipeCard.className = 'recipe-card';
                recipeCard.innerHTML = `
                    <img src="${recipe.image ? `http://localhost:5000${recipe.image}` : 'https://via.placeholder.com/300'}" alt="Recipe Image">
                    <div class="recipe-card-content">
                        <h3>${recipe.title}</h3>
                        <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
                    </div>
                    <div class="buttons">
                        <button class="view-recipe" data-id="${recipe._id}">View More</button>
                        <button class="delete-recipe" data-id="${recipe._id}">Delete</button>
                    </div>
                `;
                recipeList.appendChild(recipeCard);
            });

            // Обработчики событий для кнопок View More
            document.querySelectorAll('.view-recipe').forEach(button => {
                button.addEventListener('click', (e) => {
                    const recipeId = e.target.getAttribute('data-id');
                    viewRecipe(recipeId);
                });
            });

            // Обработчики событий для кнопок Delete
            document.querySelectorAll('.delete-recipe').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const recipeId = e.target.getAttribute('data-id');
                    await deleteRecipe(recipeId);
                });
            });

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    loadRecipes();
});

// Функция просмотра рецепта
async function viewRecipe(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
        if (!response.ok) {
            throw new Error('Recipe not found');
        }
        const recipe = await response.json();

        localStorage.setItem('currentRecipe', JSON.stringify(recipe));
        window.location.href = `recipe.html`;
    } catch (error) {
        alert(error.message);
    }
}

// Функция удаления рецепта
async function deleteRecipe(id) {
    const confirmDelete = confirm('Are you sure you want to delete this recipe?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You are not authenticated!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Recipe deleted successfully!');
            location.reload();
        } else {
            alert('Failed to delete recipe.');
        }
    } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('An error occurred while deleting the recipe.');
    }
}

