"use client";

import { ICON_GROUPS } from "@/lib/category-icons";
import { cn } from "@/lib/cn";

/** Grade de ícones da personalização (docs/design-system/componentes/category-icon-picker.md). */
export function IconPicker({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (key: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1 text-label text-tinta">Ícone</legend>
      {ICON_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-2">
          <p className="text-caption text-tinta-suave">{group.title}</p>
          <div className="flex flex-wrap gap-2">
            {group.icons.map(({ key, Icon, label }) => {
              const checked = key === value;
              return (
                <label
                  key={key}
                  className={cn(
                    "inline-flex size-11 cursor-pointer items-center justify-center rounded-md border",
                    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco",
                    checked
                      ? "border-ouro bg-ouro text-sobre-ouro"
                      : "border-borda bg-superficie text-tinta hover:bg-superficie-funda",
                  )}
                >
                  <input
                    type="radio"
                    name="icon"
                    value={key}
                    checked={checked}
                    onChange={() => onValueChange(key)}
                    className="md-sr"
                  />
                  <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                  <span className="md-sr">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
