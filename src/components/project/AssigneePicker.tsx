import { MultiSelect } from "@/components/common/select"
import { Avatar } from "@/components/common/tile"
import type { Member } from "@/types/project"

/** Pick any number of project members. Chosen people show as avatar chips. */
export function AssigneePicker({ id, members, value, onChange }: { id: string; members: Member[]; value: number[]; onChange: (ids: number[]) => void }) {
  const byId = (v: string) => members.find((m) => String(m.id) === v)
  return (
    <MultiSelect
      id={id}
      placeholder="Unassigned"
      searchPlaceholder="Search people"
      max={10}
      value={value.map(String)}
      onChange={(vs) => onChange(vs.map(Number))}
      options={members.map((m) => ({ value: String(m.id), label: m.displayName, icon: <Avatar name={m.displayName} className="size-5 text-[9px]" /> }))}
      renderChip={(v) => {
        const m = byId(v)
        return m ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-input bg-card py-0.5 pr-2.5 pl-0.5 text-xs font-medium">
            <Avatar name={m.displayName} className="size-5 text-[9px]" />
            {m.displayName}
          </span>
        ) : null
      }}
    />
  )
}
