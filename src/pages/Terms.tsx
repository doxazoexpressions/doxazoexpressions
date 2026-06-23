import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Terms of Use | Doxazo Expressions</title>
      <meta name="description" content="The terms that govern your use of Doxazo Expressions." />
      <link rel="canonical" href="https://www.doxazoexpressions.com/terms" />
    </Helmet>
    <Navbar />
    <main className="pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Terms of Use</h1>
        <p className="text-muted-foreground mb-10 text-sm">Last updated: June 23, 2026</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Acceptance</h2>
            <p>
              By accessing Doxazo Expressions you agree to these terms. If you do not
              agree, please discontinue use of the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Content & purpose</h2>
            <p>
              Devotional content is provided for personal spiritual encouragement and
              reflection. It is not a substitute for pastoral counsel, professional
              advice, or medical care.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Acceptable use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Do not attempt to disrupt, overload, or reverse engineer the service.</li>
              <li>Do not republish substantial portions of the devotionals commercially without permission.</li>
              <li>Personal sharing of individual devotionals via the built-in share button is encouraged.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Accounts</h2>
            <p>
              You are responsible for activity under your account and for keeping your
              credentials confidential.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Intellectual property</h2>
            <p>
              Original devotional writing, branding, and design are the property of
              Doxazo Expressions. Scripture quotations belong to their respective
              translations and are used in accordance with their permitted use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Disclaimer</h2>
            <p>
              The service is provided on an "as is" basis without warranties of any
              kind. To the maximum extent permitted by law, we are not liable for any
              indirect or consequential damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Changes</h2>
            <p>
              We may update these terms from time to time. Continued use after changes
              are posted constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Contact</h2>
            <p>
              Questions about these terms:{" "}
              <a href="mailto:doxazoexpressions@gmail.com" className="text-accent underline">
                doxazoexpressions@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
