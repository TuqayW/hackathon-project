"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  BarChart3,
  Target,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
  Building2,
  History,
  Calendar,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AISuggestion {
  title: string;
  description: string;
  potentialSavings?: string;
  priority: "high" | "medium" | "low";
  actionItems?: string[];
  impactArea?: string;
}

interface Analysis {
  id: string;
  goalType: "EFFICIENCY" | "GROWTH";
  suggestions: AISuggestion[];
  rawResponse: string;
  createdAt: string;
  inputData: Record<string, unknown>;
}

interface AnalysisResult {
  goalType: "EFFICIENCY" | "GROWTH";
  totalBudget: number;
  avgEfficiency: number;
  suggestions: AISuggestion[];
  rawResponse: string;
  metadata?: {
    departmentCount: number;
    lowEfficiencyCount: number;
    highEfficiencyCount: number;
  };
}

export default function AnalyzePage() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [goalType, setGoalType] = useState<"EFFICIENCY" | "GROWTH">("EFFICIENCY");
  const [growthTarget, setGrowthTarget] = useState("10000");
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<Analysis[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [expandedSuggestion, setExpandedSuggestion] = useState<number | null>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [selectedPastAnalysis, setSelectedPastAnalysis] = useState<Analysis | null>(null);
  const [viewingPastAnalysis, setViewingPastAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");

  useEffect(() => {
    fetchPastAnalyses();
  }, []);

  const fetchPastAnalyses = async () => {
    try {
      const response = await fetch("/api/analyze");
      const data = await response.json();
      setPastAnalyses(data.analyses || []);
    } catch {
      console.error("Failed to load analyses");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    setExpandedSuggestion(null);
    setActiveTab("new");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalType,
          growthTarget: goalType === "GROWTH" ? parseFloat(growthTarget) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      const data = await response.json();
      setCurrentAnalysis(data.analysis);

      toast({
        title: "Analysis complete!",
        description: `Generated ${data.analysis.suggestions.length} detailed recommendations.`,
        variant: "success",
      });

      // Refresh history
      fetchPastAnalyses();
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const viewPastAnalysis = (analysis: Analysis) => {
    setSelectedPastAnalysis(analysis);
    setViewingPastAnalysis(true);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "medium":
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "High Priority";
      case "medium":
        return "Medium Priority";
      default:
        return "Low Priority";
    }
  };

  const renderSuggestions = (suggestions: AISuggestion[], isModal = false) => (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className={`overflow-hidden transition-all ${!isModal ? 'cursor-pointer hover:shadow-md' : ''} ${
              expandedSuggestion === index ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => !isModal && setExpandedSuggestion(expandedSuggestion === index ? null : index)}
          >
            <CardContent className="p-4">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">
                    {getPriorityIcon(suggestion.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-semibold text-base">
                        {index + 1}. {suggestion.title}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityBadge(suggestion.priority)}`}>
                        {getPriorityLabel(suggestion.priority)}
                      </span>
                    </div>
                    
                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {suggestion.potentialSavings && (
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {suggestion.potentialSavings}
                        </span>
                      )}
                      {suggestion.impactArea && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {suggestion.impactArea}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className={`text-sm text-muted-foreground ${!isModal && expandedSuggestion !== index ? 'line-clamp-2' : ''}`}>
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                
                {!isModal && (
                  <Button variant="ghost" size="icon" className="shrink-0">
                    {expandedSuggestion === index ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Expanded Content */}
              {(!isModal && expandedSuggestion === index) && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t"
                  >
                    {/* Action Items */}
                    {suggestion.actionItems && suggestion.actionItems.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          Action Steps
                        </h5>
                        <ul className="space-y-2">
                          {suggestion.actionItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Full Description */}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm">{suggestion.description}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Business Analyst
        </h1>
        <p className="text-muted-foreground mt-1">
          Get AI-powered insights to optimize your business finances
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Analysis Configuration */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Configure Analysis</CardTitle>
              <CardDescription>
                Choose your optimization goal for tailored recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={goalType}
                onValueChange={(v) => setGoalType(v as "EFFICIENCY" | "GROWTH")}
                className="space-y-3"
              >
                <Label
                  htmlFor="efficiency"
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    goalType === "EFFICIENCY"
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border hover:border-emerald-500/50"
                  }`}
                >
                  <RadioGroupItem value="EFFICIENCY" id="efficiency" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-emerald-500" />
                      <span className="font-semibold">Cost Efficiency</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Find ways to reduce spending while maintaining productivity.
                    </p>
                  </div>
                </Label>

                <Label
                  htmlFor="growth"
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    goalType === "GROWTH"
                      ? "border-sky-500 bg-sky-500/5"
                      : "border-border hover:border-sky-500/50"
                  }`}
                >
                  <RadioGroupItem value="GROWTH" id="growth" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-sky-500" />
                      <span className="font-semibold">Revenue Growth</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Identify investment opportunities for growth.
                    </p>
                  </div>
                </Label>
              </RadioGroup>

              <AnimatePresence>
                {goalType === "GROWTH" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Monthly Growth Target
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        value={growthTarget}
                        onChange={(e) => setGrowthTarget(e.target.value)}
                        className="pl-9"
                        placeholder="10000"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="gradient"
                className="w-full h-12 text-base"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Powered by Google Gemini AI
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results & History */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "new" | "history")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Current Analysis
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                History ({pastAnalyses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-6">
              {/* Current Analysis Results */}
              {currentAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Summary Card */}
                  <Card className={currentAnalysis.goalType === "EFFICIENCY" ? "border-emerald-500/50" : "border-sky-500/50"}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {currentAnalysis.goalType === "EFFICIENCY" ? (
                            <TrendingDown className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-sky-500" />
                          )}
                          {currentAnalysis.goalType === "EFFICIENCY" ? "Cost Efficiency" : "Revenue Growth"} Analysis
                        </CardTitle>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Just now
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold">{formatCurrency(currentAnalysis.totalBudget)}</p>
                          <p className="text-xs text-muted-foreground">Total Budget</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold">{currentAnalysis.avgEfficiency.toFixed(1)}/10</p>
                          <p className="text-xs text-muted-foreground">Avg Efficiency</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold">{currentAnalysis.suggestions.length}</p>
                          <p className="text-xs text-muted-foreground">Recommendations</p>
                        </div>
                      </div>
                      
                      {currentAnalysis.metadata && (
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 rounded-full bg-muted">
                            {currentAnalysis.metadata.departmentCount} departments analyzed
                          </span>
                          {currentAnalysis.metadata.lowEfficiencyCount > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              {currentAnalysis.metadata.lowEfficiencyCount} need attention
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Detailed Suggestions */}
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Detailed Recommendations
                    </h3>
                    {renderSuggestions(currentAnalysis.suggestions)}
                  </div>

                  {/* Raw Response Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRawResponse(!showRawResponse)}
                    className="w-full"
                  >
                    {showRawResponse ? "Hide" : "Show"} Full AI Response
                    {showRawResponse ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                  </Button>
                  
                  <AnimatePresence>
                    {showRawResponse && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg overflow-auto max-h-96">
                              {currentAnalysis.rawResponse}
                            </pre>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Empty State */}
              {!currentAnalysis && !isAnalyzing && (
                <Card className="py-16">
                  <div className="flex flex-col items-center text-center px-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-emerald-500/20 flex items-center justify-center mb-6">
                      <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      Ready to Optimize Your Business
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Select your analysis goal and click the button to get AI-powered recommendations.
                    </p>
                  </div>
                </Card>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <Card className="py-16">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold mt-6 mb-2">
                      Analyzing Your Business Data
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      Google Gemini is examining your departments and efficiency ratings...
                    </p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {isLoadingHistory ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : pastAnalyses.length === 0 ? (
                <Card className="py-12">
                  <div className="flex flex-col items-center text-center">
                    <History className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Past Analyses</h3>
                    <p className="text-sm text-muted-foreground">
                      Run your first analysis to see it saved here.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pastAnalyses.map((analysis, index) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                analysis.goalType === "EFFICIENCY" 
                                  ? "bg-emerald-500/10" 
                                  : "bg-sky-500/10"
                              }`}>
                                {analysis.goalType === "EFFICIENCY" ? (
                                  <TrendingDown className="w-6 h-6 text-emerald-500" />
                                ) : (
                                  <TrendingUp className="w-6 h-6 text-sky-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {analysis.goalType === "EFFICIENCY" 
                                    ? "Cost Efficiency Analysis" 
                                    : "Revenue Growth Analysis"}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(analysis.createdAt)}
                                  </span>
                                  <span>•</span>
                                  <span>{analysis.suggestions.length} recommendations</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewPastAnalysis(analysis)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>

                          {/* Preview of suggestions */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {analysis.suggestions.slice(0, 3).map((s, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-muted"
                              >
                                {s.title.slice(0, 30)}{s.title.length > 30 ? '...' : ''}
                              </span>
                            ))}
                            {analysis.suggestions.length > 3 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-muted">
                                +{analysis.suggestions.length - 3} more
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Past Analysis View Dialog */}
      <Dialog open={viewingPastAnalysis} onOpenChange={setViewingPastAnalysis}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPastAnalysis?.goalType === "EFFICIENCY" ? (
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-sky-500" />
              )}
              {selectedPastAnalysis?.goalType === "EFFICIENCY" 
                ? "Cost Efficiency Analysis" 
                : "Revenue Growth Analysis"}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {selectedPastAnalysis && formatDate(selectedPastAnalysis.createdAt)}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedPastAnalysis && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This analysis generated {selectedPastAnalysis.suggestions.length} recommendations.
              </p>
              
              {renderSuggestions(selectedPastAnalysis.suggestions as AISuggestion[], true)}

              {/* Show raw response */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  View raw AI response
                </summary>
                <pre className="mt-2 text-xs whitespace-pre-wrap font-mono bg-muted p-4 rounded-lg overflow-auto max-h-64">
                  {selectedPastAnalysis.rawResponse}
                </pre>
              </details>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
