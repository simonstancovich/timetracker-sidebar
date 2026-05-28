import { useCallback, useEffect, useRef, useState } from "react";
import { loadCompanies, loadProjects } from "../api";
import type { Company, Project } from "../api";
import { classifyApiError } from "./apiError";

interface UseCompaniesArgs {
  authed: boolean | null;
  onOnlineChange: (online: boolean) => void;
}

// Cohesive state for the company + project catalog: the company list, the lazy
// per-company project cache, error flags for each, and the load helpers. Read by
// every view that picks a client/project; written by the initial load + the
// per-company lazy fetch.
export function useCompanies({ authed, onOnlineChange }: UseCompaniesArgs) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesError, setCompaniesError] = useState(false);
  const [projectErrors, setProjectErrors] = useState<Record<string, boolean>>(
    {},
  );
  const [projectCache, setProjectCache] = useState<Record<string, Project[]>>(
    {},
  );
  // Latest cache for ensureProjects so the callback identity stays stable.
  const projectCacheRef = useRef(projectCache);
  projectCacheRef.current = projectCache;

  const reload = useCallback(() => {
    setCompaniesError(false);
    loadCompanies()
      .then((list) => {
        setCompanies(list);
        onOnlineChange(true);
      })
      .catch((err) => {
        setCompaniesError(true);
        const k = classifyApiError(err);
        if (k === "offline" || k === "timeout") onOnlineChange(false);
      });
  }, [onOnlineChange]);

  useEffect(() => {
    if (!authed) return;
    reload();
  }, [authed, reload]);

  // Lazy load projects for a company.
  const ensureProjects = useCallback(
    async (cid: string): Promise<Project[]> => {
      const cached = projectCacheRef.current[cid];
      if (cached) return cached;
      try {
        const list = await loadProjects(cid);
        setProjectCache((c) => ({ ...c, [cid]: list }));
        setProjectErrors((e) => (e[cid] ? { ...e, [cid]: false } : e));
        return list;
      } catch (err) {
        setProjectErrors((e) => ({ ...e, [cid]: true }));
        const k = classifyApiError(err);
        if (k === "offline" || k === "timeout") onOnlineChange(false);
        return [];
      }
    },
    [onOnlineChange],
  );

  return {
    companies, setCompanies,
    companiesError,
    projectErrors,
    projectCache, setProjectCache,
    ensureProjects,
    reload,
  };
}

export type UseCompanies = ReturnType<typeof useCompanies>;
