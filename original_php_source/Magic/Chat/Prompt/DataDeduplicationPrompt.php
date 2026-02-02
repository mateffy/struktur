<?php

namespace Mateffy\Magic\Chat\Prompt;

use JsonException;
use Mateffy\Magic\Chat\Messages\ToolCall;
use Mateffy\Magic\Chat\Messages\Step;
use Mateffy\Magic\Chat\Messages\Step\Text;
use Mateffy\Magic\Chat\Messages\Step\ToolUse;
use Mateffy\Magic\Chat\Prompt;
use Mateffy\Magic\Chat\ToolChoice;
use Mateffy\Magic\Tools\Prebuilt\RemoveDuplicates;

class DataDeduplicationPrompt implements Prompt
{
    public function __construct(
        protected array $schema,
		protected array $data,
    ) {}

    public function system(): string
    {
        return <<<PROMPT
        <instructions>
        You are a data deduplication tool. 
        You are given a JSON schema and some data in that format.
        
        This format can contain certain array properties that may or may not contain duplicate entries.
        Your task is to remove all duplicates from these arrays by using the `removeDuplicates` tool.
        This tool accepts an array of dot-notated paths to the properties that you want to deduplicate. 
        This means that you don't have to output any data yourself, you only need to let us know what properties to remove.
        
        For example, if you were to have a JSON object with a `products` array property, that contains a duplicate product at the 3rd index, you would call the tool like this: `removeDuplicates({ keys: ['products.3']})`.
        
        The data schema may contain multiple array properties that need to be deduplicated. This is the reason dot-notated paths are used instead of just array indices, as it allows you to also do the following: `removeDuplicates({keys: ['products.3', 'categories.2']})`.
        You will only get a single shot at this! So it is VERY important that you get it right the first time! You MUST include all duplicates in a single tool call.
        
        What is a duplicate? That is for you to decide. However, the data should be VERY VERY similar, if not identical, for it to be considered a duplicate. Do not remove items that are just slightly similar, but not the same.
        For this reason it's important that you consider all the properties of an object and not just a label or a name. Two products with similar names but different prices are probably not duplicates. Two products with the exact same name and price are probably duplicates.
        Two products with slight variations in the name (for example data plans with different GB amounts) are probably not duplicates. Two products with the exact same name and GB amount are probably duplicates.
        Use common sense when deduplicating the data. If you are unsure, you MUST NOT remove the data. It is better to leave a duplicate in the data than to remove something that is not a duplicate.
        </instructions>

        <how-to-output>
        You HAVE to use the `removeDuplicates` tool and a flat array of dot-notated paths to the properties that you want to deduplicate in the `keys` parameter.
        </how-to-output>
        PROMPT;
    }

	/**
	 * @throws JsonException
	 */
	public function messages(): array
    {
		$example_tool_call = new ToolCall('removeDuplicates', [
			'keys' => ['products.3', 'products.5']
		]);

        return [
			// We provide the LLM a deduplication example to utilize few-shot prompting behavior
			new Step(role: Role::User, content: [
				new Text($this->makePrompt(
					schema: [
						'type' => 'object',
						'properties' => [
							'products' => [
								'type' => 'array',
								'items' => [
									'type' => 'object',
									'properties' => [
										'name' => ['type' => 'string'],
										'price' => ['type' => 'number'],
									]
								]
							]
						]
					],
					data: [
						'products' => [
							['name' => 'Brown Shoes', 'price' => 10.59],
							['name' => 'T-shirt', 'price' => 5.99],
							['name' => 'Yellow Shoes', 'price' => 10.59],
							['name' => 'Brown Shoes', 'price' => 10.59],
							['name' => 'Jeans pants', 'price' => 15.99],
							['name' => 'T-shirt', 'price' => 5.99],
							['name' => 'Sneakers', 'price' => 20.99],
							['name' => 'Suit', 'price' => 99.99],
							['name' => 'Overcoat', 'price' => 59.99],
						]
					]
				)),
            ]),
			new Step(
				role: Role::Assistant,
				content: [
					ToolUse::call($example_tool_call)
				]
			),
			new Step(
				role: Role::User,
				content: [
					Step\ToolResult::output($example_tool_call, 'The duplicates have been removed. Resetting the environment and preparing new data...'),
					new Text($this->makePrompt(
						schema: $this->schema,
						data: $this->data
					))
				]
			),
		];
    }

	protected function makePrompt(array $schema, array $data): string
	{
		$json_schema = json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT);
		$json_data = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT);

		return <<<PROMPT
		<task>Deduplicate the following data that belongs to the given schema:</task>
		<schema>
		{$json_schema}
		</schema>
		<data-to-deduplicate>
		{$json_data}
		</data-to-deduplicate>
		PROMPT;
	}

    public function tools(): array
    {
        return [
			new RemoveDuplicates
		];
    }

	public function toolChoice(): ToolChoice|string
	{
		return ToolChoice::Required;
	}
}
