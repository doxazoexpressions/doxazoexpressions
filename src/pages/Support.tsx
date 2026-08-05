import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  {
    q: "How do I sign in?",
    a: (
      <>
        Open the app and tap the <strong>Sign In</strong> button on the top right. You can use
        email + password or Sign in with Apple.
      </>
    ),
  },
  {
    q: "What if I forgot my password?",
    a: (
      <>
        On the sign-in page, tap <strong>Forgot password</strong> and enter your email. We'll send
        you a reset link.
      </>
    ),
  },
  {
    q: "How do I delete my account?",
    a: (
      <>
        Open <strong>More → Settings → Account → Delete Account</strong>, type the word{" "}
        <code className="px-1 py-0.5 rounded bg-secondary text-foreground text-sm">DELETE</code> to
        confirm, and tap <strong>Delete</strong>. We delete your account and associated data
        immediately, and a Sign in with Apple user also has their Apple token revoked server-side.
      </>
    ),
  },
  {
    q: "Where does the devotional content come from?",
    a: (
      <>
        Each devotional is original writing by the Doxazo team, anchored to a Scripture passage
        quoted from a public-domain translation. See the{" "}
        <Link to="/about" className="text-accent underline">
          About
        </Link>{" "}
        page for details.
      </>
    ),
  },
  {
    q: "Can I read offline?",
    a: (
      <>
        Yes. Today's devotional and your favorited entries are cached locally on your device, so you
        can read them without a connection.
      </>
    ),
  },
  {
    q: "Why am I not getting morning notifications?",
    a: (
      <>
        Make sure notifications are enabled under <strong>More → Settings → Notifications</strong>,
        and check your device's notification settings for the app.
      </>
    ),
  },
];

const Support = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Support | Doxazo Expressions</title>
      <meta
        name="description"
        content="Get help with Doxazo Expressions — contact the team and read answers to common questions about sign-in, notifications, offline reading, and account deletion."
      />
      <link rel="canonical" href="https://www.doxazoexpressions.com/support" />
    </Helmet>
    <Navbar />
    <main className="pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Support</h1>
        <p className="text-muted-foreground mb-10 text-sm">
          Need help with Doxazo Expressions? Below is how to reach us and answers to the most common
          questions.
        </p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Contact us</h2>
            <p>
              The fastest way to reach the team is email:{" "}
              <a
                href="mailto:doxazoexpressions@gmail.com"
                className="text-accent underline break-all"
              >
                doxazoexpressions@gmail.com
              </a>
            </p>
            <p className="mt-3">
              We answer support requests within a few business days. For account-specific issues
              (forgotten password, account deletion, sign-in trouble), include the email address
              tied to your Doxazo account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Frequently asked questions</h2>
            <ul className="space-y-4">
              {faqs.map((item) => (
                <li key={item.q}>
                  <h3 className="font-semibold text-foreground mb-1">{item.q}</h3>
                  <p>{item.a}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold mb-3">Privacy &amp; terms</h2>
            <p>
              Read our{" "}
              <Link to="/privacy" className="text-accent underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" className="text-accent underline">
                Terms of Service
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Support;
