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
                    <h3>${recipe.title}</h3>
                    <button class="view-recipe" data-id="${recipe._id}">View</button>
                    <button class="delete-recipe" data-id="${recipe._id}">Delete</button>
                `;
                recipeList.appendChild(recipeCard);
            });

            // Добавляем обработчики событий для кнопок после их создания
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

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    loadRecipes();
});

// Функция просмотра рецепта (Обновлено)
async function viewRecipe(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
        if (!response.ok) {
            throw new Error('Recipe not found');
        }
        const recipe = await response.json();

        localStorage.setItem('currentRecipe', JSON.stringify(recipe));
        window.location.href = 'recipe.html';
    } catch (error) {
        alert(error.message);
    }
}

// Функция удаления рецепта (Обновлено)
async function deleteRecipe(id) {
    const confirmDelete = confirm('Are you sure you want to delete this recipe?');
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You are not authenticated!');
        return;
    }

    const response = await fetch(`http://localhost:5000/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        alert('Recipe deleted successfully!');
        loadRecipes(); // Загружаем рецепты снова без перезагрузки страницы
    } else {
        alert('Failed to delete recipe.');
    }
}
