<?php

namespace Mateffy\Magic\Tools\Prebuilt;

use Closure;
use Illuminate\Database\Eloquent\Model;
use Mateffy\Magic\Tools\Prebuilt\Eloquent\CreateTool;
use Mateffy\Magic\Tools\Prebuilt\Eloquent\DeleteTool;
use Mateffy\Magic\Tools\Prebuilt\Eloquent\GetTool;
use Mateffy\Magic\Tools\Prebuilt\Eloquent\QueryTool;
use Mateffy\Magic\Tools\Prebuilt\Eloquent\UpdateTool;

class EloquentTools
{
	/**
	 * Create a new tool for the given model.
	 *
	 * @param class-string<Model> $model
	 */
	public static function crud(string $model, bool $query = true, bool $get = true, bool $create = true, bool $update = true, bool $delete = true, array $with = []): array
	{
		return array_filter([
			$query ? new QueryTool($model) : null,
			$get ? new GetTool($model) : null,
			$create ? new CreateTool($model) : null,
			$update ? new UpdateTool($model) : null,
			$delete ? new DeleteTool($model) : null,
		]);
	}
}