import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import {
  BedrockRuntimeClient,
  ConverseCommand
} from "@aws-sdk/client-bedrock-runtime";

const app = express();
const port = process.env.PORT || 3001;
const db = new sqlite3.Database("./recipes.db");
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-northeast-1"
});

function resolveBedrockModelId() {
  const modelId =
    process.env.BEDROCK_MODEL_ID ||
    "global.anthropic.claude-haiku-4-5-20251001-v1:0";

  if (modelId === "anthropic.claude-haiku-4-5-20251001-v1:0") {
    return "global.anthropic.claude-haiku-4-5-20251001-v1:0";
  }

  return modelId;
}

function buildDishImageSystemPrompt() {
  return [
    "You generate only valid, self-contained SVG markup.",
    "Never output markdown, explanations, XML declarations, or code fences.",
    "The SVG must be visually appealing, compact, and render correctly in a browser img tag.",
    "Prefer simple geometric shapes and layered fills over overly complex path data."
  ].join(" ");
}

function buildDishTypeStyleGuide(dishType) {
  switch (dishType) {
    case "主食":
      return "The dish should feel filling and carb-forward, such as rice, noodles, or bread-like elements with warm beige, white, golden, or brown tones.";
    case "主菜":
      return "The dish should emphasize a central protein with a richer, heartier presentation using warm browns, reds, orange highlights, and a few garnish colors.";
    case "副菜":
    default:
      return "The dish should feel lighter and vegetable-forward with smaller portions, more greens, yellows, and fresh accent colors.";
  }
}

function buildDishImagePrompt(name, dishType) {
  return [
    `Create one top-down SVG illustration of a plated Japanese ${dishType} dish named "${name}".`,
    "The SVG must use viewBox=\"0 0 512 512\" and fit comfortably inside the frame.",
    "Draw exactly one round white plate centered in the image with a subtle rim or soft shadow.",
    "Place the food fully inside the plate with a balanced composition and clear separation between ingredients.",
    "Make the food look appetizing and recognizable as cooked Japanese home cooking rather than abstract art.",
    buildDishTypeStyleGuide(dishType),
    "Use 6 to 12 major visible food shapes with layered colors for depth.",
    "Include small garnish or sauce accents only if they support the dish.",
    "Avoid text, logos, utensils, tables, backgrounds, people, and decorative frames.",
    "Use only safe SVG elements such as svg, g, path, circle, ellipse, rect, defs, linearGradient, and radialGradient.",
    "Do not use script, foreignObject, external images, CSS imports, or event handlers.",
    "Return only the final SVG markup."
  ].join(" ");
}

function extractSvgMarkup(text) {
  if (!text) {
    return "";
  }

  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:svg)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;
  const svgMatch = candidate.match(/<svg[\s\S]*<\/svg>/i);

  return svgMatch ? svgMatch[0].trim() : "";
}

function toSvgDataUrl(svgMarkup) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
}

app.use(cors());
app.use(express.json());

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      dish_type TEXT
    )
  `);

  db.run(`ALTER TABLE recipes ADD COLUMN dish_type TEXT`, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("recipesテーブル更新エラー", err);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM ingredients", [], (err, row) => {
    if (err) {
      console.error("ingredients初期化エラー", err);
      return;
    }

    if (row.count === 0) {
      const defaultItems = ["卵", "玉ねぎ", "じゃがいも", "にんじん", "豚肉"];
      const stmt = db.prepare("INSERT INTO ingredients (name) VALUES (?)");

      defaultItems.forEach((item) => {
        stmt.run(item);
      });

      stmt.finalize();
    }
  });
});

app.get("/", (req, res) => {
  res.send("API server is running");
});

app.post("/classify-dish-type", async (req, res) => {
  const { name, ingredients } = req.body;

  if (!name || !Array.isArray(ingredients) || ingredients.length === 0) {
    res.status(400).json({ error: "name と ingredients は必須です" });
    return;
  }

  const prompt = `
次の料理を「主食」「主菜」「副菜」のどれか1語だけで判定してください。
必ず次の3択のどれかだけを返してください: 主食 / 主菜 / 副菜

料理名: ${name}
材料: ${ingredients.join("、")}
  `.trim();

  try {
    const command = new ConverseCommand({
      modelId: resolveBedrockModelId(),
      system: [
        {
          text: buildDishImageSystemPrompt()
        }
      ],
      inferenceConfig: {
        maxTokens: 1200,
        temperature: 0.2,
        topP: 0.9
      },
      messages: [
        {
          role: "user",
          content: [{ text: prompt }]
        }
      ]
    });

    const response = await bedrock.send(command);
    const text = response.output?.message?.content?.[0]?.text?.trim() || "";

    let dishType = "副菜";

    if (text.includes("主食")) {
      dishType = "主食";
    } else if (text.includes("主菜")) {
      dishType = "主菜";
    } else if (text.includes("副菜")) {
      dishType = "副菜";
    }

    res.json({ dishType });
  } catch (error) {
    console.error("Bedrock classify error:", error);
    res.status(500).json({ error: "料理区分の自動判定に失敗しました" });
  }
});

app.post("/generate-dish-image", async (req, res) => {
  const { name, dishType } = req.body;

  if (!name || !dishType) {
    res.status(400).json({ error: "name と dishType は必須です" });
    return;
  }

  const prompt = buildDishImagePrompt(name, dishType);

  try {
    const command = new ConverseCommand({
      modelId: resolveBedrockModelId(),
      messages: [
        {
          role: "user",
          content: [{ text: prompt }]
        }
      ]
    });

    const response = await bedrock.send(command);
    const svgMarkup = extractSvgMarkup(
      response.output?.message?.content?.[0]?.text
    );

    if (!svgMarkup) {
      res.status(500).json({ error: "料理SVGの生成結果が取得できませんでした" });
      return;
    }

    res.json({
      imageUrl: toSvgDataUrl(svgMarkup)
    });
  } catch (error) {
    console.error("Bedrock SVG error:", error);
    res.status(500).json({ error: "料理SVGの生成に失敗しました" });
  }
});

app.get("/ingredients", (req, res) => {
  db.all("SELECT * FROM ingredients ORDER BY id", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: "食材の読み込みに失敗しました" });
      return;
    }

    res.json(rows);
  });
});

app.post("/ingredients", (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ error: "name は必須です" });
    return;
  }

  db.run(
    "INSERT INTO ingredients (name) VALUES (?)",
    [name.trim()],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          res.status(400).json({ error: "同じ食材はすでに登録されています" });
          return;
        }

        res.status(500).json({ error: "食材の保存に失敗しました" });
        return;
      }

      res.status(201).json({
        id: this.lastID,
        name: name.trim()
      });
    }
  );
});

app.delete("/ingredients/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM ingredients WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: "食材の削除に失敗しました" });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "食材が見つかりません" });
      return;
    }

    res.json({ message: "削除しました" });
  });
});

app.get("/recipes", (req, res) => {
  db.all("SELECT * FROM recipes", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: "DBの読み込みに失敗しました" });
      return;
    }

    const recipes = rows.map((row) => ({
      id: row.id,
      name: row.name,
      ingredients: JSON.parse(row.ingredients),
      dishType: row.dish_type
    }));

    res.json(recipes);
  });
});

app.post("/recipes", (req, res) => {
  const { name, ingredients, dishType } = req.body;

  if (!name || !Array.isArray(ingredients) || ingredients.length === 0 || !dishType) {
    res.status(400).json({ error: "name と ingredients と dishType は必須です" });
    return;
  }

  const sql = "INSERT INTO recipes (name, ingredients, dish_type) VALUES (?, ?, ?)";
  const params = [name, JSON.stringify(ingredients), dishType];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: "DBへの保存に失敗しました" });
      return;
    }

    res.status(201).json({
      id: this.lastID,
      name,
      ingredients,
      dishType
    });
  });
});

app.delete("/recipes/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM recipes WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: "DBからの削除に失敗しました" });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "レシピが見つかりません" });
      return;
    }

    res.json({ message: "削除しました" });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
