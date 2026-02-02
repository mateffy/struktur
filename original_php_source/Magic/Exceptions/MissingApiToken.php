<?php

namespace Mateffy\Magic\Exceptions;

use Exception;

class MissingApiToken extends Exception implements LLMException
{
	public function __construct(public string $provider)
	{
		parent::__construct(message: $this->getTitle());
	}

	public function getTitle(): string
	{
		return "Missing API token for {$this->provider}";
	}
}