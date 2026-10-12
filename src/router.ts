import { useSyncExternalStore } from "react";

export type Role = "student" | "instructor" | "secretariat" | "admin";
export const roleNames: Record<Role, string> = {
  student: "学習者",
  instructor: "講師",
  secretariat: "事務局",
  admin: "システム管理者",
};
export function navigate(path: string, replace = false) {
  const url = new URL(path, location.origin);
  if (url.origin !== location.origin) {
    location.assign(path);
    return;
  }
  history[replace ? "replaceState" : "pushState"](
    {},
    "",
    url.pathname + url.search + url.hash,
  );
  window.dispatchEvent(new Event("lms:navigate"));
  window.scrollTo({ top: 0, behavior: "instant" });
}
function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("lms:navigate", callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("lms:navigate", callback);
  };
}
export function usePath() {
  return useSyncExternalStore(
    subscribe,
    () => location.pathname + location.search,
    () => "/student/dashboard",
  );
}
export function roleForPath(path: string): Role {
  return path.startsWith("/admin")
    ? "admin"
    : path.startsWith("/secretariat") || path.startsWith("/courses")
      ? "secretariat"
      : path.startsWith("/instructor") || path.startsWith("/lessons")
        ? "instructor"
        : "student";
}
