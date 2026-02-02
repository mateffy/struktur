<?php

namespace Mateffy\Magic\Support;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\TokenStats;
use Mateffy\Magic\Support\Debugger\DebugEvent;

/**
 * The file debugger can be used to log LLM sessions to disk in order to help during development or debugging.
 */
class FileDebugger
{
	public const TOKEN_STATS = 'token_stats';
	public const DATA_PACKET = 'data_packet';
	public const MESSAGE_PROGRESS = 'message_progress';
	public const MESSAGE = 'message';

    public const LATEST_CACHE_KEY = 'llm-magic-debugger.latest_session';

	protected string $logging_session_id;

	/**
	 * @var Collection<array{0: string, 1: array}>
	 */
	protected Collection $events;

	public function __construct(
		protected string $disk = 'llm-logs',
		protected ?string $base_path = null,
		?string $logging_session_id = null
	)
	{
		$this->logging_session_id = $logging_session_id ?? now()->format('Y-m-d_H-i-s') . '_' . Str::ulid();
		$this->events = collect();
	}

	public function ensurePaths(): void
	{
		File::ensureDirectoryExists($this->path());
	}

	public function path(?string $file = null): string
	{
		return collect([
			$this->base_path,
			$this->logging_session_id,
			$file,
		])
			->filter()
			->implode('/');
	}

	public function onTokenStats(TokenStats $tokenStats)
	{
		$this->events->push(new DebugEvent(type: self::TOKEN_STATS, data: $tokenStats->toArray()));
	}

	public function onDataPacket(array $data)
	{
		$this->events->push(new DebugEvent(type: self::DATA_PACKET, data: $data));
	}

	public function onMessageProgress(Message $message)
	{
		$this->events->push(new DebugEvent(type: self::MESSAGE_PROGRESS, data: [
			'message' => $message->toArray(),
		]));

		$this->save();
	}

	public function onMessage(Message $message)
	{
		$this->events->push(new DebugEvent(type: self::MESSAGE, data: [
			'message' => $message->toArray(),
		]));

		$this->save();
	}

	public function save()
	{
		$this->ensurePaths();

        cache()->put(FileDebugger::LATEST_CACHE_KEY, $this->logging_session_id);

		Storage::disk($this->disk)
			->put(
				$this->path('events.json'),
				json_encode($this->toArray(), flags: JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
			);
	}

    public function getEvents(): Collection
    {
        return $this->events;
    }

	public function toArray(): array
	{
		return [
			'logging_session_id' => $this->logging_session_id,
            'logging_session_url' => url("/magic/debugger/{$this->logging_session_id}"),
			'events' => $this->events
                ->filter(fn (DebugEvent $event) => $event->type !== self::MESSAGE_PROGRESS)
                ->values()
                ->toArray(),
		];
	}


	public static function load(string $logging_session_id, string $disk = 'llm-logs'): static
	{
		$debugger = new static(logging_session_id: $logging_session_id);

		if (!Storage::disk($debugger->disk)->exists($logging_session_id)) {
			throw new \Exception("Logging session {$logging_session_id} not found");
		}

		$events = json_decode(
			Storage::disk($debugger->disk)
				->get($debugger->path('events.json')),
			true
		);

		foreach ($events['events'] as $event) {
			$debugger->events->push(new DebugEvent(
				type: $event['type'],
				data: $event['data']
			));
		}

		return $debugger;
	}
}
