document.addEventListener("DOMContentLoaded", function () {
    let allRecipes = [];
    const role = localStorage.getItem("role");

    async function loadRecipes() {
        try {
            const response = await fetch("http://localhost:5000/api/recipes");
            if (!response.ok) throw new Error("Failed to fetch recipes");

            allRecipes = await response.json();
            displayRecipes(allRecipes);
            populateCategories(allRecipes);
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
                    <p><strong>Category:</strong> ${recipe.category || "No Category"}</p>
                    <p><strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}</p>
                </div>
                <div class="buttons">
                    <button onclick="viewRecipe('${recipe._id}')">View More</button>
                    ${role === "admin" ? `
                        <button onclick="editRecipe('${recipe._id}')">Edit</button>
                        <button onclick="deleteRecipe('${recipe._id}')">Delete</button>
                    ` : ""}
                </div>
            `;
            recipeContainer.appendChild(recipeCard);
        });
    }

    function filterRecipes() {
        const searchValue = document.getElementById("searchInput").value.toLowerCase().trim();
        const selectedCategory = document.getElementById("categoryFilter").value;

        let filteredRecipes = allRecipes.filter(recipe =>
            recipe.title.toLowerCase().includes(searchValue)
        );

        if (selectedCategory !== "All Categories") {
            filteredRecipes = filteredRecipes.filter(recipe => recipe.category === selectedCategory);
        }

        displayRecipes(filteredRecipes);
    }

    function populateCategories(recipes) {
        const categoryFilter = document.getElementById("categoryFilter");
        const categories = ["All Categories", ...new Set(recipes.map(recipe => recipe.category).filter(Boolean))];

        categoryFilter.innerHTML = categories.map(category => `<option value="${category}">${category}</option>`).join("");
    }

    document.getElementById("searchButton").addEventListener("click", filterRecipes);
    document.getElementById("searchInput").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            filterRecipes();
        }
    });

    document.getElementById("categoryFilter").addEventListener("change", filterRecipes);

    window.viewRecipe = function (id) {
        window.location.href = `recipe.html?id=${id}`;
    };

    window.editRecipe = function (id) {
        window.location.href = `edit-recipe.html?id=${id}`;
    };

    window.deleteRecipe = async function (id) {
        if (!confirm("Are you sure you want to delete this recipe?")) return;

        const token = localStorage.getItem("token");
        await fetch(`http://localhost:5000/api/recipes/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        alert("Recipe deleted!");
        loadRecipes();
    };

    document.getElementById("logout").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "index.html";
    });

    loadRecipes();
});
