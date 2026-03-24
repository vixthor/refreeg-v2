import { H2, P } from "../typograpy";
import { listCauses } from "@/actions";
import AnimatedHeader from "@/components/home/components/AnimatedHeader";
import UrgentCausesCarousel from "./UrgentCausesCarousel";

export async function UrgentCauses() {
  const allCauses = await listCauses();

  const now = new Date();

  const urgentCauses = allCauses.filter((cause) => {
    const createdAt = new Date(cause.created_at);

    const hoursSinceCreated =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    const percentageRaised =
      cause.goal > 0 ? (cause.raised / cause.goal) * 100 : 0;

    return hoursSinceCreated <= 24 && percentageRaised >= 1;
  });

  const normalCauses = allCauses.filter(
    (cause) => !urgentCauses.includes(cause)
  );

  const combinedCauses = [...urgentCauses, ...normalCauses];

  if (combinedCauses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10 relative py-12">
      <div className="flex items-start justify-between w-full relative">
        <AnimatedHeader className="flex-1">
          <H2 className="text-black text-4xl font-bold font-['Montserrat'] leading-[48px] mb-2">
            Urgent Causes
          </H2>

          <P className="text-lg text-gray-500">
            Support critical causes that are gaining rapid momentum in their
            first hours. Your timely action can make the biggest difference
          </P>
        </AnimatedHeader>
      </div>

      <UrgentCausesCarousel causes={combinedCauses} />
    </div>
  );
}