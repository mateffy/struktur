import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { SchemaMode } from "./ExtractPage";

type SchemaInputProps = {
	mode: SchemaMode;
	schemaJson: string;
	fields: string;
	onModeChange: (mode: SchemaMode) => void;
	onSchemaJsonChange: (json: string) => void;
	onFieldsChange: (fields: string) => void;
};

export function SchemaInput({
	mode,
	schemaJson,
	fields,
	onModeChange,
	onSchemaJsonChange,
	onFieldsChange,
}: SchemaInputProps) {
	return (
		<div className="space-y-4">
			<RadioGroup
				value={mode}
				onValueChange={(value) => onModeChange(value as SchemaMode)}
				className="space-y-2"
			>
				<div className="flex items-center space-x-2">
					<RadioGroupItem
						value="fields"
						id="fields"
						className="border-[#d4c8b8] text-[#7a5c3a] data-[state=checked]:border-[#7a5c3a] data-[state=checked]:bg-[#7a5c3a]"
					/>
					<Label
						htmlFor="fields"
						className="font-normal text-[#3d2b15] cursor-pointer"
					>
						Fields shorthand
					</Label>
				</div>
				<div className="flex items-center space-x-2">
					<RadioGroupItem
						value="json"
						id="json"
						className="border-[#d4c8b8] text-[#7a5c3a] data-[state=checked]:border-[#7a5c3a] data-[state=checked]:bg-[#7a5c3a]"
					/>
					<Label
						htmlFor="json"
						className="font-normal text-[#3d2b15] cursor-pointer"
					>
						JSON Schema
					</Label>
				</div>
			</RadioGroup>

			{mode === "fields" && (
				<div className="space-y-2 pt-2">
					<Label htmlFor="fields-input" className="text-[#3d2b15]">
						Field definitions
					</Label>
					<Input
						id="fields-input"
						placeholder="name:string, age:number, tags:array{string}"
						value={fields}
						onChange={(e) => onFieldsChange(e.target.value)}
						className="font-mono bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] placeholder:text-[#a0926f] focus-visible:ring-[#7a5c3a]"
					/>
					<p className="text-xs text-[#a0926f]">
						Separate fields with commas. Types: string, number, boolean, array,
						enum{"{a|b|c}"}
					</p>
				</div>
			)}

			{mode === "json" && (
				<div className="space-y-2 pt-2">
					<Label htmlFor="json-input" className="text-[#3d2b15]">
						JSON Schema
					</Label>
					<Textarea
						id="json-input"
						placeholder='{"type": "object", "properties": {...}}'
						value={schemaJson}
						onChange={(e) => onSchemaJsonChange(e.target.value)}
						className="font-mono min-h-[200px] bg-[#f5efe6] border-[#d4c8b8] text-[#2d1b0e] placeholder:text-[#a0926f] focus-visible:ring-[#7a5c3a]"
					/>
				</div>
			)}
		</div>
	);
}
