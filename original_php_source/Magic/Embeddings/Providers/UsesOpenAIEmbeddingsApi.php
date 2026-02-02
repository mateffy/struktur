<?php

namespace Mateffy\Magic\Embeddings\Providers;

use Closure;
use Mateffy\Magic\Chat\TokenStats;
use Mateffy\Magic\Embeddings\EmbeddedData;
use OpenAI;

trait UsesOpenAIEmbeddingsApi
{
    public function get(string $input, ?Closure $onTokenStats = null): EmbeddedData
    {
        $client = OpenAI::client(
			apiKey: config('llm-magic.apis.openai.token'),
			organization: config('llm-magic.apis.openai.organization_id')
		);

		$response = $client
			->embeddings()
			->create([
				'model' => $this->model,
				'input' => $input,
			]);

        if ($response->usage && $onTokenStats) {
            $onTokenStats(new TokenStats(
                tokens: $response->usage->totalTokens,
                inputTokens: $response->usage->promptTokens,
                outputTokens: 0
            ));
        }

        return new EmbeddedData(vectors: $response->embeddings[0]->embedding);
    }
}
