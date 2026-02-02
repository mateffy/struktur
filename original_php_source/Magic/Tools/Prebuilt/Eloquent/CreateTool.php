<?php

namespace Mateffy\Magic\Tools\Prebuilt\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Mateffy\Magic;
use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Tools\InvokableTool;
use Mateffy\Magic\Tools\ValidateWithSchema;

class CreateTool extends EloquentTool
{
	use ValidateWithSchema;

	public function getFunctionName(): string
	{
		return 'create';
	}

	public function schema(): array
	{
		return [
            'name' => $this->name(),
            'description' => "Create a new database record of the {$this->model_slug_singular} model.",
            'arguments' => [
				'data' => $this->getModelSchema()
            ],
			'required' => ['data'],
		];
	}

	public function execute(ToolCall $call): mixed
	{
		$data = $call->arguments['data'] ?? null;

		if (is_null($data)) {
			throw new \InvalidArgumentException('Data is required');
		}

		$model = $this->model_classpath;

		return $model::create($data);
	}

}