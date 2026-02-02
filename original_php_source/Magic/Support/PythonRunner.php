<?php

namespace Mateffy\Magic\Support;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Mateffy\Magic\Exceptions\PythonScriptException;

/**
 * A helper class for running Python scripts.
 *
 * The class handles command preparation, execution, and error handling.
 */
class PythonRunner
{
	public function __construct(
		protected string $script,
		protected string $args,
		?bool $useUv = null,
	)
	{
		$this->useUv = $useUv ?? config('llm-magic.python.use_uv', true);
	}

	public function execute(): mixed
	{
		return $this->useUv ? $this->executeWithUv() : $this->executeWithPython();
	}

	public function executeWithUv(): mixed
	{
		$pythonDir = config('llm-magic.python.cwd');
        $uvPath = config('llm-magic.python.uv.path');

        $currentDir = getcwd();

		try {
            // Change working directory to the artifact directory
            chdir($pythonDir);

			$command = "{$uvPath} run --isolated {$this->script} {$this->args}";
            $output = shell_exec($command);

			Log::debug("PythonRunner: {$output}");

            $json = json_decode($output, true);

            if (isset($json['error'])) {
                throw new PythonScriptException(message: $json['error'], trace: $json['trace'] ?? null);
            }

            return $json;
        } finally {
			// Make sure to always change back to the original directory
            chdir($currentDir);
        }
	}

	protected function executeWithPython(): mixed
	{
		$pythonDir = config('llm-magic.python.cwd');
        $pythonPath = config('llm-magic.python.bin.path');

        $currentDir = getcwd();

		try {
            // Change working directory to the artifact directory
            chdir($pythonDir);

			$command = "{$pythonPath} {$this->script} {$this->args}";
            $output = shell_exec($command);

			Log::debug("PythonRunner: {$output}");

            $json = json_decode($output, true);

            if (isset($json['error'])) {
                throw new PythonScriptException(message: $json['error'], trace: $json['trace'] ?? null);
            }

            return $json;
        } finally {
			// Make sure to always change back to the original directory
            chdir($currentDir);
        }
	}
}