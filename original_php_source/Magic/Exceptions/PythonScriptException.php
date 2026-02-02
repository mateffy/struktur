<?php

namespace Mateffy\Magic\Exceptions;

class PythonScriptException extends \RuntimeException
{
	public function __construct(string $message, protected ?string $trace = null)
	{
		if ($this->trace) {
			$message .= PHP_EOL . $this->trace;
		}

		parent::__construct($message);
	}
}