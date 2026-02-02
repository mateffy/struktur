<?php

namespace Mateffy\Magic\Models;

use Closure;
use GuzzleHttp\Client;
use Mateffy\Magic\Chat\MessageCollection;
use Mateffy\Magic\Chat\Messages\ToolCallMessage;
use Mateffy\Magic\Chat\Messages\ToolResultMessage;
use Mateffy\Magic\Chat\Messages\JsonMessage;
use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\Messages\Step;
use Mateffy\Magic\Chat\Messages\Step\ContentInterface;
use Mateffy\Magic\Chat\Messages\TextMessage;
use Mateffy\Magic\Chat\Prompt\Role;
use Mateffy\Magic\Chat\Prompt;
use Mateffy\Magic\Models\Options\ElElEmOptions;
use Mateffy\Magic\Models\Options\Organization;
use Mateffy\Magic\Tools\InvokableTool;

class Ollama extends ElElEm
{
    public const LLAMA_3_1 = 'llama3.1';

    public string $baseUrl = 'http://127.0.0.1:11434/api/';

    public function __construct(
        string $model,
        ElElEmOptions $options = new ElElEmOptions,
    ) {
        parent::__construct(
            organization: new Organization(
                id: 'ollama',
                name: 'Self-hosted AI',
                website: 'https://ollama.com',
                privacyUsedForModelTraining: false,
                privacyUsedForAbusePrevention: false,
            ),
            model: $model,
            options: $options,
        );
    }

    public function getModelCost(): ?ModelCost
    {
        return new ModelCost(
            inputCentsPer1K: 0,
            outputCentsPer1K: 0,
        );
    }

    public static function llama_3_1(): Ollama
    {
        return new Ollama(
            model: Ollama::LLAMA_3_1,
            options: new ElElEmOptions
        );
    }

    public function stream(Prompt $prompt, ?Closure $onMessageProgress = null, ?Closure $onMessage = null, ?Closure $onTokenStats = null, ?Closure $onDataPacket = null): MessageCollection
    {
        $guzzle = new Client([
            'base_uri' => $this->baseUrl,
        ]);

        try {
            $response = $guzzle->post('chat', [
                'json' => [
                    'model' => $this->getModelName(),
                    'messages' => collect($prompt->messages())
                        ->dump()
                        ->map(fn (Message $message) => match ($message::class) {
                            TextMessage::class => [
                                'class' => 'text',
                                'role' => $message->role,
                                'content' => $message->content,
                            ],

                            JsonMessage::class => [
                                'class' => 'json',
                                'role' => $message->role,
                                'content' => json_encode($message->data),
                            ],

        //                    {"role": "assistant", "content": [
        //                        {"type": "tool_use", "id": "toolu_01A09q90qw90lq917835lq9", "name": "get_weather", "input": {"location": "San Francisco, CA"}}
        //                    ]},
                            ToolCallMessage::class => [
                                'class' => 'function_invocation',
                                'role' => $message->role,
                                'content' => [
                                    [
                                        'type' => 'tool_use',
                                        'id' => $message->call->id ?? $message->call->name,
                                        'name' => $message->call->name,
                                        'input' => $message->call->arguments,
                                    ],
                                ],
                            ],

        //                    {"role": "user", "content": [
        //                        {"type": "tool_result", "tool_use_id": "toolu_01A09q90qw90lq917835lq9", "content": "15 degrees"}
        //                    ]},
                            ToolResultMessage::class => [
                                'class' => 'function_output',
                                'role' => $message->role,
                                'content' => [
                                    [
                                        'type' => 'tool_result',
                                        'tool_use_id' => $message->call->id ?? $message->call->name,
                                        'content' => [
                                            ['type' => 'text', 'text' => $message->text()],
                                        ]
                                    ],
                                ],
                            ],

                            Step::class => [
                                'class' => 'multimodal',
                                'role' => $message->role,
                                'content' => collect($message->content)
                                    ->reduce(fn (string $combined, ContentInterface $message) => "{$combined}\n\n[" . $message::class . "}]: " . json_encode($message->toArray()), '')
                            ],

                            default => null,
                        })
        //                ->dd()
                        ->filter()
                        ->values()
                        ->prepend(['role' => 'system', 'content' => $prompt->system()])
                        ->toArray(),
//                    'stream' => true,
                    'tools' => collect($prompt->tools())
                        ->map(fn (InvokableTool $function) => [
                            'type' => 'function',
                            'function' => [
                                'name' => $function->name(),
                                'description' => method_exists($function, 'description') ? $function->description() : '',
                                'parameters' => $function->schema(),
                            ]
                        ]),
                ],
//                'stream' => true,
            ]);

            if ($response->getStatusCode() !== 200) {
                throw new \Exception('Invalid status code: '.$response->getStatusCode() . ' Body: '.$response->getBody());
            }

            $rest = $response->getBody()->read(1);
            $message = null;

            while ($chunk = $response->getBody()->read(512)) {
                $jsonChunks = explode("\n", $rest.$chunk);
                $rest = '';

                foreach ($jsonChunks as $jsonChunk) {
                    $json = json_decode($jsonChunk, true, 512);

                    if ($json === null) {
                        $rest .= $jsonChunk;
                        continue;
                    }

                    $content = $json['message']['content'];

                    if (!$message && ($content[0] ?? null) === '{') {
                        $message = new ToolCallMessage(
                            role: Role::Assistant,
                            call: null,
                            partial: ''
                        );
                    } else if (!$message) {
                        $message = new TextMessage(
                            role: Role::Assistant,
                            content: ''
                        );
                    }

                    if ($message instanceof ToolCallMessage) {
                        $message = $message->appendFull($content);
                    } else if ($message instanceof TextMessage) {
                        $message = $message->append($content);
                    }
                }
            }

            return MessageCollection::make([$message]);
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    public function send(Prompt $prompt): MessageCollection
    {
        return $this->stream($prompt);
    }
}
