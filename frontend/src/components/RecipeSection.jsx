import { useEffect, useState } from "react";
import { addRecipe, deleteRecipe, getRecipes } from "../services/api";

export function RecipeSection({ selectedIngredients }) {
  const [recipes, setRecipes] = useState([]);
  const [recipeName, setRecipeName] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadRecipes();
  }, []);

  async function loadRecipes() {
    const data = await getRecipes();
    setRecipes(data);
  }

  async function handleSubmit() {
    const newRecipe = {
      name: recipeName.trim(),
      ingredients: recipeIngredients
        .split("/")
        .map((item) => item.trim())
        .filter((item) => item !== "")
    };

    if (!newRecipe.name || newRecipe.ingredients.length === 0) return;

    try {
      await addRecipe(newRecipe);
      setRecipeName("");
      setRecipeIngredients("");
      setErrorMessage("");
      await loadRecipes();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteRecipe(id) {
    try {
      await deleteRecipe(id);
      setErrorMessage("");
      await loadRecipes();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const filteredRecipes = recipes.filter((recipe) => {
    if (selectedIngredients.length === 0) return true;

    return selectedIngredients.every((ingredient) =>
      recipe.ingredients.includes(ingredient)
    );
  });

  return (
    <section>
      <h1>レシピ一覧</h1>

      <input
        type="text"
        value={recipeName}
        onChange={(e) => setRecipeName(e.target.value)}
        placeholder="レシピ名"
      />
      <input
        type="text"
        value={recipeIngredients}
        onChange={(e) => setRecipeIngredients(e.target.value)}
        placeholder="材料を / 区切りで入力"
      />
      <button onClick={handleSubmit}>追加</button>
      {errorMessage ? <p>{errorMessage}</p> : null}

      <ul className="recipe-list">
        {filteredRecipes.map((recipe) => (
          <li key={recipe.id} className="recipe-item">
            <div className="recipe-text">
              <span className="recipe-title">{recipe.name}</span>
              <span className="recipe-ingredients">
                {recipe.ingredients.join(" / ")}
              </span>
            </div>
            <button
              className="delete-button"
              onClick={() => handleDeleteRecipe(recipe.id)}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
