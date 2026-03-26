import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Media = {
  type: string;
  base64?: string;
  url?: string;
  width?: number;
  height?: number;
  imageType?: string;
};

type Content = {
  page?: number;
  text?: string;
  media?: Media[];
};

type Artifact = {
  id: string;
  type: string;
  contents: Content[];
};

type ChunkingSettings = {
  maxTokens: number;
  maxImages: number | null;
  textRatio: number;
  imageTokens: number;
  filterEmbedded: boolean;
  filterScreenshot: boolean;
};

const COLORS = {
  text: "#7a5c3a",
  images: "#bba88a",
  screenshots: "#d4c8b8",
  cumulative: "#2d1b0e",
};

// JetBrains Mono for chart typography
const CHART_FONT_FAMILY =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, monospace';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

const MODEL_PRICING = {
  "gpt-4o": { input: 2.5, output: 10.0, name: "GPT-4o" },
  "gpt-4o-mini": { input: 0.15, output: 0.6, name: "GPT-4o Mini" },
  "gpt-4-turbo": { input: 10.0, output: 30.0, name: "GPT-4 Turbo" },
  "claude-3-opus": { input: 15.0, output: 75.0, name: "Claude 3 Opus" },
  "claude-3-sonnet": { input: 3.0, output: 15.0, name: "Claude 3 Sonnet" },
};

type ArtifactChartsProps = {
  artifacts: Artifact[];
  chunkingSettings: ChunkingSettings;
};

export function ArtifactCharts({ artifacts, chunkingSettings }: ArtifactChartsProps) {
  const pageData = useMemo(() => {
    const pages: Array<{
      page: number;
      textTokens: number;
      imageTokens: number;
      screenshotTokens: number;
      total: number;
      cumulative: number;
    }> = [];

    let cumulative = 0;

    artifacts.forEach((artifact) => {
      artifact.contents.forEach((content) => {
        if (content.page !== undefined) {
          const textTokens = content.text
            ? estimateTokens(content.text) * chunkingSettings.textRatio
            : 0;

          const embeddedImages = content.media?.filter((m) => m.imageType === "embedded") || [];
          const screenshotImages = content.media?.filter((m) => m.imageType === "screenshot") || [];

          const imageTokens = chunkingSettings.filterEmbedded
            ? embeddedImages.length * chunkingSettings.imageTokens
            : 0;

          const screenshotTokens = chunkingSettings.filterScreenshot
            ? screenshotImages.length * chunkingSettings.imageTokens
            : 0;

          const total = textTokens + imageTokens + screenshotTokens;
          cumulative += total;

          pages.push({
            page: content.page,
            textTokens,
            imageTokens,
            screenshotTokens,
            total,
            cumulative,
          });
        }
      });
    });

    return pages.sort((a, b) => a.page - b.page);
  }, [artifacts, chunkingSettings]);

  const totalStats = useMemo(() => {
    const stats = {
      totalPages: pageData.length,
      totalSections: artifacts.reduce((sum, a) => sum + a.contents.length, 0),
      totalTokens: 0,
      textTokens: 0,
      imageTokens: 0,
      screenshotTokens: 0,
      totalImages: 0,
      totalScreenshots: 0,
    };

    pageData.forEach((page) => {
      stats.totalTokens += page.total;
      stats.textTokens += page.textTokens;
      stats.imageTokens += page.imageTokens;
      stats.screenshotTokens += page.screenshotTokens;
    });

    artifacts.forEach((artifact) => {
      artifact.contents.forEach((content) => {
        if (content.media) {
          stats.totalImages += content.media.filter((m) => m.imageType === "embedded").length;
          stats.totalScreenshots += content.media.filter(
            (m) => m.imageType === "screenshot",
          ).length;
        }
      });
    });

    return stats;
  }, [pageData, artifacts]);

  const pieData = useMemo(() => {
    return [
      { name: "Text", value: totalStats.textTokens, color: COLORS.text },
      { name: "Images", value: totalStats.imageTokens, color: COLORS.images },
      {
        name: "Screenshots",
        value: totalStats.screenshotTokens,
        color: COLORS.screenshots,
      },
    ].filter((d) => d.value > 0);
  }, [totalStats]);

  const estimatedCosts = useMemo(() => {
    const costs: Array<{
      model: string;
      name: string;
      inputCost: number;
      outputCost: number;
      totalCost: number;
    }> = [];

    Object.entries(MODEL_PRICING).forEach(([key, pricing]) => {
      const inputCost = (totalStats.totalTokens / 1_000_000) * pricing.input;
      const outputCost = (totalStats.totalTokens / 1_000_000) * pricing.output * 0.5;
      costs.push({
        model: key,
        name: pricing.name,
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
      });
    });

    return costs;
  }, [totalStats.totalTokens]);

  if (pageData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#ede5d8] border-[#d4c8b8]">
          <CardHeader className="pb-1 pt-3">
            <CardTitle
              className="text-xs font-bold tracking-tight text-[#2d1b0e]"
              style={{ fontFamily: CHART_FONT_FAMILY }}
            >
              TOKEN DISTRIBUTION BY PAGE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={pageData} barCategoryGap="15%">
                <CartesianGrid strokeDasharray="2 2" stroke="#d4c8b8" vertical={false} />
                <XAxis
                  dataKey="page"
                  tick={{
                    fontSize: 9,
                    fill: "#7a5c3a",
                    fontFamily: CHART_FONT_FAMILY,
                  }}
                  tickLine={false}
                  axisLine={{ stroke: "#d4c8b8" }}
                />
                <YAxis
                  tick={{
                    fontSize: 9,
                    fill: "#7a5c3a",
                    fontFamily: CHART_FONT_FAMILY,
                  }}
                  tickLine={false}
                  axisLine={{ stroke: "#d4c8b8" }}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f5efe6",
                    border: "1px solid #d4c8b8",
                    borderRadius: "6px",
                    fontFamily: CHART_FONT_FAMILY,
                    fontSize: "11px",
                  }}
                  labelStyle={{ fontFamily: CHART_FONT_FAMILY }}
                />
                <Bar
                  dataKey="textTokens"
                  stackId="a"
                  fill={COLORS.text}
                  name="Text"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="imageTokens"
                  stackId="a"
                  fill={COLORS.images}
                  name="Images"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="screenshotTokens"
                  stackId="a"
                  fill={COLORS.screenshots}
                  name="Screenshots"
                  radius={[0, 0, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#ede5d8] border-[#d4c8b8]">
          <CardHeader className="pb-1 pt-3">
            <CardTitle
              className="text-xs font-bold tracking-tight text-[#2d1b0e]"
              style={{ fontFamily: CHART_FONT_FAMILY }}
            >
              TOTAL TOKEN SPLIT
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f5efe6",
                    border: "1px solid #d4c8b8",
                    borderRadius: "6px",
                    fontFamily: CHART_FONT_FAMILY,
                    fontSize: "11px",
                  }}
                  formatter={(value) => Number(value).toLocaleString()}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#ede5d8] border-[#d4c8b8]">
        <CardHeader className="pb-1 pt-3">
          <CardTitle
            className="text-xs font-bold tracking-tight text-[#2d1b0e]"
            style={{ fontFamily: CHART_FONT_FAMILY }}
          >
            ARTIFACT STATISTICS
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div
            className="grid grid-cols-2 gap-x-8 gap-y-1.5"
            style={{ fontFamily: CHART_FONT_FAMILY }}
          >
            <div className="flex justify-between">
              <span className="text-[10px] text-[#7a5c3a]">Total Pages</span>
              <span className="text-[10px] font-bold text-[#2d1b0e]">{totalStats.totalPages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-[#7a5c3a]">Total Sections</span>
              <span className="text-[10px] font-bold text-[#2d1b0e]">
                {totalStats.totalSections}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-[#7a5c3a]">Total Tokens</span>
              <span className="text-[10px] font-bold text-[#2d1b0e]">
                {totalStats.totalTokens.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-[#7a5c3a]">Text Tokens</span>
              <span className="text-[10px] font-bold text-[#2d1b0e]">
                {totalStats.textTokens.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-[#7a5c3a]">Image Tokens</span>
              <span className="text-[10px] font-bold text-[#2d1b0e]">
                {totalStats.imageTokens.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-[#7a5c3a]">Screenshot Tokens</span>
              <span className="text-[10px] font-bold text-[#2d1b0e]">
                {totalStats.screenshotTokens.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-[#7a5c3a]">Total Images</span>
              <span className="text-[10px] font-bold text-[#2d1b0e]">{totalStats.totalImages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] text-[#7a5c3a]">Total Screenshots</span>
              <span className="text-[10px] font-bold text-[#2d1b0e]">
                {totalStats.totalScreenshots}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#d4c8b8]">
            <div
              className="text-[10px] font-bold text-[#2d1b0e] mb-2"
              style={{ fontFamily: CHART_FONT_FAMILY }}
            >
              ESTIMATED COSTS (per extraction)
            </div>
            <div className="grid grid-cols-3 gap-2" style={{ fontFamily: CHART_FONT_FAMILY }}>
              {estimatedCosts.slice(0, 6).map((cost) => (
                <div key={cost.model} className="text-[10px]">
                  <div className="text-[#7a5c3a]">{cost.name}</div>
                  <div className="font-bold text-[#2d1b0e]">${cost.totalCost.toFixed(4)}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
