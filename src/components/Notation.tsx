import { useEffect, useRef } from "react";
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } from "vexflow";
import type { Clef } from "../modules/music";
import { parseNote } from "../modules/music";

interface NotationProps {
  note: string;   // e.g. "F#4"
  clef: Clef;
}

/** Map our clef names to VexFlow clef names. */
const VEXFLOW_CLEF: Record<Clef, string> = {
  bass: "bass",
  tenor: "tenor",
  treble: "treble",
};

/**
 * Convert our note format ("C#4") to VexFlow key format ("c#/4").
 */
function toVexKey(note: string): string {
  const { name, octave } = parseNote(note);
  return `${name.toLowerCase()}/${octave}`;
}

export default function Notation({ note, clef }: NotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clear any previous render.
    el.innerHTML = "";

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(260, 160);
    const context = renderer.getContext();
    context.setFont("Arial", 10);

    const stave = new Stave(10, 20, 240);
    stave.addClef(VEXFLOW_CLEF[clef]);
    stave.setContext(context).draw();

    const vexKey = toVexKey(note);
    const staveNote = new StaveNote({
      clef: VEXFLOW_CLEF[clef],
      keys: [vexKey],
      duration: "w",
    });

    // Add accidental if sharp.
    if (note.includes("#")) {
      staveNote.addModifier(new Accidental("#"));
    }

    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables([staveNote]);

    new Formatter().joinVoices([voice]).format([voice], 200);
    voice.draw(context, stave);
  }, [note, clef]);

  return <div ref={containerRef} className="notation" />;
}
