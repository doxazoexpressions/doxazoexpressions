import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Privacy Policy | Doxazo Expressions</title>
      <meta name="description" content="How Doxazo Expressions collects, uses, and protects your information." />
      <link rel="canonical" href="https://www.doxazoexpressions.com/privacy" />
    </Helmet>
    <Navbar />
    <main className="pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10 text-sm">Last updated: June 23, 2026</p>

        <div className="prose prose-lg max-w-none space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Overview</h2>
            <p>
              Doxazo Expressions ("we", "us") is a Christian devotional reading experience.
              This policy explains what information we collect, how it is used, and the
              choices you have. This page is maintained by Doxazo Expressions and is not
              a legal certification or audit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Information we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account data</strong> (optional): email address when you create an account to save favorites across devices.</li>
              <li><strong>Favorites</strong>: devotionals you save. Anonymous favorites are stored locally on your device.</li>
              <li><strong>Push subscription</strong> (optional): when you enable morning notifications, your browser's push endpoint is stored so we can send you the day's devotional.</li>
              <li><strong>Messages you send</strong>: anything you submit through the Contact form.</li>
              <li><strong>Basic technical data</strong>: standard request logs (IP, user agent) used to operate and secure the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">How we use information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To deliver devotional content and your saved favorites.</li>
              <li>To send the morning notification when you have opted in.</li>
              <li>To respond to messages you send through Contact.</li>
              <li>To keep the service secure and reliable.</li>
            </ul>
            <p className="mt-3">We do not sell your personal information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Notifications</h2>
            <p>
              Morning notifications are opt-in. You can turn them off at any time from
              the <a href="/settings" className="text-accent underline">Settings</a> page,
              which removes your push subscription from our records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Offline cache</h2>
            <p>
              For a reliable reading experience, the app stores today's devotional and
              a small number of recent entries locally on your device. You can clear
              this at any time by clearing your browser's site data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Subprocessors</h2>
            <p>
              The site is delivered through Lovable Cloud (managed Supabase) for
              database, authentication, file storage, and serverless functions. Web
              push delivery is performed by the standard browser push services
              (e.g., FCM, Mozilla autopush, Apple push).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Your choices</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Disable notifications from <a href="/settings" className="text-accent underline">Settings</a>.</li>
              <li>Clear local favorites and cache from your browser settings.</li>
              <li>Request deletion of your account and associated data by emailing us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Children</h2>
            <p>The service is intended for a general audience and is not directed at children under 13.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Contact</h2>
            <p>
              Questions or privacy requests:{" "}
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

export default Privacy;
