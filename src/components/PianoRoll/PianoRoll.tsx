import React from "react"
import { Stage } from "@inlet/react-pixi"
import { Keys } from "./Keys"
import { Grid } from "./Grid"
import midi1 from "../../testdata/midi1.json"
import midi2 from "../../testdata/midi2.json"
import { toAbsolute } from "../../midi/toAbsolute"
import { MidiEvent } from "jasmid.ts/lib"
import { assemble } from "../../midi/noteAssembler"
import { NoteEvent, AbsoluteMidiEvent } from "../../midi/AbsoluteMidiEvent"
import { Notes } from "./Notes"
import {
  changes,
  isAddedChange,
  isModifiedChange,
  isDeletedChange
} from "../../midi/changes"

const numberOfKeys = 127
const keyHeight = 16
const keyWidth = 50
const stageWidth = 1500
const stageHeight = numberOfKeys * keyHeight

// TODO: Diff を表示できるようにする
// TODO: 複数の Hunk を表示できるようにする

const filterNotes = (e: AbsoluteMidiEvent | NoteEvent): e is NoteEvent =>
  e.subType === "note"

const greenColor = 0x33ff5f
const redColor = 0xff7585
const blackColor = 0xe1e8ef

export const PianoRoll = () => {
  const readNotes = (midi: any) =>
    assemble(toAbsolute(midi.tracks[1] as MidiEvent[])).filter(filterNotes)
  const events1 = readNotes(midi1)
  const events2 = readNotes(midi2)
  const c = changes(events1, events2)
  const addedNotes = c
    .filter(isAddedChange)
    .map(e => ({ ...e.value, color: greenColor }))
  const modifiedNotes = c
    .filter(isModifiedChange)
    .map(e => ({ ...e.newValue, color: greenColor }))
  const modifiedOldNotes = c
    .filter(isModifiedChange)
    .map(e => ({ ...e.oldValue, color: redColor }))
  const deletedNotes = c
    .filter(isDeletedChange)
    .map(e => ({ ...e.value, color: redColor }))
  const changedIndexes = c.map(e => e.index)
  const unchangedNotes = events1
    .filter((_, k) => !changedIndexes.includes(k))
    .map(e => ({ ...e, color: blackColor }))

  return (
    <Stage
      width={stageWidth}
      height={stageHeight}
      options={{ antialias: true, backgroundColor: 0xffffff }}
    >
      <Grid
        numberOfKeys={numberOfKeys}
        keyHeight={keyHeight}
        width={stageWidth}
      />
      <Keys
        numberOfKeys={numberOfKeys}
        keyHeight={keyHeight}
        width={keyWidth}
      />
      <Notes
        x={keyWidth}
        notes={[
          ...addedNotes,
          ...modifiedNotes,
          ...deletedNotes,
          ...modifiedOldNotes,
          ...unchangedNotes
        ]}
        transform={{
          pixelsPerKey: keyHeight,
          pixelsPerTick: 0.1,
          maxNoteNumber: numberOfKeys
        }}
      />
    </Stage>
  )
}
