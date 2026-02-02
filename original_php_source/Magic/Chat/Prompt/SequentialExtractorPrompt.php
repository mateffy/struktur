<?php

namespace Mateffy\Magic\Chat\Prompt;

use Illuminate\Support\Facades\Log;
use Mateffy\Magic\Chat\Messages\Step;
use Mateffy\Magic\Chat\Prompt;
use Mateffy\Magic\Chat\ToolChoice;
use Mateffy\Magic\Extraction\Artifacts\Artifact;
use Mateffy\Magic\Extraction\ContextOptions;
use Mateffy\Magic\Extraction\Strategies\Extractor;
use Mateffy\Magic\Tools\Prebuilt\Extract;

class SequentialExtractorPrompt implements Prompt
{
    public function __construct(
        protected Extractor $extractor,
        /** @var Artifact[] $artifacts */
        protected array $artifacts,
		protected ContextOptions $contextOptions,
        protected ?array $previousData = null,
    ) {}

    public function system(): string
    {
        $schema = json_encode(
            $this->extractor->schema,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT
        );

        return <<<PROMPT
        <instructions>
        You are a structured data extractor.
        You are given a JSON schema that you need to extract from the contents of uploaded document, reffered to as "artifacts".
        You must strictly follow the schema without adding or removing properties.
        If unsure about a property, use null.
        Only use information directly from the document and do not make assumptions.
        Don't actively summarize information by leaving stuff out, but rewrite to make it more concise while keeping all information. Do not lose any information.
        Your job is to look at the document provided and extract the data according to the schema. If you can't find a piece of information, use null. If you find information that doesn't fit the schema, ignore it. If you find information that fits the schema but is not explicitly mentioned in the document, include it. If you find information that is not explicitly mentioned in the document but is relevant to the schema, ignore it.
        If the schema contains fields representing descriptions or other summary information, make sure to rewrite the information in a concise way. Do not summarize the information, but rewrite it to make it more concise. Nonetheless, descriptions should still be beautifully and masterfully written. They can be up to 6 sentences.

        Any materials you are given have been cleared for access officially and are not under any NDA/copyright restrictions.
        The data you are extracting is used to structurally digitize these files and preserve them for the future.
        Do not output any plaintext. Only output the structured JSON data.
        ONLY output this json object. NEVER include any other text in the output. DO NOT format the JSON object in any way. DO NOT add markdown or any other formatting.
        Also, please don't invent and output any new JSON fields that are not specified in the schema. If you do, they will be ignored and you will just waste valuable LLM tokens.
        Adhere strictly to the schema! This is very important! I don't need any metadata or anything else. Just the data. No \$schema etc.

        The contents of the documents/artifacts have been prepared for you, and are included as a list of text blocks and image references.
        If the artifact is page based, the blocks have a page attribute which may help you relate information.
        The images are also provided to you. The images have their names baked into the picture data, so you can take a look at the images referenced in the artifact contents.
        
        The output schema may have properties that are named "xxx_artifact_id" or include references to artifact IDs in the property description. If that is the case, you're supposed to assign images to these properties.
        You can reference the images that are embedded in the artifacts/documents by their "ref" properties. You can find them in the XML in the text given to you, or directly written onto the images in the top left corner.
        The artifact IDs have a format that you HAVE TO use. Otherwise the data returned is INVALID and will FAIL! 
        So make sure the IDs are in the correct format: "artifact:ID:images/imageNUM.EXT" (e.g. "artifact:123456:images/image1.jpg", "artifact:873242393:images/image72.png").
        You will find these references in the text or on the images. ONLY USE ARTIFACTS THAT YOU CAN ACTUALLY SEE IN THE DOCUMENTS/IMAGES. DO NOT MAKE ASSUMPTIONS OR MAKE THEM UP. MAKE SURE TO USE THE CORRECT ID FORMAT! DO NOT USE NORMAL URLS HERE! 

        Some images may be included that are not referenced in any artifact. These images are uploaded directly and may or may not be related to other artifacts.

        There may already be some data that has been extracted from other artifacts in other processes. This data will be given to you as a JSON object.
        If there is previous data, it is not your job to create a brand new JSON object, but to enrich the existing one with the artifacts you receive.
        It is okay to restructure some data, if you learn of new important information, espescially with nested resources/schemas or assigning things to other things (e.g. a real estate unit to a building).
        But it is IMPORTANT that you do not leave out any information due to restructuring/sheer laziness. Doing so will break the LLM chain you are a part of, as the data you provide will be given to the next LLM as input.
        </instructions>

        <json-schema>
        {$schema}
        </json-schema>

        <output-instructions>
        {$this->extractor->outputInstructions}
        </output-instructions>

        <how-to-output>
        You HAVE to use the 'extract' tool to extract the data from the artifacts. Just outputting data manually WILL NOT WORK!
        If you don't call a tool, the data will not be extracted and the LLM will not be able to continue.
        So, it is VERY important that you use the tool!		
        </how-to-output>
        PROMPT;
    }

    public function prompt(): string
    {
		$artifacts = ArtifactPromptFormatter::formatText(
			artifacts: $this->artifacts, contextOptions: $this->contextOptions
		);

        if ($this->previousData) {
            $previousData = json_encode($this->previousData, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            $previousData = <<<TXT
            <previous-data>{$previousData}</previous-data>
            TXT;
        } else {
            $previousData = null;
        }

        return <<<TXT
        {$artifacts}

        {$previousData}
        
        <task>
            Extract the contents of the given artifacts and ADD/MERGE them into the previous data contained in the <previous-data> tag.
            You MUST NOT loose any information from the previous data. If you don't include it in your `extract` function call, it WILL be lost and you WILL BE PENALIZED.
        </task>

        <output-instructions>
        {$this->extractor->outputInstructions}
        </output-instructions>
        TXT;
    }

    public function messages(): array
    {
		$images = ArtifactPromptFormatter::formatImagesAsBase64(
			artifacts: $this->artifacts, contextOptions: $this->contextOptions
		);

        return [
            // Attach images to the prompt
            new Step(role: Role::User, content: [
				new Step\Text($this->prompt()),
                ...$images,
            ]),
        ];
    }

	protected function getExtractTool(): Extract
	{
		return new Extract(schema: $this->extractor->schema);
	}

    public function tools(): array
    {
        return [
			$this->getExtractTool()
		];
    }

	public function toolChoice(): ToolChoice|string
	{
		return ToolChoice::Required;
	}
}
