"use client";
import React from "react";

export interface MenuItem {
  id: string;
  icon?: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  danger?: boolean;
}

export interface MenuSection {
  title?: string;
  items: MenuItem[];
}

interface AsideMenuProps {
  sections?: MenuSection[];
  items?: MenuItem[];
  width?: number;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  border?: "right" | "left" | "none";
}

const BORDER_CLASS = {
  right: "border-r border-slate-200",
  left:  "border-l border-slate-200",
  none:  "",
} as const;

export function AsideMenu({
  sections,
  items,
  width = 220,
  header,
  footer,
  border = "right",
}: AsideMenuProps) {
  const allSections: MenuSection[] = sections ?? (items ? [{ items }] : []);

  return (
    <aside
      className={`bg-white flex flex-col shrink-0 h-full ${BORDER_CLASS[border]}`}
      style={{ width }}
    >
      {header}

      <nav className="flex-1 overflow-y-auto px-2 py-[6px]">
        {allSections.map((section, si) => (
          <div key={si} className={si < allSections.length - 1 ? "mb-1" : ""}>

            {section.title && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5px] px-[10px] pt-2 pb-1">
                {section.title}
              </p>
            )}

            {section.items.map((item) => (
              <button
                key={item.id}
                className="ui-menu-item"
                data-active={item.active ? "true" : "false"}
                data-danger={item.danger ? "true" : "false"}
                onClick={item.onClick}
              >
                {item.icon && (
                  <span className={`flex items-center shrink-0 ${item.active ? "opacity-100" : "opacity-70"}`}>
                    {item.icon}
                  </span>
                )}

                <span className="flex-1 truncate">{item.label}</span>

                {item.count !== undefined && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full shrink-0 ${
                      item.active
                        ? "bg-brand/15 text-brand"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            ))}

            {si < allSections.length - 1 && (
              <div className="h-px bg-slate-200 mx-1 my-[6px]" />
            )}
          </div>
        ))}
      </nav>

      {footer}
    </aside>
  );
}
