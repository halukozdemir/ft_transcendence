import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/authContext";
import { authApi } from "../../services/authApi";

const SettingsPage = () => {
  const { user, accessToken, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  
  const [username, setUsername] = useState(user?.username || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async () => {
    if (!accessToken) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const updatedProfile = await authApi.updateProfile(accessToken, {
        username: username !== user?.username ? username : undefined,
        avatar: avatarFile || undefined,
        banner: bannerFile || undefined,
      });
      await refreshProfile();
      setProfileMsg({ type: "ok", text: "Profil güncellendi." });
      setUsername(updatedProfile.username);
      setAvatarPreview(updatedProfile.avatar || null);
      setBannerPreview(updatedProfile.banner || null);
      setAvatarFile(null);
      setBannerFile(null);
    } catch (err) {
      setProfileMsg({ type: "err", text: err instanceof Error ? err.message : "Hata oluştu." });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!accessToken) return;
    if (!oldPassword || !newPassword || !newPassword2) {
      setPasswordMsg({ type: "err", text: "Tüm alanlar zorunludur." });
      return;
    }
    if (newPassword !== newPassword2) {
      setPasswordMsg({ type: "err", text: "Yeni şifreler eşleşmiyor." });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await authApi.changePassword(accessToken, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      });
      setPasswordMsg({ type: "ok", text: "Şifre başarıyla değiştirildi." });
      setOldPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch (err) {
      setPasswordMsg({ type: "err", text: err instanceof Error ? err.message : "Hata oluştu." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!accessToken) return;
    if (!deletePassword) {
      setDeleteMsg({ type: "err", text: "Şifrenizi girmelisiniz." });
      return;
    }
    setDeleteLoading(true);
    setDeleteMsg(null);
    try {
      await authApi.deleteAccount(accessToken, deletePassword);
      await logout();
      navigate("/auth");
    } catch (err) {
      setDeleteMsg({ type: "err", text: err instanceof Error ? err.message : "Hata oluştu." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-(--dashboard-primary) focus:ring-1 focus:ring-(--dashboard-primary)/50";

  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <h1 className="text-2xl font-bold text-white">Ayarlar</h1>

      {/* Profil */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white">Profil</h2>

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div
            className="relative size-20 cursor-pointer rounded-full overflow-hidden border-2 border-white/10 bg-(--dashboard-border) shrink-0"
            onClick={() => avatarRef.current?.click()}
          >
            <img
              alt="Avatar"
              className="size-full object-cover"
              src={avatarPreview || user?.avatar || "/profile.jpg"}
              onError={(e) => { (e.target as HTMLImageElement).src = "/profile.jpg"; }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
            </div>
          </div>
          <input ref={avatarRef} accept="image/*" className="hidden" onChange={handleAvatarChange} type="file" />
          <div>
            <p className="text-sm font-semibold text-white">Profil Fotoğrafı</p>
            <p className="text-xs text-slate-500 mt-0.5">Fotoğrafa tıklayarak değiştir</p>
          </div>
        </div>

        {/* Banner */}
        <div>
          <p className="text-sm font-semibold text-white mb-2">Kapak Fotoğrafı</p>
          <div
            className="relative h-28 w-full cursor-pointer rounded-xl overflow-hidden border border-white/10 bg-(--dashboard-border)"
            onClick={() => bannerRef.current?.click()}
          >
            <img
              alt="Banner"
              className="h-full w-full object-cover"
              src={bannerPreview || "/banner.jpg"}
              onError={(e) => { (e.target as HTMLImageElement).src = "/banner.jpg"; }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
            </div>
          </div>
          <input ref={bannerRef} accept="image/*" className="hidden" onChange={handleBannerChange} type="file" />
        </div>

        {/* Kullanıcı Adı */}
        <div>
          <label className={labelClass}>Kullanıcı Adı</label>
          <input
            className={inputClass}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="kullanici_adi"
            type="text"
            value={username}
          />
        </div>

        {profileMsg && (
          <p className={`text-sm ${profileMsg.type === "ok" ? "text-green-400" : "text-red-400"}`}>
            {profileMsg.text}
          </p>
        )}

        <button
          className="cursor-pointer rounded-lg bg-(--dashboard-primary) hover:bg-(--dashboard-primary)/90 px-5 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={profileLoading}
          onClick={handleProfileSave}
          type="button"
        >
          {profileLoading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </section>

      {/* Şifre */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white">Şifre Değiştir</h2>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordChange();
          }}
        >
          <input
            aria-hidden="true"
            autoComplete="username"
            className="sr-only"
            readOnly
            tabIndex={-1}
            type="text"
            value={user?.username || ""}
          />
          <div>
            <label className={labelClass}>Mevcut Şifre</label>
            <input
              className={inputClass}
              autoComplete="current-password"
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              value={oldPassword}
            />
          </div>
          <div>
            <label className={labelClass}>Yeni Şifre</label>
            <input
              className={inputClass}
              autoComplete="new-password"
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              value={newPassword}
            />
          </div>
          <div>
            <label className={labelClass}>Yeni Şifre Tekrar</label>
            <input
              className={inputClass}
              autoComplete="new-password"
              onChange={(e) => setNewPassword2(e.target.value)}
              placeholder="••••••••"
              type="password"
              value={newPassword2}
            />
          </div>

          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.type === "ok" ? "text-green-400" : "text-red-400"}`}>
              {passwordMsg.text}
            </p>
          )}

          <button
            className="cursor-pointer rounded-lg bg-(--dashboard-primary) hover:bg-(--dashboard-primary)/90 px-5 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={passwordLoading}
            type="submit"
          >
            {passwordLoading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
          </button>
        </form>
      </section>

      {/* Hesap Silme */}
      <section className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-red-400">Hesap Silme</h2>
        <p className="text-sm text-slate-400">
          Hesabınızı silerseniz tüm verileriniz kalıcı olarak silinir ve bu işlem geri alınamaz.
        </p>

        {!deleteConfirm ? (
          <button
            className="cursor-pointer rounded-lg border border-red-500/40 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
            onClick={() => setDeleteConfirm(true)}
            type="button"
          >
            Hesabımı Sil
          </button>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleDeleteAccount();
            }}
          >
            <input
              aria-hidden="true"
              autoComplete="username"
              className="sr-only"
              readOnly
              tabIndex={-1}
              type="text"
              value={user?.username || ""}
            />
            <div>
              <label className={labelClass + " text-red-400"}>Onaylamak için şifrenizi girin</label>
              <input
                className={inputClass + " border-red-500/30 focus:border-red-500"}
                autoComplete="current-password"
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                value={deletePassword}
              />
            </div>

            {deleteMsg && (
              <p className="text-sm text-red-400">{deleteMsg.text}</p>
            )}

            <div className="flex gap-3">
              <button
                className="cursor-pointer rounded-lg bg-red-500 hover:bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteLoading}
                type="submit"
              >
                {deleteLoading ? "Siliniyor..." : "Kalıcı Olarak Sil"}
              </button>
              <button
                className="cursor-pointer rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                onClick={() => { setDeleteConfirm(false); setDeletePassword(""); setDeleteMsg(null); }}
                type="button"
              >
                Vazgeç
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default SettingsPage;
