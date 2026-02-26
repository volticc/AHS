import Link from 'next/link';

// Placeholder components for homepage sections
const HeroSection = () => (
  <div className="min-h-screen flex flex-col justify-center items-center text-center bg-base">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
    <div className="relative z-10">
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-primary animate-fade-in-down">AFTER HOURS STUDIOS</h1>
      <p className="mt-4 text-lg md:text-xl text-secondary max-w-2xl mx-auto animate-fade-in-up">Crafting immersive worlds, one line of code at a time.</p>
      <div className="mt-8 space-x-4">
        <Link href="/projects" className="px-8 py-3 bg-accent-red text-white font-semibold rounded-lg hover:bg-accent-red/80 transition-transform hover:scale-105">
          Our Projects
        </Link>
        <Link href="/community" className="px-8 py-3 bg-gray-700/50 text-primary font-semibold rounded-lg hover:bg-gray-600/50 transition-transform hover:scale-105">
          Join Us
        </Link>
      </div>
    </div>
  </div>
);

const MissionSection = () => (
  <div className="py-24 bg-base">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h2 className="text-4xl font-bold text-primary">Our Mission</h2>
      <div className="mt-12 grid md:grid-cols-3 gap-12">
        <div className="p-8 bg-gray-800/20 rounded-lg">
          <h3 className="text-2xl font-bold text-accent-red">Innovation</h3>
          <p className="mt-4 text-secondary">Pushing the boundaries of interactive storytelling and gameplay mechanics.</p>
        </div>
        <div className="p-8 bg-gray-800/20 rounded-lg">
          <h3 className="text-2xl font-bold text-accent-red">Community</h3>
          <p className="mt-4 text-secondary">Building a passionate community that shapes the worlds we create.</p>
        </div>
        <div className="p-8 bg-gray-800/20 rounded-lg">
          <h3 className="text-2xl font-bold text-accent-red">Quality</h3>
          <p className="mt-4 text-secondary">Delivering polished, memorable experiences that respect our players' time.</p>
        </div>
      </div>
    </div>
  </div>
);

const FeaturedProjectSection = () => (
  <div className="py-24 bg-gray-900/50">
    {/* Content will be fetched from CMS */}
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h2 className="text-4xl font-bold text-primary">Featured Project</h2>
      <p className="mt-4 text-secondary">[Project Title Here]</p>
    </div>
  </div>
);

const DevLogPreview = () => (
  <div className="py-24 bg-base">
    {/* Content will be fetched from CMS */}
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h2 className="text-4xl font-bold text-primary">Latest Dev Logs</h2>
    </div>
  </div>
);

const CallToActionSection = () => (
  <div className="py-24 bg-accent-red/80 text-center">
    <h2 className="text-4xl font-bold text-white">Join the Studio</h2>
    <p className="mt-4 text-lg text-white/80">Become part of our journey and get exclusive updates.</p>
    <div className="mt-8">
      <Link href="/register" className="px-8 py-4 bg-white text-accent-red font-bold rounded-lg hover:bg-gray-200">
        Create Account
      </Link>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-gray-900 text-secondary py-12">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <p>&copy; {new Date().getFullYear()} After Hours Studios. All Rights Reserved.</p>
      <div className="mt-4 space-x-6">
        <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
        <Link href="/contact" className="hover:text-primary">Contact</Link>
      </div>
    </div>
  </footer>
);

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <MissionSection />
      <FeaturedProjectSection />
      <DevLogPreview />
      <CallToActionSection />
      <Footer />
    </main>
  );
}
