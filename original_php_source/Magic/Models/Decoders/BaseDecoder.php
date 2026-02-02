<?php

namespace Mateffy\Magic\Models\Decoders;

use Mateffy\Magic\Chat\Messages\Message;
use Mateffy\Magic\Chat\Messages\PartialMessage;
use Mateffy\Magic\Chat\TokenStats;

abstract class BaseDecoder implements Decoder
{
	public function __construct(
        protected mixed $response,
        /**
         * @var \Closure(PartialMessage): void
         */
        protected ?\Closure $onMessageProgress = null,

        /**
         * @var \Closure(Message): void
         */
        protected ?\Closure $onMessage = null,

		/**
		 * @var \Closure(array): void
		 */
		protected ?\Closure $onDataPacket = null,

        /**
         * @var \Closure(TokenStats): void
         */
        protected ?\Closure $onTokenStats = null,

        /**
         * @var \Closure(TokenStats): void
         */
        protected ?\Closure $onEnd = null,

        /**
         * @var bool
         */
        protected bool $json = true,
    ) {}

	abstract public function process(): array;

}