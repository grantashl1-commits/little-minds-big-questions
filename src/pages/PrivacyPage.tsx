import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingBubbles from "@/components/FloatingBubbles";
import { Mail } from "lucide-react";

const sections = [
  {
    title: "Introduction",
    content: (
      <>
        <p>Little Minds BIG Questions respects your privacy and is committed to protecting the personal information of parents, caregivers, and visitors who use this website.</p>
        <p>This Privacy Policy explains what information we collect, how we use it, and the choices you have when using the platform.</p>
      </>
    ),
  },
  {
    title: "Information You Provide",
    content: (
      <>
        <p>When using Little Minds BIG Questions, you may choose to submit:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>a child's question</li>
          <li>the child's first name</li>
          <li>the child's age</li>
          <li>optional context provided by the parent or caregiver</li>
        </ul>
        <p>This information helps generate metaphor-based responses designed to help explain complex ideas to children.</p>
        <p>Providing this information is completely voluntary.</p>
      </>
    ),
  },
  {
    title: "Automatically Collected Information",
    content: (
      <>
        <p>When you visit the website, certain technical information may automatically be collected, including:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>browser type</li>
          <li>device type</li>
          <li>IP address</li>
          <li>pages visited</li>
          <li>time spent on pages</li>
        </ul>
        <p>This data is used to improve the performance and usability of the website.</p>
      </>
    ),
  },
  {
    title: "How We Use Information",
    content: (
      <>
        <p>Information collected may be used to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>generate metaphor-based responses to submitted questions</li>
          <li>improve the accuracy and quality of AI responses</li>
          <li>analyse trends in the types of questions children ask</li>
          <li>improve website functionality and user experience</li>
        </ul>
        <p>If a user chooses to make their submission public, the question and generated story may appear in the website's searchable library.</p>
        <p>Personal details such as email addresses are not attached to public stories.</p>
      </>
    ),
  },
  {
    title: "Public Question Library",
    content: (
      <>
        <p>Users may have the option to allow their submitted question and story to appear in the public question library.</p>
        <p>If selected, the following information may be displayed:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>the question asked</li>
          <li>the child's first name (if provided)</li>
          <li>the child's age</li>
          <li>the generated metaphor response</li>
        </ul>
        <p>Parents should avoid including identifying information beyond the child's first name.</p>
      </>
    ),
  },
  {
    title: "Children's Privacy",
    content: (
      <>
        <p>Little Minds BIG Questions is designed to help parents explain concepts to children, but the platform is intended for use by parents or guardians, not for direct use by children under 13.</p>
        <p>We do not knowingly collect personal information from children.</p>
      </>
    ),
  },
  {
    title: "AI Generated Content",
    content: (
      <>
        <p>Responses on this website are generated using artificial intelligence and are intended to provide supportive storytelling tools for parents.</p>
        <p className="italic text-muted-foreground">These responses should not be considered medical, psychological, or professional advice.</p>
      </>
    ),
  },
  {
    title: "Data Security",
    content: (
      <>
        <p>We take reasonable steps to protect the information submitted to the platform.</p>
        <p>However, no internet transmission or storage system can be guaranteed to be completely secure.</p>
      </>
    ),
  },
  {
    title: "Third-Party Services",
    content: (
      <>
        <p>The website may use third-party services to operate certain features, including:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>AI generation tools</li>
          <li>analytics tools</li>
          <li>hosting services</li>
        </ul>
        <p>These services may process limited data necessary for the operation of the platform.</p>
      </>
    ),
  },
  {
    title: "Your Choices",
    content: (
      <>
        <p>You may choose:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>whether to submit questions</li>
          <li>whether to make a submission public</li>
          <li>whether to provide optional information</li>
        </ul>
        <p>If you wish to request removal of a public question, you may contact us.</p>
      </>
    ),
  },
  {
    title: "Updates to This Policy",
    content: (
      <>
        <p>This Privacy Policy may be updated occasionally to reflect changes to the website or legal requirements.</p>
        <p>When updates occur, the revised version will be posted on this page.</p>
      </>
    ),
  },
];

const PrivacyPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-24 px-6 text-center">
        <FloatingBubbles count={8} />
        <div className="container max-w-3xl mx-auto relative z-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3 animate-fade-in-up">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            How we collect, use, and protect your information.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="pb-20 px-6">
        <div className="container max-w-2xl mx-auto space-y-6">
          {sections.map(({ title, content }) => (
            <div key={title} className="rounded-2xl bg-card border border-border p-6 md:p-8 space-y-4 text-foreground leading-relaxed">
              <h2 className="font-display text-xl md:text-2xl font-bold">{title}</h2>
              {content}
            </div>
          ))}

          {/* Contact */}
          <div className="rounded-2xl bg-card border border-border p-6 md:p-8 space-y-4 text-foreground leading-relaxed text-center">
            <h2 className="font-display text-xl md:text-2xl font-bold">Contact</h2>
            <p>If you have questions about this Privacy Policy or how information is handled, please contact:</p>
            <a
              href="mailto:hello@littlemindsbigquestions.com"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              <Mail className="h-4 w-4" />
              hello@littlemindsbigquestions.com
            </a>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center pt-4">
            Little Minds BIG Questions is a storytelling tool and is not a substitute for professional therapeutic, medical, or psychological advice.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
