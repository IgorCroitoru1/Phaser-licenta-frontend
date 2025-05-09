"use client";

import React from "react";
import { Plus, Settings } from "lucide-react";


interface ServerSectionProps {
  label: string;
  sectionType: "channels" | "members";
}

export function ServerSection({
  label,
  sectionType,
}: ServerSectionProps) {

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-xs uppercase font-semibold dark:text-zinc-400">
        {label}
      </p>
      
        <button
        className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition"
        >
        <Settings className="h-4 w-4" />
        </button>
    </div>
  );
}