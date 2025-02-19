document.addEventListener("DOMContentLoaded", function () {
    console.log("edit-recipe.js loaded!"); // Checking script loading

    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get("id");

    if (!recipeId) {
        alert("Error: Recipe not found.");
        return;
    }

    // Loading current recipe data
    fetch(`http://localhost:5000/api/recipes/${recipeId}`)
        .then(response => response.json())
        .then(recipe => {
            console.log("Current recipe data:", recipe);

            document.getElementById("title").value = recipe.title;
            document.getElementById("ingredients").value = recipe.ingredients.join(", ");
            document.getElementById("instructions").value = recipe.instructions;
        })
        .catch(error => {
            console.error("Error loading recipe:", error);
            alert("Failed to load recipe data.");
        });

    // Form submission handler for saving changes
    document.getElementById("editRecipeForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("title", document.getElementById("title").value.trim());
        formData.append("ingredients", document.getElementById("ingredients").value.trim());
        formData.append("instructions", document.getElementById("instructions").value.trim());

        const imageFile = document.getElementById("image").files[0];
        if (imageFile) {
            formData.append("image", imageFile);
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not authorized!");
            return;
        }

        try {
            console.log("Sending data to the server...");
            const response = await fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            console.log("Server response:", result);

            if (response.ok) {
                alert("Recipe updated successfully!");
                window.location.href = `recipe.html?id=${recipeId}`;
            } else {
                alert("Error updating recipe: " + result.message);
            }
        } catch (error) {
            console.error("Error updating recipe:", error);
            alert("An error occurred while updating the recipe.");
        }
    });
});
