document.addEventListener('DOMContentLoaded', () => {
    // Добавление нового рецепта
    const recipeForm = document.getElementById('recipeForm');
    if (recipeForm) {
        recipeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const ingredients = document.getElementById('ingredients').value.split(',');
            const instructions = document.getElementById('instructions').value;

            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not authenticated!');
                return;
            }

            const response = await fetch('http://localhost:5000/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, ingredients, instructions })
            });

            if (response.ok) {
                alert('Recipe added successfully!');
                window.location.href = 'dashboard.html';
            } else {
                alert('Failed to add recipe.');
            }
        });
    }

    // Функция просмотра рецепта
    async function viewRecipe(id) {
        try {
            const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
            if (!response.ok) {
                throw new Error('Recipe not found');
            }
            const recipe = await response.json();

            console.log('Saving to localStorage:', recipe); // Отладка

            localStorage.setItem('currentRecipe', JSON.stringify(recipe));
            window.location.href = 'recipe.html';
        } catch (error) {
            alert(error.message);
        }
    }

    // Проверка загрузки рецепта на странице recipe.html
    if (window.location.pathname.includes('recipe.html')) {
        const recipeData = localStorage.getItem('currentRecipe');
        const recipeDetails = document.getElementById('recipeDetails');

        console.log('Loaded from localStorage:', recipeData); // Отладка

        if (recipeData) {
            const recipe = JSON.parse(recipeData);

            recipeDetails.innerHTML = `
                <h1>${recipe.title || 'Untitled Recipe'}</h1>
                <p><strong>Ingredients:</strong> ${Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : 'No ingredients provided'}</p>
                <p><strong>Instructions:</strong> ${recipe.instructions ? recipe.instructions : 'No instructions provided'}</p>
            `;
        } else {
            recipeDetails.innerHTML = `<p>Error: Recipe not found.</p>`;
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

    // Функция загрузки всех рецептов на dashboard.html
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

    if (window.location.pathname.includes('dashboard.html')) {
        loadRecipes();
    }

    // Функция выхода из системы
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }
});
