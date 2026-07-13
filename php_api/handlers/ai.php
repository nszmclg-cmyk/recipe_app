<?php

use Aws\BedrockRuntime\Exception\BedrockRuntimeException;

function handleRoot(): void
{
    jsonResponse(['message' => 'PHP API server is running']);
}

function handleClassifyDishType(): void
{
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        $name = trim($data['name'] ?? '');
        $ingredients = $data['ingredients'] ?? [];

        if ($name === '' || !is_array($ingredients) || count($ingredients) === 0) {
            errorResponse('name と ingredients は必須です', 400);
            return;
        }

        $prompt = trim(
            "次の料理を「主食」「主菜」「副菜」のどれか1語だけで判定してください。\n" .
            "必ず次の3択のどれかだけを返してください: 主食 / 主菜 / 副菜\n\n" .
            "料理名: {$name}\n" .
            '材料: ' . implode('、', $ingredients)
        );

        $client = getBedrockClient();

        $result = $client->converse([
            'modelId' => resolveBedrockModelId(),
            'system' => [
                [
                    'text' => buildDishTypeSystemPrompt(),
                ],
            ],
            'inferenceConfig' => [
                'maxTokens' => 1200,
                'temperature' => 0.2,
            ],
            'messages' => [
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'text' => $prompt,
                        ],
                    ],
                ],
            ],
        ]);

        $text = trim($result['output']['message']['content'][0]['text'] ?? '');

        $dishType = '副菜';

        if (str_contains($text, '主食')) {
            $dishType = '主食';
        } elseif (str_contains($text, '主菜')) {
            $dishType = '主菜';
        } elseif (str_contains($text, '副菜')) {
            $dishType = '副菜';
        }

        jsonResponse(['dishType' => $dishType]);
    } catch (BedrockRuntimeException $e) {
        errorResponse('料理区分の自動判定に失敗しました', 500);
    } catch (Throwable $e) {
        errorResponse('料理区分の自動判定に失敗しました', 500);
    }
}

function handleGenerateDishImage(): void
{
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        $name = trim($data['name'] ?? '');
        $dishType = trim($data['dishType'] ?? '');

        if ($name === '' || $dishType === '') {
            errorResponse('name と dishType は必須です', 400);
            return;
        }

        $prompt = buildDishImagePrompt($name, $dishType);
        $client = getBedrockClient();

        $result = $client->converse([
            'modelId' => resolveBedrockModelId(),
            'messages' => [
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'text' => $prompt,
                        ],
                    ],
                ],
            ],
        ]);

        $text = $result['output']['message']['content'][0]['text'] ?? '';
        $svgMarkup = extractSvgMarkup($text);

        if ($svgMarkup === '') {
            errorResponse('料理SVGの生成結果が取得できませんでした', 500);
            return;
        }

        jsonResponse(['imageUrl' => toSvgDataUrl($svgMarkup)]);
    } catch (BedrockRuntimeException $e) {
        errorResponse('料理画像の生成に失敗しました', 500);
    } catch (Throwable $e) {
        errorResponse('料理画像の生成に失敗しました', 500);
    }
}
