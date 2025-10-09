import ComingSoonPage from "../ComingSoonPage";

const pageConfig: Record<string, any> = {
  businesses: {
    emoji: "🌍",
    pageTitle: "RefreeG for Businesses",
    pageDescription:
      "Empower your brand with purpose. Launch business campaigns, support community-driven causes, and connect with customers who care about impact.",
  },
  "disaster-relief": {
    emoji: "🌪️",
    pageTitle: "RefreeG for Disaster Relief",
    pageDescription:
      "Rally urgent support for communities hit by disasters and get aid to those who need it; quickly and securely.",
  },
  creators: {
    emoji: "🎨",
    pageTitle: "RefreeG for Creators",
    pageDescription:
      "Turn your influence into impact. Get your unique tag, share your story, and receive donations directly from your fans in fiat or crypto.",
  },
  healthcare: {
    emoji: "🏥",
    pageTitle: "RefreeG for Healthcare",
    pageDescription:
      "Give hope a platform. Raise funds for medical bills, healthcare projects, or critical treatments with transparency and community support.",
  },
};

interface PageProps {
  params: {
    slug?: string[];
  };
}

export default function DynamicComingSoon({ params }: PageProps) {
  const slug = params.slug?.[0] || "default";

  const config = pageConfig[slug] || {
    emoji: "🚀",
    pageTitle: "This Feature",
    pageDescription: "We're working hard to bring you something amazing.",
  };

  return <ComingSoonPage {...config} />;
}

// Generate static params for better performance
export async function generateStaticParams() {
  return Object.keys(pageConfig).map((slug) => ({
    slug: [slug],
  }));
}
