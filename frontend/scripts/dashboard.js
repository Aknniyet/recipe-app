
        document.addEventListener("DOMContentLoaded", function () {
            let allRecipes = [];

            async function loadRecipes() {
                try {
                    const response = await fetch("http://localhost:5000/api/recipes");
                    if (!response.ok) {
                        throw new Error("Failed to fetch recipes");
                    }
                    allRecipes = await response.json();
                    displayRecipes(allRecipes);
                } catch (error) {
                    console.error("Error fetching recipes:", error);
                }
            }

            function displayRecipes(recipes) {
                const recipeContainer = document.getElementById("recipeList");
                recipeContainer.innerHTML = "";
                if (recipes.length === 0) {
                    recipeContainer.innerHTML = "<p>No recipes found.</p>";
                    return;
                }

                recipes.forEach(recipe => {
                    const imageUrl = recipe.image ? `http://localhost:5000${recipe.image}` : "https://via.placeholder.com/300";
                    const recipeCard = document.createElement("div");
                    recipeCard.classList.add("recipe-card");
                    recipeCard.innerHTML = `
                        <img src="${imageUrl}" alt="Recipe Image">
                        <div class="recipe-card-content">
                            <h3>${recipe.title}</h3>
                            <p><strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}</p>
                        </div>
                        <div class="buttons">
                            <button onclick="viewRecipe('${recipe._id}')">View More</button>
                            <button class="delete-recipe" data-id="${recipe._id}">Delete</button>
                        </div>
                    `;
                    recipeContainer.appendChild(recipeCard);
                });

                document.querySelectorAll(".delete-recipe").forEach(button => {
                    button.addEventListener("click", async (e) => {
                        const recipeId = e.target.getAttribute("data-id");
                        await deleteRecipe(recipeId);
                    });
                });
            }

            function filterRecipes() {
                const searchValue = document.getElementById("searchInput").value.toLowerCase().trim();
                if (searchValue === "") {
                    displayRecipes(allRecipes);
                    return;
                }

                const filteredRecipes = allRecipes.filter(recipe =>
                    recipe.title.toLowerCase().includes(searchValue)
                );

                displayRecipes(filteredRecipes);
            }

            document.getElementById("searchButton").addEventListener("click", filterRecipes);
            document.getElementById("searchInput").addEventListener("keypress", (event) => {
                if (event.key === "Enter") {
                    filterRecipes();
                }
            });

            window.viewRecipe = function (id) {
                window.location.href = `recipe.html?id=${id}`;
            };

            async function deleteRecipe(id) {
                const confirmDelete = confirm("Are you sure you want to delete this recipe?");
                if (!confirmDelete) return;

                const token = localStorage.getItem("token");
                if (!token) {
                    alert("You are not authenticated!");
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:5000/api/recipes/${id}`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        alert("Recipe deleted successfully!");
                        loadRecipes();
                    } else {
                        alert("Failed to delete recipe.");
                    }
                } catch (error) {
                    console.error("Error deleting recipe:", error);
                    alert("An error occurred while deleting the recipe.");
                }
            }

            document.getElementById("logout").addEventListener("click", () => {
                localStorage.removeItem("token");
                window.location.href = "index.html";
            });

            loadRecipes();
        });
