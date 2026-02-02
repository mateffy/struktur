<?php

namespace Mateffy\Magic\Tools\Prebuilt\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Mateffy\Magic;
use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Tools\InvokableTool;
use Mateffy\Magic\Tools\ValidateWithSchema;

class GetTool extends EloquentTool
{
	use ValidateWithSchema;

	public function getFunctionName(): string
	{
		return 'get';
	}

	public function schema(): array
	{
		return [
            'name' => $this->name(),
            'description' => "Get a single database record of the {$this->model_slug_singular} model.",
            'arguments' => [
				'id' => $this->getIdSchema()
            ],
			'required' => ['id'],
		];
	}

	public function execute(ToolCall $call): mixed
	{
		$id = $call->arguments['id'] ?? null;

		if (is_null($id)) {
			throw new \InvalidArgumentException('ID is required');
		}

		$model = $this->model_classpath;
		$query = $model::query();

		if ($this->with) {
			$query->with($this->with);
		}

		$record = $query->find($id);

		if (is_null($record)) {
			return Magic::error(
				"{$this->model_slug_singular} record with ID {$id} not found",
				'not_found'
			);
		}

		return $record;
	}

}