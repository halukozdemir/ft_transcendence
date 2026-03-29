import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { profileApi } from "../../services/profileApi";
import type { Friend } from "../../services/profileApi";

const FriendsPage = () => {
  const { user, accessToken } = useAuth();
  const [users, setUsers] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchUsers = async (showLoading = true) => {
    if (!accessToken) return;
    if (showLoading) setLoading(true);
    try {
      const result = await profileApi.getAllUsers(accessToken, searchText || undefined, 100);
      setUsers(result);
      setMessage(null);
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayTimer);
  }, [searchText, accessToken]);

  
  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => fetchUsers(false), 5000);
    return () => clearInterval(interval);
  }, [accessToken, searchText]);

  const handleAddFriend = async (targetUserId: number) => {
    if (!accessToken) return;
    try {
      await profileApi.sendFriendRequest(targetUserId, accessToken);
      setMessage({ type: "ok", text: "Friend added!" });
      
      const result = await profileApi.getAllUsers(accessToken, searchText || undefined, 100);
      setUsers(result);
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "An error occurred" });
    }
  };

  const handleRemoveFriend = async (targetUserId: number) => {
    if (!accessToken) return;
    try {
      await profileApi.removeFriend(targetUserId, accessToken);
      setMessage({ type: "ok", text: "Friend removed" });
      
      const result = await profileApi.getAllUsers(accessToken, searchText || undefined, 100);
      setUsers(result);
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "An error occurred" });
    }
  };

  if (!user || !accessToken) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-white">Find Friends</h1>

      {/* Search */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search username..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--dashboard-primary)] focus:ring-1 focus:ring-[var(--dashboard-primary)]/50"
        />
      </div>

      {message && (
        <p className={`text-sm ${message.type === "ok" ? "text-green-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-400">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-slate-400">User not found</p>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 shrink-0">
                  <img
                    alt={u.username}
                    className="w-full h-full object-cover"
                    src={u.avatar || "/profile.jpg"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/profile.jpg";
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">{u.username}</p>
                  <p className={`text-xs ${u.online_status ? "text-green-400" : "text-slate-500"}`}>
                    {u.online_status ? "● Online" : "○ Offline"}
                  </p>
                </div>
              </div>

              {u.is_friend ? (
                <button
                  onClick={() => handleRemoveFriend(u.id)}
                  className="cursor-pointer px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-sm font-semibold text-red-400 transition-colors"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => handleAddFriend(u.id)}
                  className="cursor-pointer px-4 py-2 rounded-lg bg-[var(--dashboard-primary)]/20 hover:bg-[var(--dashboard-primary)]/30 border border-[var(--dashboard-primary)] text-sm font-semibold text-[var(--dashboard-primary)] transition-colors"
                >
                  Add
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
