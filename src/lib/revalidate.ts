import "server-only";
import { revalidatePath } from "next/cache";

/** Invalida o cache do site público após qualquer alteração administrativa. */
export function revalidateSite(paths: string[] = []) {
  revalidatePath("/", "layout");
  for (const p of paths) revalidatePath(p);
}
