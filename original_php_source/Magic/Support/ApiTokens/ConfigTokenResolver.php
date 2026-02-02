<?php

namespace Mateffy\Magic\Support\ApiTokens;

use Mateffy\Magic\Exceptions\MissingApiToken;

/**
 * TokenResolver implementation that gets tokens from the Laravel config files.
 */
class ConfigTokenResolver implements TokenResolver
{
	/**
	 * @throws MissingApiToken
	 */
	public function resolve(string $provider, string $key = 'token'): ?string
	{
		$token = config("llm-magic.apis.{$provider}.{$key}");

		if (empty($token) && $key === 'token') {
			throw new MissingApiToken($provider);
		}

		return $token;
	}
}