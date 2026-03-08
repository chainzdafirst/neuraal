import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Cpu,
  Shield,
  Zap,
  MessageSquare,
  BookOpen,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const availableModels = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", speed: "Fast", quality: "Good" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", speed: "Medium", quality: "Excellent" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", provider: "OpenAI", speed: "Fast", quality: "Good" },
  { id: "gpt-5", name: "GPT-5", provider: "OpenAI", speed: "Slow", quality: "Excellent" },
];

const promptModules = [
  { id: "tutor", label: "AI Tutor", icon: MessageSquare, description: "Conversational study assistant" },
  { id: "examiner", label: "Examiner", icon: ClipboardCheck, description: "Quiz & assessment generation" },
  { id: "summarizer", label: "Summarizer", icon: BookOpen, description: "Document summary generation" },
  { id: "flashcard", label: "Flashcard Engine", icon: Sparkles, description: "Flashcard creation from content" },
];

export default function AdminAI() {
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const [citationEnforced, setCitationEnforced] = useState(true);
  const [syllabusBound, setSyllabusBound] = useState(true);
  const [globalPrompt, setGlobalPrompt] = useState(
    "You are Neuraal, an AI academic tutor. Always ground your responses in the provided curriculum materials. Be encouraging, accurate, and pedagogically sound."
  );

  const handleSave = () => {
    toast.success("AI configuration saved (local preview only)");
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">AI Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure AI models, prompts, and safety guardrails
          </p>
        </div>

        <Tabs defaultValue="models" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="models">
              <Cpu className="h-4 w-4 mr-1 sm:mr-2" />
              Models
            </TabsTrigger>
            <TabsTrigger value="prompts">
              <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
              Prompts
            </TabsTrigger>
            <TabsTrigger value="guardrails">
              <Shield className="h-4 w-4 mr-1 sm:mr-2" />
              Guardrails
            </TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Model Selection</CardTitle>
                <CardDescription>
                  Choose the primary LLM for Neuraal's AI features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedModel === model.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{model.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {model.provider}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {model.speed}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          {model.quality}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Temperature</Label>
                    <span className="text-sm text-muted-foreground">{temperature[0]}</span>
                  </div>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower = more focused & deterministic. Higher = more creative.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Max Tokens</Label>
                    <span className="text-sm text-muted-foreground">{maxTokens[0]}</span>
                  </div>
                  <Slider
                    value={maxTokens}
                    onValueChange={setMaxTokens}
                    min={256}
                    max={8192}
                    step={256}
                  />
                </div>

                <Button variant="gradient" onClick={handleSave}>
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prompts Tab */}
          <TabsContent value="prompts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global System Prompt</CardTitle>
                <CardDescription>
                  This prompt is prepended to all AI interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={globalPrompt}
                  onChange={(e) => setGlobalPrompt(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button variant="gradient" onClick={handleSave}>
                  Update Global Prompt
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promptModules.map((mod) => (
                <Card key={mod.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <mod.icon className="h-5 w-5 text-primary" />
                      {mod.label}
                    </CardTitle>
                    <CardDescription>{mod.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder={`Custom prompt override for ${mod.label}...`}
                      className="min-h-[80px]"
                    />
                    <Button size="sm" variant="outline" className="mt-3">
                      Save Override
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Guardrails Tab */}
          <TabsContent value="guardrails" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Safety Guardrails</CardTitle>
                <CardDescription>
                  Enforce content boundaries and quality standards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Mandatory Citation</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Require AI to cite source documents in responses
                    </p>
                  </div>
                  <Switch checked={citationEnforced} onCheckedChange={setCitationEnforced} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Syllabus-Bound Output</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Restrict AI responses to uploaded curriculum content
                    </p>
                  </div>
                  <Switch checked={syllabusBound} onCheckedChange={setSyllabusBound} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Prompt Injection Detection</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Block attempts to override system prompts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Hallucination Mitigation</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add confidence scoring and "I don't know" fallback
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button variant="gradient" onClick={handleSave}>
                  Save Guardrails
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
