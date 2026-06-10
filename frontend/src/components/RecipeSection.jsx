import { useEffect, useState } from "react";
import {
  addRecipe,
  deleteRecipe,
  getRecipes,
  classifyDishType
} from "../services/api";

export function RecipeSection({ selectedIngredients, onPlaceRecipe }) {
  const [recipes, setRecipes] = useState([]);
  const [recipeName, setRecipeName] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [dishType, setDishType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadRecipes();
  }, []);

  async function loadRecipes() {
    const data = await getRecipes();
    setRecipes(data);
  }

  async function handleClassifyDishType() {
    const ingredients = recipeIngredients
      .split("/")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    if (!recipeName.trim() || ingredients.length === 0) {
      setErrorMessage("料理区分の自動判定にはレシピ名と材料が必要です");
      return;
    }

    try {
      const result = await classifyDishType({
        name: recipeName.trim(),
        ingredients
      });
      setDishType(result.dishType);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleSubmit() {
    const newRecipe = {
      name: recipeName.trim(),
      ingredients: recipeIngredients
        .split("/")
        .map((item) => item.trim())
        .filter((item) => item !== ""),
      dishType
    };

    if (!newRecipe.name || newRecipe.ingredients.length === 0 || !newRecipe.dishType) {
      setErrorMessage("レシピ名・材料・料理区分を入力してください");
      return;
    }

    try {
      await addRecipe(newRecipe);
      setRecipeName("");
      setRecipeIngredients("");
      setDishType("");
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
      <select value={dishType} onChange={(e) => setDishType(e.target.value)}>
        <option value="">料理区分を選択</option>
        <option value="主食">主食</option>
        <option value="主菜">主菜</option>
        <option value="副菜">副菜</option>
      </select>
      <button
        type="button"
        className="classify-button"
        onClick={handleClassifyDishType}
      >
        自動判定
      </button>
      <button onClick={handleSubmit}>追加</button>
      {errorMessage ? <p>{errorMessage}</p> : null}

      <ul className="recipe-list">
        {filteredRecipes.map((recipe) => (
          <li key={recipe.id} className="recipe-item">
            <div className="recipe-text">
              <div className="recipe-heading">
                <span className="recipe-title">{recipe.name}</span>
                <span
                  className={`recipe-dish-type recipe-dish-type-${recipe.dishType || "unknown"}`}
                >
                  {recipe.dishType || "未設定"}
                </span>
              </div>
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
            <button
              className="tray-button"
              onClick={() => onPlaceRecipe(recipe)}
            >
              お盆に置く
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
