import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SchemaMode } from './ExtractPage'

type SchemaInputProps = {
  mode: SchemaMode
  schemaJson: string
  fields: string
  onModeChange: (mode: SchemaMode) => void
  onSchemaJsonChange: (json: string) => void
  onFieldsChange: (fields: string) => void
}

export function SchemaInput({
  mode,
  schemaJson,
  fields,
  onModeChange,
  onSchemaJsonChange,
  onFieldsChange,
}: SchemaInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={mode} onValueChange={(value) => onModeChange(value as SchemaMode)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fields" id="fields" />
            <Label htmlFor="fields" className="font-normal">Fields shorthand</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="json" id="json" />
            <Label htmlFor="json" className="font-normal">JSON Schema</Label>
          </div>
        </RadioGroup>

        {mode === 'fields' && (
          <div className="space-y-2">
            <Label htmlFor="fields-input">Field definitions</Label>
            <Input
              id="fields-input"
              placeholder='name:string, age:number, tags:array{string}'
              value={fields}
              onChange={(e) => onFieldsChange(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Separate fields with commas. Types: string, number, boolean, array, enum{'{a|b|c}'}
            </p>
          </div>
        )}

        {mode === 'json' && (
          <div className="space-y-2">
            <Label htmlFor="json-input">JSON Schema</Label>
            <Textarea
              id="json-input"
              placeholder='{"type": "object", "properties": {...}}'
              value={schemaJson}
              onChange={(e) => onSchemaJsonChange(e.target.value)}
              className="font-mono min-h-[200px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
