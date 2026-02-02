<?php

namespace Mateffy\Magic\Tools\Prebuilt\Eloquent;

use Illuminate\Database\Eloquent\Model;
use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Tools\InvokableTool;
use Mateffy\Magic\Tools\ValidateWithSchema;

class QueryTool extends EloquentTool
{
	use ValidateWithSchema;

	public const int DEFAULT_LIMIT = 10;
	public const int DEFAULT_OFFSET = 0;
	public const string DEFAULT_ORDER_DIRECTION = 'asc';
	public const string DEFAULT_ORDER_BY = 'updated_at';

	public function getFunctionName(): string
	{
		return 'query';
	}

	public function schema(): array
	{
		return [
            'name' => $this->name(),
            'description' => "Query the database for records of the {$this->model_slug_singular} model.",
            'arguments' => [
				'filters' => [
					'type' => 'array',
					'description' => 'Filters to apply to the query',
					'items' => [
						'type' => 'object',
						'properties' => [
							'field' => [
								'type' => 'string',
								'description' => 'Field to filter by',
							],
							'value' => [
								'type' => ['string', 'array'],
								'description' => 'Value to filter by',
							],
							'operator' => [
								'type' => 'string',
								'enum' => ['=', '!=', '<', '<=', '>', '>=', 'like'],
								'default' => '=',
								'description' => 'Operator to use for filtering',
							],
						],
					],
				],
				'order_by' => [
					'type' => 'string',
					'description' => 'Column to order by',
					'default' => self::DEFAULT_ORDER_BY,
				],
				'order_direction' => [
					'type' => 'string',
					'enum' => ['asc', 'desc'],
					'default' => self::DEFAULT_ORDER_DIRECTION,
					'description' => 'Direction to order by',
				],
				'limit' => [
					'type' => 'integer',
					'default' => self::DEFAULT_LIMIT,
					'description' => 'Number of records to return',
					'minimum' => 1,
					'maximum' => 100,
				],
				'offset' => [
					'type' => 'integer',
					'default' => self::DEFAULT_OFFSET,
					'description' => 'Number of records to skip',
					'minimum' => 0,
				]
            ]
		];
	}

	public function execute(ToolCall $call): mixed
	{
		$filters = $call->arguments['filters'] ?? [];
		$order_by = $call->arguments['order_by'] ?? self::DEFAULT_ORDER_BY;
		$order_direction = $call->arguments['order_direction'] ?? self::DEFAULT_ORDER_DIRECTION;
		$limit = $call->arguments['limit'] ?? self::DEFAULT_LIMIT;
		$offset = $call->arguments['offset'] ?? self::DEFAULT_OFFSET;
		$model = $this->model_classpath;

		$query = $model::query();

		if ($this->with) {
			$query->with($this->with);
		}

		if ($filters) {
			foreach ($filters as $filter) {
				$field = $filter['field'];
				$value = $filter['value'];
				$operator = $filter['operator'] ?? '=';

				$query->where($field, $operator, $value);
			}
		}

		if ($order_by) {
			$query->orderBy($order_by, $order_direction);
		}

		if ($limit) {
			$query->limit($limit);
		}

		if ($offset) {
			$query->offset($offset);
		}

		return $query->get();
	}
}