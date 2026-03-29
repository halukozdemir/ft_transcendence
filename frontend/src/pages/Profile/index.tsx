import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import AchievementBadges from "../../components/profile/AchievementBadges";
import MatchHistoryTable from "../../components/profile/MatchHistoryTable";
import ProfileHero from "../../components/profile/ProfileHero";
import StatisticsCard from "../../components/profile/StatisticsCard";
import { useAuth } from "../../context/authContext";
import { profileApi } from "../../services/profileApi";
import type { Achievement, Match, PlayerStats } from "../../types/profile";
import type { AchievementType } from "../../types/profile";

const BADGE_TYPE_MAP: Record<string, AchievementType> = {
  first_win: "verified",
  streak_5: "streak",
  unstoppable: "streak",
  perfect_win: "tournament",
  tournament_champion: "tournament",
};

const PAGE_SIZE = 5;

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 172800) return "Dün";
  return `${Math.floor(diff / 86400)} gün önce`;
}

const ProfilePage = () => {
  const { user, accessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get("user_id");

  const targetUserId = queryUserId ? Number(queryUserId) : user?.id;
  const isOwnProfile = !queryUserId || Number(queryUserId) === user?.id;

  const [targetUser, setTargetUser] = useState<any>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [level, setLevel] = useState(1);
  const [rank, setRank] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchPage, setMatchPage] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
  const [matchesLoading, setMatchesLoading] = useState(false);

  const totalPages = Math.ceil(totalMatches / PAGE_SIZE);

  const fetchMatches = async (page: number) => {
    if (!targetUserId || !accessToken) return;
    setMatchesLoading(true);
    try {
      const data = await profileApi.getMatchHistory(targetUserId, accessToken, PAGE_SIZE, (page - 1) * PAGE_SIZE);
      setTotalMatches(data.total);
      setMatches(
        data.results.map((m: any) => {
          const opponentNames = m.opponents?.map((o: any) => o.username).join(", ") || `Maç #${m.id}`;
          const result = (m.result as string).toUpperCase() as "WIN" | "LOSS" | "DRAW";
          return {
            id: String(m.id),
            roomName: opponentNames,
            result,
            score: { us: m.my_score, them: m.opponent_score },
            timestamp: new Date(m.played_at),
            timeAgoText: timeAgo(m.played_at),
          };
        })
      );
    } catch (err) {
      console.error("Match history fetch failed", err);
    } finally {
      setMatchesLoading(false);
    }
  };

  const fetchAll = async (showLoading = true) => {
    if (!targetUserId || !accessToken) return;
    if (showLoading) setLoading(true);
    try {
      if (!isOwnProfile) {
        const publicUser = await profileApi.getUserPublic(targetUserId);
        setTargetUser(publicUser);
      } else {
        setTargetUser(null);
      }

      const [statsData, matchData, achData] = await Promise.all([
        profileApi.getStats(targetUserId, accessToken),
        profileApi.getMatchHistory(targetUserId, accessToken, PAGE_SIZE, 0),
        profileApi.getAchievements(targetUserId, accessToken),
      ]);

      setLevel(statsData.level);
      setRank(statsData.ranking ?? 0);

      setStats({
        totalMatches: statsData.total_matches,
        winPercentage: Math.round(statsData.win_rate),
        xp: statsData.xp,
        level: statsData.level,
        xpInLevel: statsData.xp % 100,
        xpGoal: 100,
        goalsScored: 0,
        goalsPerGame: 0,
        offenseRating: 0,
        defenseRating: 0,
        weeklyMatches: 0,
      });

      setTotalMatches(matchData.total);
      setMatches(
        matchData.results.map((m: any) => {
          const opponentNames = m.opponents?.map((o: any) => o.username).join(", ") || `Maç #${m.id}`;
          const result = (m.result as string).toUpperCase() as "WIN" | "LOSS" | "DRAW";
          return {
            id: String(m.id),
            roomName: opponentNames,
            result,
            score: { us: m.my_score, them: m.opponent_score },
            timestamp: new Date(m.played_at),
            timeAgoText: timeAgo(m.played_at),
          };
        })
      );

      setAchievements(
        achData.map((a: any) => ({
          id: String(a.id),
          type: BADGE_TYPE_MAP[a.badge_type] ?? "special",
          icon: a.icon_url,
          title: a.name,
          description: a.description,
          unlockedAt: new Date(a.unlocked_at),
        }))
      );
    } catch (err) {
      console.error("Profile data fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    setMatchPage(1);
    fetchAll();
  }, [targetUserId, accessToken]);

  
  useEffect(() => {
    if (!targetUserId || !accessToken) return;
    const interval = setInterval(() => fetchAll(false), 5000);
    return () => clearInterval(interval);
  }, [targetUserId, accessToken]);

  const handlePageChange = (page: number) => {
    setMatchPage(page);
    fetchMatches(page);
  };

  if (!user) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-slate-400">Profil yükleniyor...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-slate-400">İstatistikler yükleniyor...</p>
      </div>
    );
  }

  const displayUser = isOwnProfile ? user : targetUser;
  if (!displayUser) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-slate-400">Kullanıcı bulunamadı</p>
      </div>
    );
  }

  const profileData = {
    username: displayUser.username,
    level,
    rank,
    avatarUrl: displayUser.avatar || "/profile.jpg",
    bannerUrl: displayUser.banner || "/banner.jpg",
    isOnline: displayUser.online_status,
    lastSeen: displayUser.last_seen ?? null,
    dateJoined: displayUser.date_joined ?? "",
  };

  return (
    <div className="px-4 py-8 md:px-6">
      <ProfileHero
        isOwnProfile={isOwnProfile}
        profile={profileData}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          {stats && <StatisticsCard stats={stats} />}
          <AchievementBadges achievements={achievements} />
        </div>

        <div className="lg:col-span-7">
          <div className={matchesLoading ? "opacity-60 pointer-events-none" : ""}>
            <MatchHistoryTable
              matches={matches}
              page={matchPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
