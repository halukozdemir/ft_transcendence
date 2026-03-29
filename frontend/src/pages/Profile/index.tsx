import { useEffect, useState } from "react";
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
    if (!user || !accessToken) return;
    setMatchesLoading(true);
    try {
      const data = await profileApi.getMatchHistory(user.id, accessToken, PAGE_SIZE, (page - 1) * PAGE_SIZE);
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

  useEffect(() => {
    if (!user || !accessToken) return;

    const fetchAll = async () => {
      try {
        const [statsData, matchData, achData] = await Promise.all([
          profileApi.getStats(user.id, accessToken),
          profileApi.getMatchHistory(user.id, accessToken, PAGE_SIZE, 0),
          profileApi.getAchievements(user.id, accessToken),
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

    fetchAll();
  }, [user, accessToken]);

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

  const profileData = {
    username: user.username,
    level,
    rank,
    avatarUrl: user.avatar || "/profile.jpg",
    bannerUrl: user.banner || "/banner.jpg",
    isOnline: user.online_status,
    lastSeen: user.last_seen,
    dateJoined: user.date_joined,
  };

  return (
    <div className="px-4 py-8 md:px-6">
      <ProfileHero
        isOwnProfile={true}
        onAddFriend={() => {}}
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
