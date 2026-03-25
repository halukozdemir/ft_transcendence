import { useNavigate } from "react-router";
import { dashboardThemeVars } from "../../constants/appColors";

const TermsPage = () => {
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

        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-12">Last updated: March 25, 2026</p>

        <div className="space-y-10 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using HaxClone ("the Platform"), you agree to be
              bound by these Terms of Service. If you do not agree with any part of these
              terms, you must not use the Platform. HaxClone is an academic project
              developed at 42 School and is provided for educational and entertainment
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Eligibility</h2>
            <p>
              You must be at least 13 years of age to use this Platform. By registering,
              you confirm that you meet this requirement. Accounts created with false
              information may be suspended or terminated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Account Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                You are responsible for maintaining the confidentiality of your login
                credentials.
              </li>
              <li>
                You are responsible for all activity that occurs under your account.
              </li>
              <li>
                You must not share your account with others or create multiple accounts
                to gain an unfair advantage.
              </li>
              <li>
                Notify the development team immediately if you suspect unauthorized access
                to your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p className="mb-3">When using HaxClone, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Use cheats, exploits, automation tools, or any software that provides an
                unfair advantage in games.
              </li>
              <li>
                Send abusive, threatening, hateful, or otherwise inappropriate messages
                through the chat system.
              </li>
              <li>
                Impersonate other users or misrepresent your identity.
              </li>
              <li>
                Intentionally disrupt games by griefing, spamming, or repeatedly
                disconnecting.
              </li>
              <li>
                Attempt to exploit, probe, or attack the Platform's infrastructure,
                including but not limited to denial-of-service attacks, SQL injection,
                or unauthorized API access.
              </li>
              <li>
                Upload malicious content, including but not limited to executable files
                or scripts disguised as avatar images.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Game Rules and Fair Play</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                All matches are governed by the game's built-in rules (score limits, time
                limits, and standard physics).
              </li>
              <li>
                Match results are recorded automatically. Intentionally manipulating
                outcomes (e.g., win trading) is prohibited.
              </li>
              <li>
                Forfeiting a match counts as a loss. Disconnecting during an active match
                may also be recorded as a loss.
              </li>
              <li>
                We reserve the right to void match results and reset statistics if foul
                play is detected.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. User Content</h2>
            <p>
              By uploading content (avatars, chat messages, usernames), you grant HaxClone
              a non-exclusive, royalty-free license to display that content within the
              Platform. You retain ownership of your content but are solely responsible for
              ensuring it does not violate the rights of others or any applicable laws.
              We reserve the right to remove content that violates these terms without
              prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Intellectual Property</h2>
            <p>
              The HaxClone platform, including its source code, design, and game mechanics,
              is developed as part of the 42 School curriculum. The project is made
              available under the terms defined by its contributors. All third-party
              libraries and assets retain their respective licenses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time if you
              violate these Terms of Service. Upon termination, your right to access the
              Platform ceases immediately. You may also delete your own account at any time
              by contacting the development team.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Disclaimer of Warranties</h2>
            <p>
              HaxClone is provided "as is" and "as available" without warranties of any
              kind, whether express or implied. As an academic project, we do not guarantee
              uninterrupted service, data persistence, or compatibility with all devices
              and browsers. Use the Platform at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, the HaxClone development team shall
              not be liable for any indirect, incidental, or consequential damages arising
              from your use of the Platform. This includes, but is not limited to, loss of
              data, loss of game progress, or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Modifications</h2>
            <p>
              We may revise these Terms of Service at any time. Changes will be posted on
              this page with an updated date. Your continued use of the Platform after
              modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">12. Contact</h2>
            <p>
              For questions or concerns about these Terms of Service, please reach out to
              the HaxClone development team through the project's GitHub repository or
              contact a team member directly.
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

export default TermsPage;
