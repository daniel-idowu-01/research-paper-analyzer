import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  const tocItems = [
    { id: "introduction", title: "Introduction" },
    { id: "information-collection", title: "Information We Collect" },
    { id: "information-use", title: "How We Use Your Information" },
    { id: "information-sharing", title: "Information Sharing and Disclosure" },
    { id: "data-security", title: "Data Security" },
    { id: "user-rights", title: "Your Rights and Choices" },
    { id: "cookies", title: "Cookies and Tracking Technologies" },
    { id: "policy-changes", title: "Changes to This Privacy Policy" },
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <div className="container p-10 pl-5">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        {/* Table of Contents - Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle>Contents</CardTitle>
              <CardDescription>Navigate the privacy policy</CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`#${item.id}`}
                    className="block py-1 text-sm hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Research Analyzer Privacy Policy
              </CardTitle>
              <CardDescription>Last Updated: May 9, 2023</CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <section id="introduction" className="scroll-mt-20">
                <h2 className="text-xl font-bold">1. Introduction</h2>
                <p>
                  Welcome to Research Analyzer. We respect your privacy and are
                  committed to protecting your personal data. This privacy
                  policy will inform you about how we look after your personal
                  data when you visit our website and tell you about your
                  privacy rights and how the law protects you.
                </p>
                <p>
                  This privacy policy applies to all users of Research Analyzer,
                  including those who upload research papers, use our AI
                  analysis tools, or simply browse our website. Please read this
                  privacy policy carefully to understand our practices regarding
                  your personal data.
                </p>
              </section>

              <section
                id="information-collection"
                className="scroll-mt-20 mt-8"
              >
                <h2 className="text-xl font-bold">2. Information We Collect</h2>
                <p>
                  We collect several types of information from and about users
                  of our website, including:
                </p>
                <ul>
                  <li>
                    <strong>Personal Information:</strong> This includes your
                    name, email address, institution, and professional position
                    when you register for an account.
                  </li>
                  <li>
                    <strong>Research Papers:</strong> The research papers and
                    documents you upload to our platform for analysis.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use
                    our website, services, and features, including your search
                    queries, papers viewed, and analysis results.
                  </li>
                  <li>
                    <strong>Technical Data:</strong> Internet protocol (IP)
                    address, browser type and version, time zone setting,
                    browser plug-in types and versions, operating system and
                    platform, and other technology on the devices you use to
                    access our website.
                  </li>
                </ul>
              </section>

              <section id="information-use" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">
                  3. How We Use Your Information
                </h2>
                <p>
                  We use the information we collect for various purposes,
                  including to:
                </p>
                <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and analyze the research papers you upload</li>
                  <li>
                    Generate AI-powered summaries, insights, and topic
                    classifications
                  </li>
                  <li>
                    Personalize your experience and provide content
                    recommendations
                  </li>
                  <li>
                    Communicate with you about our services, updates, and
                    security alerts
                  </li>
                  <li>
                    Monitor and analyze trends, usage, and activities in
                    connection with our services
                  </li>
                  <li>
                    Detect, prevent, and address technical issues and security
                    breaches
                  </li>
                  <li>
                    Comply with legal obligations and enforce our terms of
                    service
                  </li>
                </ul>
              </section>

              <section id="information-sharing" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">
                  4. Information Sharing and Disclosure
                </h2>
                <p>
                  We may share your information in the following situations:
                </p>
                <ul>
                  <li>
                    <strong>With Service Providers:</strong> We may share your
                    information with third-party vendors, service providers, and
                    other partners who help us provide our services (e.g., cloud
                    storage providers, payment processors).
                  </li>
                  <li>
                    <strong>For Legal Reasons:</strong> We may share information
                    if we believe it's necessary to comply with applicable laws,
                    regulations, legal processes, or governmental requests.
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> We may share information
                    with third parties when you give us explicit consent to do
                    so.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a
                    merger, acquisition, reorganization, or sale of assets, your
                    information may be transferred as part of the transaction.
                  </li>
                </ul>
                <p>
                  We do not sell your personal information or research papers to
                  third parties for marketing purposes.
                </p>
              </section>

              <section id="data-security" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your personal information from unauthorized access,
                  disclosure, alteration, or destruction. These measures
                  include:
                </p>
                <ul>
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>
                    Regular security assessments and vulnerability testing
                  </li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure data storage and backup procedures</li>
                </ul>
                <p>
                  However, no method of transmission over the Internet or
                  electronic storage is 100% secure. While we strive to use
                  commercially acceptable means to protect your personal
                  information, we cannot guarantee its absolute security.
                </p>
              </section>

              <section id="user-rights" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">
                  6. Your Rights and Choices
                </h2>
                <p>
                  Depending on your location, you may have certain rights
                  regarding your personal information:
                </p>
                <ul>
                  <li>
                    <strong>Access:</strong> You can request access to the
                    personal information we hold about you.
                  </li>
                  <li>
                    <strong>Correction:</strong> You can request that we correct
                    inaccurate or incomplete information.
                  </li>
                  <li>
                    <strong>Deletion:</strong> You can request that we delete
                    your personal information in certain circumstances.
                  </li>
                  <li>
                    <strong>Restriction:</strong> You can request that we
                    restrict the processing of your information.
                  </li>
                  <li>
                    <strong>Data Portability:</strong> You can request a copy of
                    your personal information in a structured, commonly used,
                    machine-readable format.
                  </li>
                  <li>
                    <strong>Objection:</strong> You can object to our processing
                    of your personal information in certain circumstances.
                  </li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the
                  information provided in the "Contact Us" section.
                </p>
              </section>

              <section id="cookies" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">
                  7. Cookies and Tracking Technologies
                </h2>
                <p>
                  We use cookies and similar tracking technologies to track
                  activity on our website and hold certain information. Cookies
                  are files with a small amount of data that may include an
                  anonymous unique identifier.
                </p>
                <p>We use cookies for the following purposes:</p>
                <ul>
                  <li>To maintain your session and authentication status</li>
                  <li>To remember your preferences and settings</li>
                  <li>To analyze how you use our website and services</li>
                  <li>
                    To improve our website and provide a better user experience
                  </li>
                </ul>
                <p>
                  You can instruct your browser to refuse all cookies or to
                  indicate when a cookie is being sent. However, if you do not
                  accept cookies, you may not be able to use some portions of
                  our service.
                </p>
              </section>

              <section id="policy-changes" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">
                  8. Changes to This Privacy Policy
                </h2>
                <p>
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last Updated" date at the top of
                  this Privacy Policy.
                </p>
                <p>
                  You are advised to review this Privacy Policy periodically for
                  any changes. Changes to this Privacy Policy are effective when
                  they are posted on this page.
                </p>
              </section>

              <section id="contact" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">9. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please
                  contact us at{" "}
                  <a
                    href="mailto:danielidowu414@gmail.com"
                    className="text-primary hover:underline"
                  >
                    privacy@researchanalyzer.com
                  </a>
                  .
                </p>
                {/* <p>Or write to us at:</p>
                <address className="not-italic">
                  Research Analyzer, Inc.
                  <br />
                  123 Analysis Street
                  <br />
                  San Francisco, CA 94103
                  <br />
                  United States
                </address> */}
              </section>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/terms-of-service">Terms of Service</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
