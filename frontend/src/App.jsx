import { useState } from "react";
import { IngredientSection } from "./components/IngredientSection";
import { RecipeSection } from "./components/RecipeSection";
import { TrayPreview } from "./components/TrayPreview";
import { generateDishImage } from "./services/api";
import "./App.css";

const INITIAL_TRAY_ITEMS = {
  主食: {
    id: "default-rice",
    name: "白米",
    dishType: "主食",
    imageUrl: ""
  },
  主菜: null,
  副菜: null
};

export default function App() {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [trayItems, setTrayItems] = useState(INITIAL_TRAY_ITEMS);
  const [loadingDishType, setLoadingDishType] = useState("");
  const [trayErrorMessage, setTrayErrorMessage] = useState("");

  async function handlePlaceRecipe(recipe) {
    const dishType = recipe.dishType;

    if (!dishType || !["主食", "主菜", "副菜"].includes(dishType)) {
      return;
    }

    setLoadingDishType(dishType);
    setTrayErrorMessage("");

    try {
      const { imageUrl } = await generateDishImage(recipe);

      setTrayItems((prev) => ({
        ...prev,
        [dishType]: {
          id: recipe.id,
          name: recipe.name,
          dishType,
          imageUrl
        }
      }));
    } catch (error) {
      setTrayErrorMessage(
        `${recipe.name} のSVG生成に失敗しました。AWS 認証や Bedrock の利用設定を確認してください。`
      );
      setTrayItems((prev) => ({
        ...prev,
        [dishType]: {
          id: recipe.id,
          name: recipe.name,
          dishType,
          imageUrl: ""
        }
      }));
    } finally {
      setLoadingDishType("");
    }
  }

  function handleRemoveTrayItem(dishType) {
    setTrayItems((prev) => ({
      ...prev,
      [dishType]: INITIAL_TRAY_ITEMS[dishType]
    }));
  }

  return (
    <main className="page">
      <div className="content-column">
        <IngredientSection
          selectedIngredients={selectedIngredients}
          onSelectedIngredientsChange={setSelectedIngredients}
        />

        <RecipeSection
          selectedIngredients={selectedIngredients}
          onPlaceRecipe={handlePlaceRecipe}
        />
      </div>

      <TrayPreview
        trayItems={trayItems}
        loadingDishType={loadingDishType}
        errorMessage={trayErrorMessage}
        onRemoveTrayItem={handleRemoveTrayItem}
      />
    </main>
  );
}
