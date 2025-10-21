import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function AuthTestimonials() {
  const testimonials = [
    {
      quote:
        "RefreeG is easily one of the most thoughtful platforms I’ve used. Everything feels intuitive, transparent, and built with real people in mind.",
      name: "JULIUS (Adeiza) ANGULU",
      designation: "CEO, RefreeG",
      src: "https://media.licdn.com/dms/image/v2/D4D03AQE_CIC7QAawiA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1690818964063?e=1762387200&v=beta&t=Q3uTkduTGCv73Oigzg0zfX5KjhnIucL6H_lWIqNRnq4",
    },
    {
      quote:
        "There’s something refreshing about RefreeG — it feels genuine. The design is clean, the experience smooth, and the mission inspiring.",
      name: "Fedjost Ayomide",
      designation: "Fullstack Developer",
      src: "https://media.licdn.com/dms/image/v2/D4D03AQHIv53UTUFm0w/profile-displayphoto-scale_400_400/B4DZjlTXZlH0Ag-/0/1756193719212?e=1762387200&v=beta&t=Nh7Sd6I6S2KGInHsXngUofdCfQ3RdmNPtMlPEKM2XUQ",
    },
    {
      quote:
        "RefreeG stands out for its clarity and trust. You instantly feel safe using it — no clutter, no confusion, just pure purpose.",
      name: "Chukwunomso Amadike-Unaogu",
      designation: "Frontend Developer – Next.js and React.js",
      src: "https://media.licdn.com/dms/image/v2/D4D03AQH5eEsB18RkxQ/profile-displayphoto-scale_400_400/B4DZhaQPSNHwAg-/0/1753860885281?e=1762387200&v=beta&t=pgcogVlKD_tqDP2yHoUsjkX3uX6-mhpwihbXUDAFUGs",
    },
    {
      quote:
        "Every detail of RefreeG feels intentional — from the onboarding to the dashboard. It’s the kind of platform you instantly trust.",
      name: "Quadri Hassan",
      designation: "Co-CPO",
      src: "https://media.licdn.com/dms/image/v2/D4E03AQFQ3nEf_YSkEQ/profile-displayphoto-scale_400_400/B4EZewV9DtHgAg-/0/1751010238030?e=1762387200&v=beta&t=8dmnHU4iYXwgx_Z-E7YeJ_GlcHdObZwq0lEsuY5uNW0",
    },
    {
      quote:
        "What sets RefreeG apart is the heart behind it. It’s more than a platform — it’s a movement built on trust, empathy, and innovation.",
      name: "Oghenetega (Victor) Gbiyede",
      designation: "Frontend Developer",
      src: "https://media.licdn.com/dms/image/v2/D4D03AQFCgVr4tFYzUA/profile-displayphoto-shrink_400_400/B4DZb9AS_LGgAk-/0/1748001436980?e=1762387200&v=beta&t=Vd-brAfT1Tl7gVKNEzDZBmTbF4XKAeqpr80cj9miTb0",
    },
  ];

  return <AnimatedTestimonials testimonials={testimonials} />;
}
