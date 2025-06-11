import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Briefcase, Users, FileText, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">{APP_NAME}</span>
          </Link>
          <nav className="space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                    Streamline Your Legal Practice with {APP_NAME}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Efficiently manage cases, track hearings, collaborate with clients, and generate reports with our AI-powered platform.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/signup">Get Started for Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">Login to Your Account</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/600x600.png"
                width="600"
                height="600"
                alt="Hero"
                className="mx-auto overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-lg"
                data-ai-hint="legal justice"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-accent/20 px-3 py-1 text-sm text-accent-foreground font-semibold">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need for Modern Case Management</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {APP_NAME} provides a comprehensive suite of tools designed for advocates, clients, and administrators.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <FeatureCard
                icon={<Briefcase className="h-8 w-8 text-primary" />}
                title="Comprehensive Case Management"
                description="Track every detail, from initial client contact to case closure. Manage documents, notes, and hearing schedules all in one place."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Role-Based Access"
                description="Tailored dashboards and permissions for Advocates, Clients, and SuperAdmins, ensuring secure and relevant information access."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8 text-primary" />}
                title="AI-Powered Summaries"
                description="Leverage AI to generate concise summaries of lengthy case notes, saving you time and highlighting crucial information."
              />
              <FeatureCard
                icon={<FileText className="h-8 w-8 text-primary" />}
                title="Hearing Report Generator"
                description="Quickly generate printable PDF reports for daily hearings, keeping you organized and prepared."
              />
              <FeatureCard
                icon={<CheckCircle className="h-8 w-8 text-primary" />}
                title="Secure Document Handling"
                description="Upload, organize, and securely share case-related documents with version control and access logs."
              />
               <FeatureCard
                icon={<Briefcase className="h-8 w-8 text-primary" />}
                title="Client Collaboration"
                description="Enable clients to view case progress and relevant documents, fostering transparency and communication."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {APP_NAME}. All Rights Reserved. Powered by MountainsDriven Technologies Pvt.Ltd.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="h-full_">
      <CardHeader>
        <div className="mb-3_ flex items-center_ justify-center_ bg-primary/10 rounded-full p-3 w-fit-content_">
         {icon}
        </div>
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
