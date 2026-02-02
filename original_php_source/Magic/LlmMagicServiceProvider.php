<?php

namespace Mateffy\Magic;

use Mateffy\Magic\Tokens\OpenAiImageTokenizer;
use Mateffy\Magic\Support\ApiTokens\ConfigTokenResolver;
use Mateffy\Magic\Support\ApiTokens\TokenResolver;
use Mateffy\Magic\Tokens\ImageTokenizer;
use Mateffy\Magic\Tokens\MagicTextTokenizer;
use Mateffy\Magic\Tokens\TextTokenizer;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class LlmMagicServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->setBasePath(__DIR__ . '/..')
            ->name('llm-magic')
            ->hasConfigFile()
            ->hasViews('llm-magic');;
    }

	public function register()
	{
		parent::register();

		$this->app->bind(TokenResolver::class, function () {
			return new ConfigTokenResolver();
		});

		$this->app->bind(TextTokenizer::class, function () {
			return new MagicTextTokenizer();
		});

		$this->app->bind(ImageTokenizer::class, function () {
			return new OpenAiImageTokenizer();
		});
	}
}