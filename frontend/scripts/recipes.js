document.getElementById('recipeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const ingredients = document.getElementById('ingredients').value.split(',');
    const instructions = document.getElementById('instructions').value;

    await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, ingredients, instructions })
    });

    alert('Recipe added successfully!');
    window.location.href = 'dashboard.html';
});

async function viewRecipe(id) {
    const response = await fetch(`http://localhost:5000/api/recipes/${id}`);
    const recipe = await response.json();

    localStorage.setItem('currentRecipe', JSON.stringify(recipe));
    window.location.href = 'recipe.html';
}

if (window.location.pathname.includes('recipe.html')) {
    const recipe = JSON.parse(localStorage.getItem('currentRecipe'));
    const recipeDetails = document.getElementById('recipeDetails');

    recipeDetails.innerHTML = `
        <h1>${recipe.title}</h1>
        <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
        <p><strong>Instructions:</strong> ${recipe.instructions}</p>
    `;
}

async function deleteRecipe(id) {
    await fetch(`http://localhost:5000/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    alert('Recipe deleted!');
    window.location.reload();
}

