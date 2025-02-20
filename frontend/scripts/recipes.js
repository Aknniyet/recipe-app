document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("recipeForm"); // Обновленный ID формы

    if (!form) {
        console.error("Форма recipeForm не найдена!");
        return;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("title", document.getElementById("title").value.trim());
        formData.append("ingredients", document.getElementById("ingredients").value.trim());
        formData.append("instructions", document.getElementById("instructions").value.trim());

        // Проверка, есть ли категория
        const categoryElement = document.getElementById("category");
        const category = categoryElement ? categoryElement.value.trim() : "No Category";
        formData.append("category", category);

        // Проверка, есть ли изображение
        const imageFile = document.getElementById("image").files[0];
        if (imageFile) {
            formData.append("image", imageFile);
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Вы не авторизованы");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/recipes", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                alert("Рецепт успешно добавлен!");
                window.location.href = "dashboard.html";
            } else {
                alert("Ошибка при добавлении рецепта: " + (result.message || "Неизвестная ошибка"));
            }
        } catch (error) {
            console.error("Ошибка при добавлении рецепта:", error);
            alert("Произошла ошибка при добавлении рецепта.");
        }
    });
});
