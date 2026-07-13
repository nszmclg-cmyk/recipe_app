<?php

use Aws\BedrockRuntime\BedrockRuntimeClient;

function getBedrockClient(): BedrockRuntimeClient
{
    return new BedrockRuntimeClient([
        'version' => 'latest',
        'region' => getenv('AWS_REGION') ?: 'ap-northeast-1',
    ]);
}

function resolveBedrockModelId(): string
{
    $modelId = getenv('BEDROCK_MODEL_ID') ?: 'global.anthropic.claude-haiku-4-5-20251001-v1:0';

    if ($modelId === 'anthropic.claude-haiku-4-5-20251001-v1:0') {
        return 'global.anthropic.claude-haiku-4-5-20251001-v1:0';
    }

    return $modelId;
}

function buildDishTypeSystemPrompt(): string
{
    return 'You classify Japanese dishes into exactly one category. Return only one of these labels with no explanation: 主食, 主菜, 副菜.';
}

function buildDishImageSystemPrompt(): string
{
    return implode(' ', [
        'You generate only valid, self-contained SVG markup.',
        'Never output markdown, explanations, XML declarations, or code fences.',
        'The SVG must be visually appealing, compact, and render correctly in a browser img tag.',
        'Prefer simple geometric shapes and layered fills over overly complex path data.',
    ]);
}

function buildDishTypeStyleGuide(string $dishType): string
{
    switch ($dishType) {
        case '主食':
            return 'The dish should feel filling and carb-forward, such as rice, noodles, or bread-like elements with warm beige, white, golden, or brown tones.';
        case '主菜':
            return 'The dish should emphasize a central protein with a richer, heartier presentation using warm browns, reds, orange highlights, and a few garnish colors.';
        case '副菜':
        default:
            return 'The dish should feel lighter and vegetable-forward with smaller portions, more greens, yellows, and fresh accent colors.';
    }
}

function buildDishImagePrompt(string $name, string $dishType): string
{
    return implode(' ', [
        "Create one top-down SVG illustration of a plated Japanese {$dishType} dish named \"{$name}\".",
        'The SVG must use viewBox="0 0 512 512" and fit comfortably inside the frame.',
        'Draw exactly one round white plate centered in the image with a subtle rim or soft shadow.',
        'Place the food fully inside the plate with a balanced composition and clear separation between ingredients.',
        'Make the food look appetizing and recognizable as cooked Japanese home cooking rather than abstract art.',
        buildDishTypeStyleGuide($dishType),
        'Use 6 to 12 major visible food shapes with layered colors for depth.',
        'Include small garnish or sauce accents only if they support the dish.',
        'Avoid text, logos, utensils, tables, backgrounds, people, and decorative frames.',
        'Use only safe SVG elements such as svg, g, path, circle, ellipse, rect, defs, linearGradient, and radialGradient.',
        'Do not use script, foreignObject, external images, CSS imports, or event handlers.',
        'Return only the final SVG markup.',
    ]);
}

function extractSvgMarkup(string $text): string
{
    $trimmed = trim($text);

    if ($trimmed === '') {
        return '';
    }

    if (preg_match('/```(?:svg)?\s*([\s\S]*?)```/i', $trimmed, $fencedMatch)) {
        $candidate = trim($fencedMatch[1]);
    } else {
        $candidate = $trimmed;
    }

    if (preg_match('/<svg[\s\S]*<\/svg>/i', $candidate, $svgMatch)) {
        return trim($svgMatch[0]);
    }

    return '';
}

function toSvgDataUrl(string $svgMarkup): string
{
    return 'data:image/svg+xml;charset=utf-8,' . rawurlencode($svgMarkup);
}
