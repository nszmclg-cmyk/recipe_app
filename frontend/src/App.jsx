import { useState } from "react";
import { IngredientSection } from "./components/IngredientSection";
import { RecipeSection } from "./components/RecipeSection";
import "./App.css";

export default function App() {
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  return (
    <main className="page">
      <IngredientSection
        selectedIngredients={selectedIngredients}
        onSelectedIngredientsChange={setSelectedIngredients}
      />

      <RecipeSection selectedIngredients={selectedIngredients} />
    </main>
  );
}
