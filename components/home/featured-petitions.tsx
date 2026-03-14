import { H2, P } from "../typograpy";
import AnimatedHeader from "@/components/home/components/AnimatedHeader";
import FeaturedPetitionsCarousel from "./FeaturedPetitionsCarousel";

import { listPetitions } from "@/actions";
import { listSignaturesForPetition } from "@/actions/signature-actions";

export async function FeaturedPetitions() {
  const featuredPetitions = (await listPetitions()).filter(
    (p) => (p.days_active ?? 0) > 0 && p.status !== ("expired" as any)
  );

  const petitionsWithSigners = await Promise.all(
    featuredPetitions.map(async (petition) => {
      const signers = await listSignaturesForPetition(petition.id);

      const signerCount = signers?.length || 0;

      const totalAmount = signers.reduce(
        (sum, s) => sum + (s.amount || 0),
        0
      );

      const percentRaised = Math.min(
        Math.round((totalAmount / petition.goal) * 100),
        100
      );

      return {
        ...petition,
        signers,
        signerCount,
        totalAmount,
        percentRaised,
      };
    })
  );

  if (!petitionsWithSigners || petitionsWithSigners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10 relative py-12">
      <div className="flex items-start justify-between w-full relative">
        <AnimatedHeader className="flex-1">
          <H2 className="text-black text-4xl font-bold font-['Montserrat'] leading-[48px] mb-2">
            Featured Petitions
          </H2>

          <P className="text-lg text-gray-500">
            Explore petitions raising awareness and gathering support.
          </P>
        </AnimatedHeader>
      </div>

      <FeaturedPetitionsCarousel petitions={petitionsWithSigners} />
    </div>
  );
}