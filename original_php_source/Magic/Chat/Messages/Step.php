<?php

namespace Mateffy\Magic\Chat\Messages;

use Mateffy\Magic\Chat\Messages\Step\Image;
use Mateffy\Magic\Chat\Messages\Step\ContentInterface;
use Mateffy\Magic\Chat\Messages\Step\Text;
use Mateffy\Magic\Chat\Prompt\Role;

class Step implements Message
{
    use WireableViaArray;

    public function __construct(
        public Role $role,
        /** @var array<ContentInterface> */
        public array $content
    ) {}

    public function toArray(): array
    {
        return [
            'role' => $this->role->value,
            'content' => array_map(fn (ContentInterface $item) => $item->toArray(), $this->content),
        ];
    }

    public static function fromArray(array $data): static
    {
        return new self(
            role: Role::tryFrom($data['role']) ?? Role::Assistant,
            content: collect($data['content'])
                ->map(fn (array $item) => match ($item['type'] ?? null) {
                    'text' => Text::fromArray($item),
                    'image' => Image::fromArray($item),
                    default => null,
                })
                ->filter()
                ->all()
        );
    }

    public function text(): ?string
    {
        if (! is_string($this->content)) {
            return json_encode($this->content, JSON_THROW_ON_ERROR);
        }

        return $this->content;
    }

    /**
     * @param array<ContentInterface> $content
     */
    public static function user(array|string $content): static
    {
		if (is_string($content)) {
			return new self(
				role: Role::User,
				content: [
					new Text($content),
				],
			);
		}

        return new self(
            role: Role::User,
            content: $content,
        );
    }

    public static function assistant(array|string $content): static
    {
		if (is_string($content)) {
			return new self(
				role: Role::Assistant,
				content: [
					new Text($content),
				],
			);
		}

        return new self(
            role: Role::Assistant,
            content: $content,
        );
    }

    /**
     * @param array<ContentInterface> $content
     */
    public static function base64Image(string $base64Image, string $mime): static
    {
        return new self(
            role: Role::User,
            content: [
                new Image(
                    imageBase64: $base64Image,
                    mime: $mime,
                ),
            ],
        );
    }

	/**
     * @param array<ContentInterface> $content
     */
    public static function base64(string $base64Image, string $mime): static
    {
        return new self(
            role: Role::User,
            content: [
                new Image(
                    imageBase64: $base64Image,
                    mime: $mime,
                ),
            ],
        );
    }

    public function role(): Role
    {
        return $this->role;
    }
}
