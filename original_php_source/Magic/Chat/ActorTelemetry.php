<?php

namespace Mateffy\Magic\Chat;

use Mateffy\Magic\Models\LLM;

readonly class ActorTelemetry
{
    public function __construct(
        public string $id,
        public string $model,
        public ?string $system_prompt,
    ) {}

    public function toDatabase(): array
    {
        return [
            'model' => $this->model,
            'system_prompt' => $this->system_prompt,
        ];
    }

	public static function fromLLM(string $id, LLM $llm, ?Prompt $prompt): static
	{
		return new ActorTelemetry(
			id: $id,
			model: "{$llm->getOrganization()->id}/{$llm->getModelName()}",
			system_prompt: $prompt?->system(),
		);
	}
}
