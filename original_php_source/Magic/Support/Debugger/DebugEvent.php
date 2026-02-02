<?php

namespace Mateffy\Magic\Support\Debugger;

use Illuminate\Support\Str;
use Livewire\Wireable;

/**
 * A debug event is something worth logging. Simple DTO for the debugging logic.
 */
class DebugEvent implements Wireable
{
	public string $id;

	public function __construct(
		public string $type,
		public array $data = [],
		?string $id = null
	)
	{
		$this->id = $id ?? Str::ulid();
	}

	public function toLivewire()
	{
		return [
			'type' => $this->type,
			'data' => $this->data,
		];
	}

	public static function fromLivewire($value)
	{
		return new static(
			type: $value['type'],
			data: $value['data'],
		);
	}
}