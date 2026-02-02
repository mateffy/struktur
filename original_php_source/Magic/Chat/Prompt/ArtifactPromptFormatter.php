<?php

namespace Mateffy\Magic\Chat\Prompt;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Blade;
use Mateffy\Magic\Chat\Messages\Step\Image;
use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\ContextOptions;
use Mateffy\Magic\Extraction\Slices\EmbedSlice;
use Mateffy\Magic\Extraction\Slices\RawTextSlice;
use Mateffy\Magic\Extraction\Slices\Slice;
use Mateffy\Magic\Support\ArtifactID;

class ArtifactPromptFormatter
{
	public function __construct(
		/** @var Collection<Artifact> */
		protected Collection $artifacts,
		protected ContextOptions $contextOptions,
	)
	{
	}

	/**
	 * Format the text slices of the artifacts as XML
	 *
	 * @param Collection<Artifact>|array<Artifact> $artifacts
	 */
	public static function formatText(Collection|array $artifacts, ContextOptions $contextOptions): string
	{
		// We use Laravel Service container to enable dependency injection of custom classes by the end user, if wanted
		$formatter = app(ArtifactPromptFormatter::class, [
			'artifacts' => Collection::wrap($artifacts),
			'contextOptions' => $contextOptions,
		]);

		return $formatter->toXML();
	}

	/**
	 * Format the embedded slices of the artifacts as Base64 images
	 * @return Collection<Image>
	 */
	public static function formatImagesAsBase64(Collection|array $artifacts, ContextOptions $contextOptions): Collection
	{
		// We use Laravel Service container to enable dependency injection of custom classes by the end user, if wanted
		$formatter = app(ArtifactPromptFormatter::class, [
			'artifacts' => Collection::wrap($artifacts),
			'contextOptions' => $contextOptions,
		]);

		return $formatter->convertEmbedsToBase64();
	}

	/**
	 * Convert each artifact's text slices to paged XML
	 *
	 * @return Collection<string>
	 */
	public function formatTextSlicesAsXML(bool $includeImageReferences = true): Collection
	{
		return collect($this->artifacts)
            ->map(function (Artifact $artifact) use ($includeImageReferences) {
                $pages = $artifact->getContents(contextOptions: $this->contextOptions)
                    ->filter(fn ($content) => $content instanceof RawTextSlice || ($includeImageReferences && $content instanceof EmbedSlice && $content->getType()->isNormalImage()))
                    ->groupBy(fn (Slice $content) => $content->getPage() ?? 0)
                    ->sortBy(fn (Collection $contents, int $page) => $page)
                    ->values()
                    ->map(fn (Collection $contents, int $page) =>
						Blade::render(
							"<page num={{ \$page }}>\n{!! \$elements !!}\n</page>",
							[
								'page' => $page,
								'elements' => $contents
									->map(fn ($content) => match (true) {
										$content instanceof RawTextSlice => Blade::render(
											"<text>\n{{ \$text }}\n</text>",
											['text' => $content->text()]
										),
										$content instanceof EmbedSlice => Blade::render(
											'<img ref="{{ $ref }}" />',
											[
                                                'ref' => ArtifactID::fromArtifactEmbedSlice(
                                                    artifact: $artifact,
                                                    slice: $content,
                                                )->toString()
											]
										),
										default => null,
									})
									->join("\n"),
							]
						)
                    )
                    ->join("\n\n");

                return Blade::render(
                    <<<'BLADE'
                    <artifact id="{{ $id }}" name="{{ $name }}">
                    {!! $pages !!}
                    </artifact>
                    BLADE,
                    [
						'id' => $artifact->getMetadata()->id,
						'name' => $artifact->getMetadata()->name,
						'pages' => $pages
					]
                );
            })
            ->values();
	}

	/**
	 * Convert the embedded slices of the artifacts to Base64 images
	 *
	 * @return Collection<Image>
	 */
	public function convertEmbedsToBase64(): Collection
	{
		return collect($this->artifacts)
			->flatMap(function (Artifact $artifact) {
				return $artifact->getContents(contextOptions: $this->contextOptions)
						->filter(fn (Slice $content) => $content instanceof EmbedSlice)
						->groupBy(fn (EmbedSlice $content) => $content->getPage() ?? 0)
						->sortBy(fn (Collection $slices, $page) => $page)
						->flatMap(fn (Collection $slices) =>
							collect($slices)
								->map(fn (EmbedSlice $image) => $artifact->makeBase64Image($image))
						);
			});
	}

	/**
	 * Convert the entire artifact collection to a string.
	 */
	public function toXML(): string
	{
		$artifacts = $this->formatTextSlicesAsXML()->join("\n");

		return <<<XML
		<artifacts>
		{$artifacts}
		</artifacts>
		XML;
	}
}