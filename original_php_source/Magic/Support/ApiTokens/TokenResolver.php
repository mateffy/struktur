<?php

namespace Mateffy\Magic\Support\ApiTokens;

/**
 * The token resolver is responsible for getting API tokens for a given provider.
 * LLM Magic provides a ConfigTokenResolver implementation that reads tokens from the config file.
 * But for other apps, they can implement a resolver that gets tokens from a database or other source.
 */
interface TokenResolver
{
	/**
	 * Resolve the token for the given provider.
	 *
	 * Can also be used to resolve a organization_id, which is used by OpenAI.
	 *
	 * @param string $provider The provider name (e.g. 'google', 'anthropic', 'openai')
	 * @param string $key The key to get (most likely token / organization_id)
	 * @return string|null
	 */
	public function resolve(string $provider, string $key = 'token'): ?string;
}
