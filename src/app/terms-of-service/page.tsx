import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TermsOfServicePage() {
  const tocItems = [
    { id: "acceptance", title: "Acceptance of Terms" },
    { id: "accounts", title: "User Accounts" },
    { id: "intellectual-property", title: "Intellectual Property Rights" },
    { id: "acceptable-use", title: "Acceptable Use Policy" },
    { id: "user-content", title: "User Content" },
    { id: "third-party", title: "Third-Party Links" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "termination", title: "Termination" },
    { id: "governing-law", title: "Governing Law" },
    { id: "changes", title: "Changes to Terms" },
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
          <Scale className="w-5 h-5 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Terms of Service</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        {/* Table of Contents - Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle>Contents</CardTitle>
              <CardDescription>Navigate the terms of service</CardDescription>
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
                Research Analyzer Terms of Service
              </CardTitle>
              <CardDescription>Last Updated: May 9, 2023</CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Please read these Terms of Service ("Terms", "Terms of Service")
                carefully before using the Research Analyzer website and service
                operated by Research Analyzer, Inc. ("us", "we", "our").
              </p>

              <section id="acceptance" className="scroll-mt-20">
                <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using our Service, you agree to be bound by
                  these Terms. If you disagree with any part of the terms, then
                  you may not access the Service.
                </p>
                <p>
                  These Terms apply to all visitors, users, and others who
                  access or use the Service. By accessing or using the Service,
                  you agree to be bound by these Terms. If you are using the
                  Services on behalf of an organization, you are agreeing to
                  these Terms on behalf of that organization.
                </p>
              </section>

              <section id="accounts" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">2. User Accounts</h2>
                <p>
                  When you create an account with us, you must provide accurate,
                  complete, and up-to-date information. Failure to do so
                  constitutes a breach of the Terms, which may result in
                  immediate termination of your account on our Service.
                </p>
                <p>
                  You are responsible for safeguarding the password that you use
                  to access the Service and for any activities or actions under
                  your password. You agree not to disclose your password to any
                  third party. You must notify us immediately upon becoming
                  aware of any breach of security or unauthorized use of your
                  account.
                </p>
                <p>
                  You may not use as a username the name of another person or
                  entity that is not lawfully available for use, or a name or
                  trademark that is subject to any rights of another person or
                  entity without appropriate authorization.
                </p>
              </section>

              <section id="intellectual-property" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">
                  3. Intellectual Property Rights
                </h2>
                <p>
                  The Service and its original content, features, and
                  functionality are and will remain the exclusive property of
                  Research Analyzer, Inc. and its licensors. The Service is
                  protected by copyright, trademark, and other laws of both the
                  United States and foreign countries. Our trademarks and trade
                  dress may not be used in connection with any product or
                  service without the prior written consent of Research
                  Analyzer, Inc.
                </p>
                <p>
                  You retain ownership of any intellectual property rights that
                  you hold in the content you upload to the Service. By
                  uploading content to the Service, you grant us a worldwide,
                  non-exclusive, royalty-free license (with the right to
                  sublicense) to use, copy, reproduce, process, adapt, modify,
                  publish, transmit, display, and distribute such content in any
                  and all media or distribution methods now known or later
                  developed, solely for the purpose of providing and improving
                  the Service.
                </p>
              </section>

              <section id="acceptable-use" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">4. Acceptable Use Policy</h2>
                <p>You agree not to use the Service to:</p>
                <ul>
                  <li>
                    Violate any applicable laws, regulations, or third-party
                    rights, including intellectual property and privacy rights
                  </li>
                  <li>
                    Upload, transmit, or distribute any content that is illegal,
                    harmful, threatening, abusive, harassing, defamatory,
                    vulgar, obscene, or otherwise objectionable
                  </li>
                  <li>
                    Impersonate any person or entity, or falsely state or
                    otherwise misrepresent your affiliation with a person or
                    entity
                  </li>
                  <li>
                    Interfere with or disrupt the Service or servers or networks
                    connected to the Service, or disobey any requirements,
                    procedures, policies, or regulations of networks connected
                    to the Service
                  </li>
                  <li>
                    Attempt to gain unauthorized access to any portion of the
                    Service or any other accounts, computer systems, or networks
                    connected to the Service
                  </li>
                  <li>
                    Use the Service for any purpose that is fraudulent, illegal,
                    or unauthorized, or engage in, encourage or promote any
                    activity that violates these Terms
                  </li>
                  <li>
                    Use the Service to upload, transmit, or distribute any
                    computer viruses, worms, or any software intended to damage
                    or alter a computer system or data
                  </li>
                  <li>
                    Harvest, collect, gather or assemble information or data
                    regarding other users without their consent
                  </li>
                </ul>
              </section>

              <section id="user-content" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">5. User Content</h2>
                <p>
                  Our Service allows you to upload, store, and analyze research
                  papers and other content. You are responsible for the content
                  that you upload to the Service, including its legality,
                  reliability, and appropriateness.
                </p>
                <p>
                  By uploading content to the Service, you represent and warrant
                  that you have the right to upload such content and that the
                  content does not violate any third-party rights, including
                  intellectual property rights and privacy rights.
                </p>
                <p>
                  We reserve the right to remove any content that violates these
                  Terms or that we determine, in our sole discretion, is
                  otherwise objectionable or inappropriate.
                </p>
              </section>

              <section id="third-party" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">6. Third-Party Links</h2>
                <p>
                  Our Service may contain links to third-party websites or
                  services that are not owned or controlled by Research
                  Analyzer, Inc.
                </p>
                <p>
                  Research Analyzer, Inc. has no control over, and assumes no
                  responsibility for, the content, privacy policies, or
                  practices of any third-party websites or services. You further
                  acknowledge and agree that Research Analyzer, Inc. shall not
                  be responsible or liable, directly or indirectly, for any
                  damage or loss caused or alleged to be caused by or in
                  connection with the use of or reliance on any such content,
                  goods, or services available on or through any such websites
                  or services.
                </p>
                <p>
                  We strongly advise you to read the terms and conditions and
                  privacy policies of any third-party websites or services that
                  you visit.
                </p>
              </section>

              <section id="liability" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">
                  7. Limitation of Liability
                </h2>
                <p>
                  In no event shall Research Analyzer, Inc., nor its directors,
                  employees, partners, agents, suppliers, or affiliates, be
                  liable for any indirect, incidental, special, consequential,
                  or punitive damages, including without limitation, loss of
                  profits, data, use, goodwill, or other intangible losses,
                  resulting from:
                </p>
                <ul>
                  <li>
                    Your access to or use of or inability to access or use the
                    Service
                  </li>
                  <li>
                    Any conduct or content of any third party on the Service
                  </li>
                  <li>
                    Any content obtained from the Service, including the
                    accuracy or reliability of any AI-generated analysis,
                    summaries, or classifications
                  </li>
                  <li>
                    Unauthorized access, use, or alteration of your
                    transmissions or content
                  </li>
                </ul>
                <p>
                  The Service is provided on an "AS IS" and "AS AVAILABLE"
                  basis. The Service is provided without warranties of any kind,
                  whether express or implied, including, but not limited to,
                  implied warranties of merchantability, fitness for a
                  particular purpose, non-infringement, or course of
                  performance.
                </p>
              </section>

              <section id="termination" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">8. Termination</h2>
                <p>
                  We may terminate or suspend your account immediately, without
                  prior notice or liability, for any reason whatsoever,
                  including without limitation if you breach the Terms.
                </p>
                <p>
                  Upon termination, your right to use the Service will
                  immediately cease. If you wish to terminate your account, you
                  may simply discontinue using the Service or delete your
                  account through the account settings.
                </p>
                <p>
                  All provisions of the Terms which by their nature should
                  survive termination shall survive termination, including,
                  without limitation, ownership provisions, warranty
                  disclaimers, indemnity, and limitations of liability.
                </p>
              </section>

              <section id="governing-law" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">9. Governing Law</h2>
                <p>
                  These Terms shall be governed and construed in accordance with
                  the laws of the State of California, United States, without
                  regard to its conflict of law provisions.
                </p>
                <p>
                  Our failure to enforce any right or provision of these Terms
                  will not be considered a waiver of those rights. If any
                  provision of these Terms is held to be invalid or
                  unenforceable by a court, the remaining provisions of these
                  Terms will remain in effect.
                </p>
              </section>

              <section id="changes" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">10. Changes to Terms</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will try to provide at least 30 days' notice prior to any new
                  terms taking effect. What constitutes a material change will
                  be determined at our sole discretion.
                </p>
                <p>
                  By continuing to access or use our Service after those
                  revisions become effective, you agree to be bound by the
                  revised terms. If you do not agree to the new terms, please
                  stop using the Service.
                </p>
              </section>

              <section id="contact" className="scroll-mt-20 mt-8">
                <h2 className="text-xl font-bold">11. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us
                  at{" "}
                  <a
                    href="mailto:danielidowu414@gmail.com"
                    className="text-primary hover:underline"
                  >
                    legal@researchanalyzer.com
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
              <Link href="/privacy-policy">Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
