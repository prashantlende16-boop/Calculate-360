import { Layout } from "@/components/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-8 text-foreground" data-testid="text-privacy-title">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 9, 2026</p>

        <div className="space-y-8 text-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Calculate 360 ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website at calculate360.com (the "Site").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-3">We may collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong className="text-foreground">Usage Data:</strong> Information about how you interact with our Site, including pages visited, time spent, browser type, device type, and referring URLs.</li>
              <li><strong className="text-foreground">Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to enhance your experience and gather analytics data.</li>
              <li><strong className="text-foreground">Feedback Data:</strong> If you voluntarily submit feedback through our feedback form, we collect the message content you provide.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              We do not collect personal information such as your name, email address, or phone number unless you voluntarily provide it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Operate, maintain, and improve our Site</li>
              <li>Analyze usage trends and user behavior</li>
              <li>Serve relevant advertisements</li>
              <li>Respond to feedback and support requests</li>
              <li>Ensure the security of our Site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Google Analytics</h2>
            <p className="text-muted-foreground">
              We use Google Analytics to collect and analyze usage data. Google Analytics uses cookies to track user interactions. The data collected is processed in aggregate and does not personally identify you. You can opt out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Analytics Opt-out Browser Add-on</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Google AdSense</h2>
            <p className="text-muted-foreground">
              We use Google AdSense to display advertisements on our Site. Google AdSense may use cookies and web beacons to serve ads based on your prior visits to our Site and other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your browsing activity. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Ads Settings</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
            <p className="text-muted-foreground mb-3">
              Cookies are small text files stored on your device. We use cookies for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li><strong className="text-foreground">Essential Cookies:</strong> Required for the basic functionality of the Site.</li>
              <li><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how visitors interact with our Site.</li>
              <li><strong className="text-foreground">Advertising Cookies:</strong> Used by Google AdSense to serve relevant ads.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              You can control cookies through your browser settings. Disabling cookies may affect the functionality of the Site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Third-Party Services</h2>
            <p className="text-muted-foreground mb-3">
              Our Site may use the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Google Analytics (analytics and tracking)</li>
              <li>Google AdSense (advertising)</li>
              <li>ExchangeRate-API (currency conversion data)</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              These services have their own privacy policies governing their use of your data. We encourage you to review their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Data Security</h2>
            <p className="text-muted-foreground">
              We implement reasonable security measures to protect the information we collect. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our Site is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can take appropriate action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Your Rights</h2>
            <p className="text-muted-foreground mb-3">
              Depending on your location, you may have certain rights regarding your data, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>The right to access the data we hold about you</li>
              <li>The right to request deletion of your data</li>
              <li>The right to opt out of data collection and personalized advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions or concerns about this Privacy Policy, please reach out to us through the feedback form on our Site.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
