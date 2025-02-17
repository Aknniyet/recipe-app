document.addEventListener('DOMContentLoaded', () => {
    // Функция для отправки нового рецепта в базу данных
    const recipeForm = document.getElementById('recipeForm');
    if (recipeForm) {
        recipeForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const title = document.getElementById('title').value.trim();
            const ingredients = document.getElementById('ingredients').value.trim().split(',');
            const instructions = document.getElementById('instructions').value.trim();

            if (!title || !ingredients.length || !instructions) {
                alert('Please fill in all fields');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not authenticated!');
                return;
            }

            try {
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
                    window.location.href = 'dashboard.html'; // Перенаправление на Home после добавления
                } else {
                    alert('Failed to add recipe');
                }
            } catch (error) {
                console.error('Error adding recipe:', error);
                alert('An error occurred while adding the recipe.');
            }
        });
    }

    // Функция загрузки рецептов на recipe.html
    if (window.location.pathname.includes('recipe.html')) {
        const recipeData = localStorage.getItem('currentRecipe');
        const recipeDetails = document.getElementById('recipeDetails');

        if (recipeData) {
            const recipe = JSON.parse(recipeData);

            recipeDetails.innerHTML = `
                <div class="recipe-card">
                    <img src="${recipe.image || 'https://via.placeholder.com/300'}" alt="Recipe Image">
                    <h1>${recipe.title || 'Untitled Recipe'}</h1>
                    <p><strong>Ingredients:</strong> ${Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : 'No ingredients provided'}</p>
                    <p><strong>Instructions:</strong> ${recipe.instructions ? recipe.instructions : 'No instructions provided'}</p>
                </div>
            `;
        } else {
            recipeDetails.innerHTML = `<p>Error: Recipe not found.</p>`;
        }
    }
});
