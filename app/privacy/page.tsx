export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <p>
            This Privacy Policy describes how EasyKind Health LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, maintains, and discloses information collected from users (&quot;you&quot; or &quot;User&quot;) of the HealthPlans.now website (&quot;Site&quot;).
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">Personal Information We Collect</h2>
          <p>
            We may collect personal information from you when you visit our Site, fill out a form, request a quote, or verify your identity. This may include your name, email address, mailing address, phone number, date of birth, gender, zip code, and Medicare-related information such as your current plan type and premium.
          </p>
          <p>
            You may visit our Site anonymously. We collect personal information only when you voluntarily submit it to us. You can refuse to supply personal information, though it may prevent you from receiving quotes or completing enrollment.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">Non-Personal Information</h2>
          <p>
            We may collect non-personal information about you whenever you interact with our Site, including your browser type, device type, operating system, Internet service provider, and similar technical information.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">Cookies and Tracking Technologies</h2>
          <p>
            Our Site may use cookies to enhance your experience. Cookies are small files placed on your device for record-keeping and to track certain information. You may configure your browser to refuse cookies, though some features of the Site may not function properly without them.
          </p>
          <p>
            We use server-side tracking technologies (such as Facebook Conversions API) to measure the effectiveness of our advertising. This tracking occurs on our servers, not in your browser, and uses hashed (anonymized) versions of your information. No health-related data is shared with advertising platforms.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">How We Use Your Information</h2>
          <p>We may use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide Medicare Supplement insurance quotes and rate comparisons</li>
            <li>To verify your identity via SMS verification</li>
            <li>To connect you with licensed insurance agents</li>
            <li>To process enrollment applications</li>
            <li>To improve our Site and customer service</li>
            <li>To send periodic communications related to your quote or enrollment</li>
            <li>To measure advertising effectiveness through anonymized server-side tracking</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-3">Phone, Text, and Email Communications</h2>
          <p>
            By submitting your contact information and verifying your phone number on our Site, you consent to receive calls, text messages (including via autodialer and prerecorded/artificial voice), and emails from EasyKind Health LLC and its licensed agents at the number and email provided, for marketing purposes including quotes and plan information. Consent is not a condition of purchase. Message and data rates may apply. You may revoke consent at any time by contacting us.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">How We Protect Your Information</h2>
          <p>
            We adopt appropriate data collection, storage, and processing practices along with security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information. Sensitive information such as Social Security numbers and Medicare IDs is encrypted using industry-standard AES-256 encryption.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">Sharing Your Information</h2>
          <p>
            We do not sell, trade, or rent your personal information to others. We may share your information with:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Licensed insurance agents and carriers to process your quote or enrollment</li>
            <li>Third-party service providers who help us operate our business (e.g., SMS verification, CRM systems)</li>
            <li>Advertising platforms in anonymized/hashed form for measurement purposes</li>
          </ul>
          <p>
            We may share generic aggregated demographic information not linked to any personal identification information with business partners for the purposes outlined above.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">Third-Party Websites</h2>
          <p>
            Our Site may contain links to third-party websites. We do not control the content or privacy practices of those sites and are not responsible for their practices. We encourage you to review the privacy policies of any third-party site you visit.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal information by contacting us. If you wish to stop receiving communications, you may opt out at any time by replying STOP to any text message or contacting us directly.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy at any time. When we do, we will revise the &quot;Last updated&quot; date at the top of this page. Your continued use of the Site following any changes constitutes your acceptance of the updated policy.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            EasyKind Health LLC<br />
            Email: help@easykindmedicare.com<br />
            Phone: (855) 559-1700
          </p>

          <div className="mt-10 pt-6 border-t text-xs text-muted-foreground">
            <p>
              We are not connected with or endorsed by the United States government or the federal Medicare program. We do not offer every plan available in your area. Any information we provide is limited to those plans we offer in your area. Please contact Medicare.gov or 1-800-MEDICARE for information on all your options.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
