
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelSelectorProps {
  selectedModel: string;
  onChange: (model: string) => void;
}

const AVAILABLE_MODELS = [
  {
    id: "llama3-8b-8192",
    name: "Llama 3 8B",
    description: "Meta's Llama 3 8B model - balanced performance",
  },
  {
    id: "llama3-70b-8192",
    name: "Llama 3 70B",
    description: "Meta's largest Llama 3 model - best quality",
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    description: "Mistral's mixture of experts model",
  },
  {
    id: "gemma-7b-it",
    name: "Gemma 7B",
    description: "Google's Gemma instruction-tuned model",
  },
];

const ModelSelector = ({ selectedModel, onChange }: ModelSelectorProps) => {
  return (
    <Select value={selectedModel} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_MODELS.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex flex-col">
              <span>{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModelSelector;
