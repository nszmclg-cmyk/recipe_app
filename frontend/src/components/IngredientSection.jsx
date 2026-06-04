import { useEffect, useState } from "react";
import {
  addIngredient,
  deleteIngredient,
  getIngredients
} from "../services/api";

export function IngredientSection({
  selectedIngredients,
  onSelectedIngredientsChange
}) {
  const [items, setItems] = useState([]);
  const [inputText, setInputText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const data = await getIngredients();
    setItems(data);
  }

  async function handleSubmit() {
    const text = inputText.trim();
    if (!text) return;

    try {
      await addIngredient(text);
      setInputText("");
      setErrorMessage("");
      await loadItems();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleDeleteItem(item) {
    try {
      await deleteIngredient(item.id);
      setErrorMessage("");
      onSelectedIngredientsChange(
        selectedIngredients.filter((ingredient) => ingredient !== item.name)
      );
      await loadItems();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleToggleIngredient(name) {
    onSelectedIngredientsChange(
      selectedIngredients.includes(name)
        ? selectedIngredients.filter((item) => item !== name)
        : [...selectedIngredients, name]
    );
  }

  return (
    <section>
      <h1>食材一覧</h1>

      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="例：卵"
      />
      <button onClick={handleSubmit}>追加</button>
      {errorMessage ? <p>{errorMessage}</p> : null}

      <ul id="list">
        {items.map((item) => (
          <li key={item.id} className="ingredient-item">
            <label>
              <input
                type="checkbox"
                checked={selectedIngredients.includes(item.name)}
                onChange={() => handleToggleIngredient(item.name)}
              />
              {item.name}
            </label>
            <button
              className="delete-button"
              onClick={() => handleDeleteItem(item)}
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
