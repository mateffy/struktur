<?php

namespace Mateffy\Magic\Builder;

use Illuminate\Support\Collection;
use Mateffy\Magic\Builder\Concerns\HasArtifacts;
use Mateffy\Magic\Builder\Concerns\HasChunkSize;
use Mateffy\Magic\Builder\Concerns\HasContextOptions;
use Mateffy\Magic\Builder\Concerns\HasExtractionModelCallbacks;
use Mateffy\Magic\Builder\Concerns\HasMessageCallbacks;
use Mateffy\Magic\Builder\Concerns\HasModel;
use Mateffy\Magic\Builder\Concerns\HasOutputInstructions;
use Mateffy\Magic\Builder\Concerns\HasSchema;
use Mateffy\Magic\Builder\Concerns\HasStrategy;
use Mateffy\Magic\Builder\Concerns\HasTokenCallback;
use Mateffy\Magic\Builder\Concerns\HasTools;

class ExtractionLLMBuilder
{
    use HasArtifacts;
	use HasContextOptions;
	use HasChunkSize;
    use HasExtractionModelCallbacks;
    use HasModel;
    use HasMessageCallbacks;
	use HasOutputInstructions;
    use HasSchema;
    use HasStrategy;
    use HasTokenCallback;
    use HasTools;

    public function stream(): Collection
    {
		$strategy = $this->makeStrategy();

        $result = $strategy->run($this->artifacts);

        return collect($result);
    }

    public function send(): Collection
    {
		$strategy = $this->makeStrategy();

        $result = $strategy->run($this->artifacts);

        return collect($result);
    }
}
