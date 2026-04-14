import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Download,
  LoaderCircle,
  Play,
  Workflow,
} from "lucide-react";
import { renderPlantUmlPng } from "@/lib/plantuml";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const starterDiagram = `@startuml
title Checkout Sequence

actor Customer
participant "Storefront" as UI
participant "Order API" as API
database "Inventory" as DB
participant "Stripe" as PSP

Customer -> UI: Click "Pay now"
UI -> API: POST /checkout
API -> DB: Reserve stock
DB --> API: Reservation confirmed
API -> PSP: Create payment intent
PSP --> API: Payment URL
API --> UI: Checkout session
UI --> Customer: Redirect to hosted payment

@enduml`;

function App() {
  const [source, setSource] = useState(starterDiagram);
  const [imageUrl, setImageUrl] = useState("");
  const [isRendering, setIsRendering] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    let nextUrl = "";

    async function render() {
      setIsRendering(true);
      setError("");

      try {
        const blob = await renderPlantUmlPng(source);
        if (!isCurrent) {
          return;
        }

        nextUrl = URL.createObjectURL(blob);
        setImageUrl((previousUrl) => {
          if (previousUrl) {
            URL.revokeObjectURL(previousUrl);
          }
          return nextUrl;
        });
      } catch (renderError) {
        if (!isCurrent) {
          return;
        }

        setError(renderError instanceof Error ? renderError.message : "Rendering failed.");
      } finally {
        if (isCurrent) {
          setIsRendering(false);
        }
      }
    }

    render();

    return () => {
      isCurrent = false;
      if (nextUrl) {
        URL.revokeObjectURL(nextUrl);
      }
    };
  }, [source]);

  const downloadDiagram = () => {
    if (!imageUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "sequence-diagram.png";
    link.click();
  };

  return (
    <main className="min-h-screen">
      <div className="container py-8 md:py-12">
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Workflow className="size-6" />
                  </div>
                  <div>
                    <CardTitle>Sequence source</CardTitle>
                    <CardDescription>
                      Edit PlantUML text and the preview updates from the in-browser runtime.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSource(starterDiagram)}>
                    Reset sample
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      setSource((value) =>
                        value.endsWith("\n") ? value.slice(0, -1) : `${value}\n`,
                      )
                    }
                  >
                    <Play className="size-4" />
                    Force re-render
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                aria-label="PlantUML source"
                className="min-h-[460px] resize-y bg-[length:24px_24px] bg-grid-paper"
                spellCheck={false}
                value={source}
                onChange={(event) => setSource(event.target.value)}
              />
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{source.split("\n").length} lines</span>
                <span>Runtime assets load from `/vendor/plantuml` after `npm install`.</span>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Diagram preview</CardTitle>
                  <CardDescription>
                    PNG output is generated locally in the browser with no PlantUML server.
                  </CardDescription>
                </div>
                <Button variant="secondary" size="sm" onClick={downloadDiagram} disabled={!imageUrl}>
                  <Download className="size-4" />
                  Download PNG
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.5rem] border border-border bg-white/70 p-3">
                <ScrollArea className="h-[520px]">
                  <div className="flex min-h-[492px] items-center justify-center rounded-[1.1rem] bg-[radial-gradient(circle_at_top,_rgba(252,211,77,0.18),_transparent_35%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(244,239,228,0.92))] p-6">
                    {isRendering ? (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <LoaderCircle className="size-7 animate-spin" />
                        <p className="text-sm">Initializing browser PlantUML runtime...</p>
                      </div>
                    ) : error ? (
                      <div className="max-w-md rounded-[1.25rem] border border-destructive/20 bg-destructive/5 p-5 text-destructive">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <AlertTriangle className="size-4" />
                          Render failed
                        </div>
                        <p className="mt-2 text-sm leading-6">{error}</p>
                      </div>
                    ) : (
                      <img
                        alt="Rendered PlantUML sequence diagram"
                        className="max-w-full rounded-xl border border-border/60 bg-white shadow-sm"
                        src={imageUrl}
                      />
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default App;
