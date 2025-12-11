"use client";

import { PlaceholderComponent } from "./Placeholder/PlaceholderComponent";
import { BlankComponent } from "./Blank/BlankComponent";
import { TableComponent } from "./Table/TableComponent";
import { QuizComponent } from "./Quiz/QuizComponent";

export type UIMode = "blank" | "quiz" | "table" | "placeholder";

interface ModeRendererProps {
  mode: UIMode;
}

export function ModeRenderer({ mode }: ModeRendererProps) {
  switch (mode) {
    case "blank":
      return <BlankComponent />;

    case "quiz":
      return <QuizComponent />;

    case "table":
      return <TableComponent />;

    case "placeholder":
    default:
      return <PlaceholderComponent />;
  }
}

