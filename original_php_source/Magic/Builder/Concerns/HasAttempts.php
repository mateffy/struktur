<?php

namespace Mateffy\Magic\Builder\Concerns;

trait HasAttempts
{
	public const int DEFAULT_MAX_ATTEMPTS = 3;

	protected int $maxAttempts = self::DEFAULT_MAX_ATTEMPTS;
	protected int $attemptsLeft = self::DEFAULT_MAX_ATTEMPTS;

	public function attempts(int $attempts): static
	{
		$this->maxAttempts = $attempts;
		$this->attemptsLeft = $attempts;

		return $this;
	}

	protected function useAttempt(int $count = 1): static
	{
		$this->attemptsLeft -= $count;

		return $this;
	}

	public function resetAttempts(): static
	{
		$this->attemptsLeft = $this->maxAttempts;

		return $this;
	}
}