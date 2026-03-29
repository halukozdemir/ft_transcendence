import { useNavigate } from "react-router";
import { dashboardThemeVars } from "../../constants/appColors";

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] text-slate-300" style={dashboardThemeVars}>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer mb-8 text-sm text-slate-500 hover:text-white transition-colors"
          type="button"
        >
          &larr; Back
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-12">Last updated: March 25, 2026</p>

        <div className="space-y-10 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              HaxClone ("we", "us", or "our") is a multiplayer web-based game platform
              developed as an academic project at 42 School. This Privacy Policy explains
              how we collect, use, and protect your personal information when you use our
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="text-white font-medium">Account Information:</span> When
                you register, we collect your email address, username, and a hashed version
                of your password.
              </li>
              <li>
                <span className="text-white font-medium">Profile Data:</span> Avatar images
                you upload, your online status, and your friends list.
              </li>
              <li>
                <span className="text-white font-medium">Game Data:</span> Match results,
                scores, game statistics, and in-game actions necessary for real-time
                multiplayer functionality.
              </li>
              <li>
                <span className="text-white font-medium">Chat Messages:</span> Messages
                sent through the in-game chat system are processed in real time via
                WebSockets. Message content may be stored for moderation purposes.
              </li>
              <li>
                <span className="text-white font-medium">Technical Data:</span> Connection
                timestamps, IP addresses (logged by the web server), and browser user-agent
                strings. We do not use third-party analytics or tracking scripts.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authenticate you and manage your account.</li>
              <li>Provide real-time multiplayer game sessions and matchmaking.</li>
              <li>Display your profile, statistics, and friends list to other users.</li>
              <li>Deliver in-game chat functionality.</li>
              <li>Maintain platform security and prevent abuse.</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your personal information with third parties
              for commercial purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Storage and Security</h2>
            <p>
              All data is stored in a PostgreSQL database hosted on our own infrastructure.
              Passwords are salted and hashed using Django's default PBKDF2 algorithm.
              Communication between your browser and our servers is encrypted via
              HTTPS/TLS. Authentication tokens (JWT) are stored in your browser's local
              storage and expire automatically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              Your account data is retained as long as your account is active. If you wish
              to delete your account and associated data, you may contact us through the
              support channels listed below. Game statistics and match history may be
              retained in anonymized form for leaderboard integrity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your account and personal data.</li>
              <li>Export your data in a portable format.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please reach out to a member of the
              development team.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Cookies and Local Storage</h2>
            <p>
              We do not use tracking cookies. We store JWT authentication tokens in
              your browser's local storage solely for session management. No third-party
              cookies or advertising trackers are used on this platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Children's Privacy</h2>
            <p>
              HaxClone is not intended for users under the age of 13. We do not knowingly
              collect personal information from children. If we become aware that a child
              under 13 has provided us with personal data, we will take steps to delete
              that information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be
              reflected on this page with an updated revision date. Continued use of the
              platform after changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy or your personal data, please
              contact the HaxClone development team through the project's GitHub repository
              or speak with a team member directly.
            </p>
          </section>
        </div>

        <div className="mt-16 border-t border-[var(--dashboard-border)] pt-6 text-center text-xs text-slate-600">
          HaxClone &mdash; 42 School Project
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
