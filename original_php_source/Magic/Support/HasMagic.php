<?php

namespace Mateffy\Magic\Support;

interface HasMagic
{
//	/**
//	 * @return array<string, string|array>
//	 */
//	public function getMagicRules(): array;

	public function getMagicSchema(bool $creating): array;
}