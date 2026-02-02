<?php

namespace Mateffy\Magic\Tools\Prebuilt\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use InvalidArgumentException;
use Mateffy\Magic\Support\HasMagic;
use Mateffy\Magic\Tools\InvokableTool;

abstract class EloquentTool implements InvokableTool
{
	public string $model_slug_singular;
	public string $model_slug_plural;

	public function __construct(
		/** @var class-string<Model> $classpath */
		public string $model_classpath,
		public array $with = [],
		public ?string $tool_name = null,
	)
	{
		$this->model_slug_singular = str($this->model_classpath)
			->afterLast('\\')
			->snake()
			->slug();

		$this->model_slug_plural = str($this->model_slug_singular)
			->plural()
			->slug();
	}

	public function name(): string
	{
		return $this->tool_name ?? "{$this->getFunctionName()}_{$this->model_slug_plural}";
	}

	protected function getIdSchema(): array
	{
		$type = (new $this->model_classpath())->getKeyType();

		$keyType = match ($type) {
			'string', 'uuid' => 'string',
			default => 'integer',
		};

		$format = match ($type) {
			'uuid' => 'uuid',
			default => null,
		};

		$example = match ($type) {
			'string' => null,
			'uuid' => '123e4567-e89b-12d3-a456-426614174000',
			default => 1,
		};

		return array_filter([
			'type' => $keyType,
			'description' => 'ID of the record to get',
			'format' => $format,
			'example' => $example,
		]);
	}

	protected function getModelSchema(bool $creating): array
	{
		/** @var Model $model */
		$model = (new $this->model_classpath());

		if (!($model instanceof HasMagic)) {
			throw new InvalidArgumentException(
				"Model {$this->model_classpath} does not implement Mateffy\Magic\Support\HasMagic"
			);
		}

		$schema = $model->getMagicSchema(creating: $creating);

		if (Arr::get($schema, 'type') !== 'object') {
			throw new InvalidArgumentException(
				"Model {$this->model_classpath} does not have a valid magic schema. Make sure getMagicSchema() returns an object schema."
			);
		}

		if (Arr::get($schema, 'properties') === null) {
			throw new InvalidArgumentException(
				"Model {$this->model_classpath} does not have a valid magic schema. Make sure getMagicSchema() returns an object schema with properties."
			);
		}

		return array_filter([
			'type' => 'object',
			'description' => "The properties of the {$this->model_slug_singular} model",
			'properties' => $schema['properties'],
			'required' => $schema['required'] ?? null
		]);
	}

	abstract public function getFunctionName(): string;
}