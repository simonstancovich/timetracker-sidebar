import { useEffect, useState } from "react";
import { loadTimeEntries, loadUsers } from "../api";

export interface CurrentUser {
  _user_id: string;
  username: string;
}

interface UseCurrentUserArgs {
  authed: boolean | null;
  onUnresolvable: () => void;
}

export function useCurrentUser({ authed, onUnresolvable }: UseCurrentUserArgs) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      const cached = await window.electronAPI.storeGet("currentUser");
      if (
        cached &&
        typeof cached === "object" &&
        (cached as CurrentUser)._user_id &&
        (cached as CurrentUser).username
      ) {
        setCurrentUser(cached as CurrentUser);
        return;
      }
      // No cache — discover _user_id from a recent entry (entries are scoped to
      // me by the server). Walk back up to 14 days.
      try {
        const today = await loadTimeEntries(new Date());
        let uid = today[0]?._user_id;
        if (!uid) {
          for (let i = 1; i <= 14 && !uid; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const rows = await loadTimeEntries(d);
            uid = rows[0]?._user_id;
          }
        }
        if (!uid) {
          onUnresolvable();
          return;
        }
        const users = await loadUsers();
        const me = users.find((u) => u.id === uid);
        if (!me) {
          onUnresolvable();
          return;
        }
        const resolved: CurrentUser = {
          _user_id: me.id,
          username: me.name || me.username,
        };
        setCurrentUser(resolved);
        await window.electronAPI.storeSet("currentUser", resolved);
      } catch {
        onUnresolvable();
      }
    })();
  }, [authed, onUnresolvable]);

  return { currentUser, setCurrentUser };
}

export type UseCurrentUser = ReturnType<typeof useCurrentUser>;
