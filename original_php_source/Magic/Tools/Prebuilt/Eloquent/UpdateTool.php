<?php

namespace Mateffy\Magic\Tools\Prebuilt\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Mateffy\Magic;
use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Tools\InvokableTool;
use Mateffy\Magic\Tools\ValidateWithSchema;

class UpdateTool extends EloquentTool
{
	use ValidateWithSchema;

	public function getFunctionName(): string
	{
		return 'update';
	}

	public function schema(): array
	{
		return [
            'name' => $this->name(),
            'description' => "Update the data of a single database record of the {$this->model_slug_singular} model.",
            'arguments' => [
				'id' => $this->getIdSchema(),
				'data' => $this->getModelSchema(creating: false),
            ],
			'required' => ['id', 'data'],
		];
	}

	public function execute(ToolCall $call): mixed
	{
		$id = $call->arguments['id'] ?? null;
		$data = $call->arguments['data'] ?? null;

		if (is_null($id)) {
			throw new \InvalidArgumentException('ID is required');
		}

		if (is_null($data)) {
			throw new \InvalidArgumentException('Data is required');
		}

		$model = $this->model_classpath;
		
		$record = $model::find($id);

		if (is_null($record)) {
			return Magic::error(
				"{$this->model_slug_singular} record with ID {$id} not found",
				'not_found'
			);
		}

		$record->update($data);

		return $record;
	}

}