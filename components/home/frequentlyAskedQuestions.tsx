"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/dummyData";

export default function FAQ() {
  const [showAll, setShowAll] = useState(false);

  const handleShowMore = () => {
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
  };

  return (
    <div className="container mx-auto px-10 py-16">
      <h1 className="text-4xl font-semibold mb-3">FAQS</h1>
      <p className="text-xl mb-6">
        Here are some popular questions our users can’t stop asking.
      </p>

      <Accordion
        type="multiple"
        className="w-full grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 "
      >
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="mb-6 md:w-[300px] border-none"
          >
            <AccordionTrigger className="flex justify-between items-center p-6 rounded-3xl border-none bg-blue-50 hover:bg-blue-100 data-[state=open]:bg-customNavyBlue data-[state=open]:rounded-b-none data-[state=open]:text-white">
              <div className="text-left font-semibold text-base border-none">
                {faq.question}
              </div>
            </AccordionTrigger>
            <AccordionContent className=" px-6 pb-6 w-full   border-none rounded-b-3xl bg-customNavyBlue ">
              <div className=" w-full h-[1px] mb-4 bg-white"></div>
              <p className=" bg-customNavyBlue h-fit md:h-32 text-white">
                {faq.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-center mt-6 lg:hidden">
        {!showAll ? (
          <Button
            onClick={handleShowMore}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Show more
          </Button>
        ) : (
          <Button
            onClick={handleShowLess}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Show less
          </Button>
        )}
      </div>
    </div>
  );
}
