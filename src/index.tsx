import { render } from "solid-js/web";
import {
  getAdjustedColor,
  setGlobalFigureStyle,
  setGlobalMarkdownStyle,
  setKeyColors,
} from "panther";
import { App } from "./app";

setKeyColors({
  primary: "#942a74",
  primaryContent: "#ffffff",
  base100: "#ffffff",
  base200: "#ebebec",
  base300: "#d6d7d9",
  baseContent: "#000716",
  baseContentLessVisible: "#10151f",
});

setGlobalMarkdownStyle({
  text: {
    base: {
      font: {
        fontFamily: "Roboto",
        weight: 400,
        italic: false,
      },
      lineHeight: 1.4,
      lineBreakGap: 0,
    },
    h1: { relFontSize: 2.0 },
    h2: { relFontSize: 1.5 },
    h3: { relFontSize: 1.25 },
    blockquote: {
      color: getAdjustedColor({ key: "baseContent" }, { opacity: 0.6 }),
    },
  },
});

setGlobalFigureStyle({
  scale: 0.8,
  surrounds: {
    padding: { top: 0 },
    captionGap: 30,
  },
  text: {
    base: {
      font: {
        fontFamily: "Roboto",
        weight: 400,
        italic: false,
      },
      lineHeight: 1.4,
      lineBreakGap: 0,
    },
    caption: {
      font: {
        fontFamily: "Roboto",
        weight: 700,
        italic: false,
      },
      relFontSize: 1.2,
    },
    dataLabels: {
      relFontSize: 0.8,
    },
    legend: {
      relFontSize: 0.7,
    },
    xTextAxisTickLabels: {
      relFontSize: 0.8,
    },
  },
  content: {
    bars: {
      defaults: {
        show: true,
      },
    },
  },
});

render(() => <App />, document.getElementById("app")!);
