const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function getIngredients() {
  const response = await fetch(`${BASE_URL}/ingredients`);
  return response.json();
}

export async function addIngredient(name) {
  const response = await fetch(`${BASE_URL}/ingredients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "食材の保存に失敗しました");
  }

  return response.json();
}

export async function deleteIngredient(id) {
  const response = await fetch(`${BASE_URL}/ingredients/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "食材の削除に失敗しました");
  }
}

export async function getRecipes() {
  const response = await fetch(`${BASE_URL}/recipes`);
  return response.json();
}

export async function addRecipe(recipe) {
  const response = await fetch(`${BASE_URL}/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recipe)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "レシピの保存に失敗しました");
  }

  return response.json();
}

export async function classifyDishType(recipe) {
  const response = await fetch(`${BASE_URL}/classify-dish-type`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recipe)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "料理区分の判定に失敗しました");
  }

  return response.json();
}

export async function generateDishImage(recipe) {
  const response = await fetch(`${BASE_URL}/generate-dish-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recipe)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "料理画像の生成に失敗しました");
  }

  return response.json();
}

export async function deleteRecipe(id) {
  const response = await fetch(`${BASE_URL}/recipes/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "レシピの削除に失敗しました");
  }
}
