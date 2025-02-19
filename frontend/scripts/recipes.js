document.addEventListener('DOMContentLoaded', () => {
    const recipeForm = document.getElementById('recipeForm');
    
    if (recipeForm) {
        recipeForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData();
            formData.append('title', document.getElementById('title').value.trim());
            formData.append('ingredients', document.getElementById('ingredients').value.trim());
            formData.append('instructions', document.getElementById('instructions').value.trim());
            formData.append('image', document.getElementById('image').files[0]);

            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not authenticated!');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/recipes', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    alert('Recipe added successfully!');
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Failed to add recipe');
                }
            } catch (error) {
                console.error('Error adding recipe:', error);
                alert('An error occurred while adding the recipe.');
            }
        });
    }
});
