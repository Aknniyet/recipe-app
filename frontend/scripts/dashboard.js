document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

async function loadRecipes() {
    const response = await fetch('http://localhost:5000/api/recipes');
    const recipes = await response.json();

    const recipeList = document.getElementById('recipeList');
    recipeList.innerHTML = '';

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <h3>${recipe.title}</h3>
            <button onclick="viewRecipe('${recipe._id}')">View</button>
            <button onclick="deleteRecipe('${recipe._id}')">Delete</button>
        `;
        recipeList.appendChild(recipeCard);
    });
}

loadRecipes();

