import { Sorter } from "@/components/Sorter";
import { layers, sortItems } from "./layers.data";

const choices = layers.filter((l) => l.id !== "db").map((l) => ({ id: l.id, label: l.title }));

/** "Which layer does this belong in?" Eight items, instant feedback. */
export function LayerSorter() {
  return <Sorter items={sortItems} choices={choices} prompt="อยู่ชั้นไหน" />;
}
