<?php

namespace Mateffy\Magic\Extraction\Artifacts;

use Blaspsoft\Doxswap\ConversionService;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use JsonException;
use Mateffy\Magic\Chat\Messages\Step\Image;
use Mateffy\Magic\Exceptions\ArtifactGenerationFailed;
use Mateffy\Magic\Extraction\ContentType;
use Mateffy\Magic\Extraction\ContextOptions;
use Mateffy\Magic\Extraction\Parsers\PdfParser;
use Mateffy\Magic\Extraction\Parsers\SpreadsheetParser;
use Mateffy\Magic\Extraction\Slices\EmbedSlice;
use Mateffy\Magic\Extraction\Slices\ImageSlice;
use Mateffy\Magic\Extraction\Slices\RawTextSlice;
use Mateffy\Magic\Extraction\Slices\Slice;
use Mateffy\Magic\Extraction\Slices\TextualSlice;
use Mateffy\Magic\Support\ArtifactID;
use Spatie\PdfToImage\Pdf;


/**
 * Artifact directory:
 * /magic-artifact-<ID> - The base directory
 * /magic-artifact-<ID>/metadata.json - Metadata about the artifact
 * /magic-artifact-<ID>/contents.json - The extracted slices of the artifact
 * /magic-artifact-<ID>/source.<EXT> - The original source file
 * /magic-artifact-<ID>/source.txt - The complete text content of the artifact
 * /magic-artifact-<ID>/marked.pdf (optional) - The marked up version of the source file (only PDF)
 * /magic-artifact-<ID>/images (optional) - Directory for extracted images
 * /magic-artifact-<ID>/images/image<NUM>.jpg
 * /magic-artifact-<ID>/pages (optional) - Directory for extracted page "screenshots"
 * /magic-artifact-<ID>/pages/page<NUM>.jpg
 * /magic-artifact-<ID>/pages_marked (optional) - Directory for extracted page "screenshots" with embedded images marked
 * /magic-artifact-<ID>/pages_marked/page<NUM>.jpg
 * /magic-artifact-<ID>/pages_txt (optional) - Directory for extracted page text content
 * /magic-artifact-<ID>/pages_txt/page<NUM>.txt
 */
class DiskArtifact implements Artifact
{
    protected ?ArtifactMetadata $metadata = null;
    protected ?Collection $contents = null;

    protected function __construct(
		public string $id,
        public bool $cache,
        public readonly string $path,
        public readonly ?string $disk,
        public readonly string $artifactDir,
        public readonly ?string $artifactDirDisk
    )
    {
    }

    public static function from(string $path, ?string $disk = null): static
    {
        $artifactDisk = config('llm-magic.artifacts.disk');
        $prefix = config('llm-magic.artifacts.prefix');
        $base = config('llm-magic.artifacts.base', storage_path('app/magic-artifacts'));

        $artifactDir = $artifactDisk
            ? $prefix
            : $base;

		$id = static::makeId(path: $path, disk: $disk);
        $artifactDirName ??= "magic-artifact-" . $id;

        $makeArtifactDir = fn (string $dir) => collect([$dir, $artifactDirName])
            ->filter(fn ($part) => filled($part))
            ->implode("/");

        if ($artifactDir !== null) {
            $cache = true;
            $artifactDir = $makeArtifactDir($artifactDir);
        } else {
            $cache = false;
            $artifactDir = $makeArtifactDir(sys_get_temp_dir());
        }

        return new static(
			id: $id,
            cache: $cache,
            path: $path,
            disk: $disk,
            artifactDir: $artifactDir,
            artifactDirDisk: $artifactDisk,
        );
    }

	public static function tryFromArtifactId(string|ArtifactID $ref): ?self
	{
        if (is_string($ref)) {
            $id = ArtifactID::parse($ref);

            if (!$id) {
                report("Invalid artifact ID: {$ref}");

                return null;
            }
        } else {
            $id = $ref;
        }

		$artifactDir = config('llm-magic.artifacts.base', storage_path('app/magic-artifacts'));
		$artifactDisk = config('llm-magic.artifacts.disk');

		$disk = $artifactDisk
			? Storage::disk($artifactDisk)
			: null;

		$artifactDirName = "magic-artifact-{$id->artifact}";

		if ($disk?->exists($artifactDirName) || File::exists("{$artifactDir}/{$artifactDirName}")) {
			return new self(
				id: $id->artifact,
				cache: true,
                path: "{$artifactDirName}/source.pdf",
				disk: $artifactDisk,
				artifactDir: $artifactDirName,
				artifactDirDisk: $artifactDisk
			);
		}

		return null;
	}

    public function getSourcePath(): string
    {
        return $this->path;
    }

    protected function getRawContents(): mixed
    {
        return $this->disk
            ? Storage::disk($this->disk)->get($this->path)
            : File::get($this->path);
    }

    /**
     * @return Collection<Slice>
     * @throws ArtifactGenerationFailed
	 * @throws JsonException
     */
    public function getContents(?ContextOptions $contextOptions = null): Collection
    {
        $this->contents ??= match ($this->getMetadata()->type) {
            ArtifactType::Text,
            ArtifactType::Image => $this->getFlatFileContents(),
            ArtifactType::Pdf => $this->getPdfContents(),
			ArtifactType::RichTextDocument => $this->getDocumentContents(),
			ArtifactType::Spreadsheet => $this->getSpreadsheetContents(),
            default => collect(),
        };

		return $contextOptions?->filter($this->contents) ?? $this->contents;
    }

    /**
     * @throws JsonException
     * @throws ArtifactGenerationFailed
	 * @return Collection<Slice>
     */
    public function refreshContents(): Collection
    {
        $this->contents = null;
		$this->cache = false;

        $contents = $this->getContents();

		$this->cache = true;

		return $contents;
    }

    protected function findExistingArtifactDir(): ?string
    {
        $disk = $this->artifactDirDisk
            ? Storage::disk($this->artifactDirDisk)
            : null;

        if ($this->cache) {
            if ($disk?->exists($this->artifactDir)) {
                return $this->artifactDir;
            } elseif (File::exists($this->artifactDir)) {
                return $this->artifactDir;
            }
        }

        return null;
    }

	/**
	 * @return Collection<Slice>
	 * @throws JsonException
	 */
    protected function parseContentSlices(string $outputDir): Collection
    {
        $disk = $this->artifactDirDisk
            ? Storage::disk($this->artifactDirDisk)
            : null;

        if ($disk) {
            $contents = $disk->get("{$outputDir}/contents.json") ?? '[]';
            $data = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);
        } else {
            $data = File::json("{$outputDir}/contents.json", flags: JSON_THROW_ON_ERROR);
        }

        $data = collect($data)
            ->map(fn (array $content) => match (ContentType::tryFrom($content['type'])) {
                ContentType::Text => RawTextSlice::from($content),
				ContentType::Image,
				ContentType::ImageMarked,
				ContentType::PageImage,
				ContentType::PageImageMarked => ImageSlice::from($content),
                default => null
            })
            ->filter()
            ->sortBy(fn (Slice $content) => $content->getPage() ?? 0)
            ->values();

		return $data;
    }

	/**
	 * @throws JsonException
	 * @throws ArtifactGenerationFailed
	 * @return Collection<Slice>
	 */
    protected function getPdfContents(bool $ignoreExisting = false, ?string $originalDisk = null, ?string $originalPath = null, ?string $id = null): Collection
    {
        $outputDir = $this->findExistingArtifactDir();

        // No cached path found, generate
        if ($outputDir === null || $ignoreExisting) {
            $parser = new PdfParser(
				path: $originalPath ?? $this->path,
				disk: $originalDisk ?? $this->disk,
				originalType: $this->getMetadata()->type,
				mime: $this->getMetadata()->mimetype,
				originalFilename: $this->getMetadata()->name,
			);
            $parser->parse(id: $id ?? $this->id);

            if ($this->artifactDirDisk) {
				$outputDir = $parser->moveToStorage(disk: $this->artifactDirDisk, path: $this->artifactDir);
			} else {
				$outputDir = $parser->moveToPath(path: $this->artifactDir);
			}
        }

        return $this->parseContentSlices($outputDir);
    }

	/**
	 * @throws JsonException
	 * @throws ArtifactGenerationFailed
	 * @return Collection<Slice>
	 */
    protected function getDocumentContents(): Collection
    {
        $outputDir = $this->findExistingArtifactDir();

        // No cached path found, generate
        if ($outputDir === null) {
            if ($this->artifactDirDisk) {
				try {
					$disk = Storage::disk($this->artifactDirDisk);
					$disk->makeDirectory($this->artifactDir);

					$converter = new ConversionService(
						inputDisk: $this->disk,
						outputDisk: $this->artifactDirDisk,
					);

					try {
						$destinationPath = "{$this->artifactDir}/source.pdf";

						// Warning: Docswap returns an absolute path here, NOT one relative to the disk.
						// This is a weird decision on their part as the library works with disks everywhere else.
						// For this reason, we just read the file and write it back to the disk instead of using move operations...
						$absoluteConvertedFilePath = $converter->convertFile($this->path, 'pdf');

						try {
							$readStream = fopen($absoluteConvertedFilePath, 'r');
							$disk->writeStream($destinationPath, $readStream);

							fclose($readStream);
						} finally {
							File::delete($absoluteConvertedFilePath);
						}
					} catch (Exception $e) {
						throw new ArtifactGenerationFailed("Failed to convert document to PDF: {$e->getMessage()}");
					} finally {
						if (isset($absoluteConvertedFilePath) && File::exists($absoluteConvertedFilePath)) {
							File::delete($absoluteConvertedFilePath);
						}
					}

					return $this->getPdfContents(
						ignoreExisting: true,
						originalDisk: $this->artifactDirDisk,
						originalPath: $destinationPath
					);
				} catch (Exception $e) {
					// Make sure to delete the directory if the conversion fails,
					// as otherwise we keep skipping the conversion step and just return the failed artifact
					try {
						$disk->deleteDirectory($this->artifactDir);
					} catch (Exception $e) {
						// Ignore if the directory doesn't exist
					}

					throw new ArtifactGenerationFailed("Failed to convert document to PDF: {$e->getMessage()}");
				}
			} else {
				throw new Exception("Documents (.word, .ppt, .xls, etc.) are currently only supported when storing files with Laravel's disks, as this is required by the Docswap package.");
			}
        }

        return $this->parseContentSlices($outputDir);
    }

	protected function getSpreadsheetContents(): Collection
    {
        $disk = $this->artifactDirDisk
            ? Storage::disk($this->artifactDirDisk)
            : null;

        $outputDir = $this->findExistingArtifactDir();

        if ($outputDir === null) {
            $outputDir = $this->artifactDir;

            if ($this->cache) {
				$path = $this->disk
					? Storage::disk($this->disk)->path($this->path)
					: $this->path;

				$converter = app(SpreadsheetParser::class);
				$slices = $converter->convertToTextSlices(filename: $path)
					->map(fn (RawTextSlice $slice) => $slice->toArray())
					->toArray();

                if ($this->artifactDirDisk) {
                    $disk->makeDirectory($this->artifactDir);

					try {
						$converter = new ConversionService(
							inputDisk: $this->disk,
							outputDisk: $this->artifactDirDisk,
						);
						$destinationPath = "{$this->artifactDir}/thumbnail.pdf";

						// Warning: Docswap returns an absolute path here, NOT one relative to the disk.
						// This is a weird decision on their part as the library works with disks everywhere else.
						// For this reason, we just read the file and write it back to the disk instead of using move operations...
						$absoluteConvertedFilePath = $converter->convertFile($this->path, 'pdf');

						try {
							$readStream = fopen($absoluteConvertedFilePath, 'r');
							$disk->writeStream($destinationPath, $readStream);
						} finally {
							if (isset($readStream)) {
								fclose($readStream);
							}

							File::delete($absoluteConvertedFilePath);
						}

					} catch (Exception $e) {
						throw new ArtifactGenerationFailed("Failed to convert document to JPG: {$e->getMessage()}");
					} finally {
						if (isset($absoluteConvertedFilePath) && File::exists($absoluteConvertedFilePath)) {
							File::delete($absoluteConvertedFilePath);
						}
					}


					if ($disk->exists("{$this->artifactDir}/thumbnail.pdf")) {
						$disk->makeDirectory("{$this->artifactDir}/images");
						$pdf = new Pdf($disk->path("{$this->artifactDir}/thumbnail.pdf"));
						$pdf->save($disk->path("{$this->artifactDir}/images/image1.jpg"));

						$slices[] = (new ImageSlice(
							type: ContentType::Image,
							mimetype: 'image/jpeg',
							path: 'images/image1.jpg',
						))->toArray();
					}

					$disk->put("{$this->artifactDir}/metadata.json", json_encode($this->getMetadata()->toArray(), JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
                    $disk->put("{$this->artifactDir}/contents.json", json_encode($slices, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                    $disk->put("{$this->artifactDir}/source.{$this->getMetadata()->extension}", $this->getRawContents());
                } else {
                    File::ensureDirectoryExists($this->artifactDir);
					File::put("{$this->artifactDir}/metadata.json", json_encode($this->getMetadata()->toArray(), JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
					File::put("{$this->artifactDir}/contents.json", json_encode($slices, JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
					File::put("{$this->artifactDir}/source.{$this->getMetadata()->extension}", $this->getRawContents());
                }
            }
        }

        return $this->parseContentSlices($outputDir);
    }

	/**
	 * If an image is provided, we fake the processing process but still write the image to the artifact directory.
	 * @throws JsonException
	 * @return Collection<Slice>
	 */
    protected function getFlatFileContents(): Collection
    {
        $disk = $this->artifactDirDisk
            ? Storage::disk($this->artifactDirDisk)
            : null;

        $outputDir = $this->findExistingArtifactDir();

        if ($outputDir === null) {
            $outputDir = $this->artifactDir;

            if ($this->cache) {
				$slice = match ($this->getMetadata()->type) {
					default => new RawTextSlice($this->getRawContents()),
					ArtifactType::Image => new ImageSlice(
						type: ContentType::Image,
						mimetype: $this->getMetadata()->mimetype,
						path: "source.{$this->getMetadata()->extension}",
					)
				};

                if ($this->artifactDirDisk) {
                    $disk->makeDirectory($this->artifactDir);
                    $disk->put("{$this->artifactDir}/metadata.json", json_encode($this->getMetadata()->toArray(), JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
                    $disk->put("{$this->artifactDir}/contents.json", json_encode([$slice->toArray()], JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
                    $disk->put("{$this->artifactDir}/source.{$this->getMetadata()->extension}", $this->getRawContents());
                } else {
                    File::ensureDirectoryExists($this->artifactDir);
					File::put("{$this->artifactDir}/metadata.json", json_encode($this->getMetadata()->toArray(), JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
					File::put("{$this->artifactDir}/contents.json", json_encode([$slice->toArray()], JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT));
					File::put("{$this->artifactDir}/source.{$this->getMetadata()->extension}", $this->getRawContents());
                }
            }
        }

        return $this->parseContentSlices($outputDir);
    }

    /**
     * @throws JsonException
     */
    public function getText(?int $maxPages = null): ?string
    {
        return collect($this->getContents())
            ->filter(fn (Slice $content) => $content instanceof TextualSlice)
            ->groupBy(fn (TextualSlice $content) => $content->getPage() ?? 0)
            ->sortBy(fn (Collection $contents, $page) => $page)
            ->values()
            ->take($maxPages)
            ->flatMap(fn (Collection $contents) => collect($contents)
                ->map(fn (TextualSlice $content) => "<page num=\"{$content->page}\">\n{$content->text}\n</page>")
            )
            ->join("\n");
    }

	/**
	 * @throws JsonException
	 */
	public function getMetadata(): ArtifactMetadata
    {
		if ($this->metadata) {
			return $this->metadata;
		}

		// Try getting the metadata from the artifact/metadata.json file first
		$metadataPath = "{$this->artifactDir}/metadata.json";
		$this->metadata = ArtifactMetadata::tryFromPath($metadataPath, $this->artifactDirDisk);

		// If the metadata file doesn't exist, generate it from the source file
        return $this->metadata ?? $this->metadata = ArtifactMetadata::fromFile(id: $this->id, path: $this->path, disk: $this->disk);
    }

    public function makeBase64Image(EmbedSlice $content): Image
    {
        $path = $content->isAbsolutePath()
            ? $content->getPath()
            : "{$this->artifactDir}/{$content->getPath()}";

        return $this->disk
            ? Image::fromDisk($this->artifactDirDisk, $path)
            : Image::fromPath($path);
    }

    public function getRawEmbedContents(EmbedSlice $content): mixed
    {
        $path = $content->isAbsolutePath()
            ? $content->getPath()
            : "{$this->artifactDir}/{$content->getPath()}";

        return $this->disk
            ? Storage::disk($this->artifactDirDisk)->get($path)
            : File::get($path);
    }

	public function getRawEmbedStream(EmbedSlice $content): mixed
    {
        $path = $content->isAbsolutePath()
            ? $content->getPath()
            : "{$this->artifactDir}/{$content->getPath()}";

        if ($this->disk) {
            return Storage::disk($this->artifactDirDisk)->readStream($path);
        } else {
            return fopen($path, 'r');
        }
    }

	protected static function makeId(string $path, ?string $disk = null): string
	{
		if ($disk) {
			return (string) crc32("{$disk}:{$path}");
		}

		return (string) crc32("fs:{$path}");
	}
}
