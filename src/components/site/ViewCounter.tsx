"use client";
import { useEffect } from "react";

export function ViewCounter({ articleId }: { articleId: string }) {
  useEffect(() => {
    const key = `viewed:${articleId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    fetch("/api/view", { method: "POST", body: JSON.stringify({ id: articleId }), headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  }, [articleId]);
  return null;
}
