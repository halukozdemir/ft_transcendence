import AchievementBadges from "../../components/profile/AchievementBadges";
import MatchHistoryTable from "../../components/profile/MatchHistoryTable";
import ProfileHero from "../../components/profile/ProfileHero";
import StatisticsCard from "../../components/profile/StatisticsCard";
import { useAuth } from "../../context/authContext";
import { mockStats, mockAchievements, mockMatches } from "./mockProfileData";

const ProfilePage = () => {
  const { user } = useAuth();

  const handleAddFriend = () => console.log("Add friend clicked");

  if (!user) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-slate-400">Profil yükleniyor...</p>
      </div>
    );
  }

  const profileData = {
    username: user.username,
    level: 24,
    rank: 4201,
    avatarUrl: user.avatar || "/profile.png",
    bannerUrl: user.banner || "/banner.png",
    isOnline: user.online_status,
  };

  return (
    <div className="px-4 py-8 md:px-6">
      <ProfileHero
        isOwnProfile={true}
        onAddFriend={handleAddFriend}
        profile={profileData}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <StatisticsCard stats={mockStats} />
          <AchievementBadges achievements={mockAchievements} />
        </div>

        <div className="lg:col-span-7">
          <MatchHistoryTable matches={mockMatches} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
