"use client";

import React from 'react'
import TeamMember from './TeamMember';
import SectionHeader from './SectionHeader';
import { motion, useAnimation } from 'framer-motion';
import { useAnimateInView } from '@/hooks/use-animate-In-view';

const TEAM = [
    { imageSrc: '/team.JPG', name: 'Somto', role: 'CEO', location: 'Lagos, NG' },
    { imageSrc: '/team.JPG', name: 'Ada', role: 'Design Lead', location: 'Abuja, NG' },
    { imageSrc: '/team.JPG', name: 'Chinedu', role: 'CFO', location: 'Lagos, NG' },
    { imageSrc: '/team.JPG', name: 'Hassan', role: 'HR', location: 'Kano, NG' },
    { imageSrc: '/team.JPG', name: 'Uche', role: 'Lead Dev', location: 'Lagos, NG' },
    { imageSrc: '/team.JPG', name: 'Tola', role: 'QA', location: 'Ibadan, NG' },
];

const CARD_GAP = 24; // px
const CARD_WIDTH = 250; // px (outer wrapper width)
const SLIDER_SPEED = 50; // seconds per loop

function MobileTeamSlider() {
    const { ref, isInView } = useAnimateInView({ once: true, margin: '-50px' });
    const sliderControls = useAnimation();
    const itemControls = TEAM.map(() => useAnimation());

    if (isInView) {
        (async () => {
            // Reveal items
            await Promise.all(
                itemControls.map((c) =>
                    c.start({ opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } })
                )
            );

            // Start infinite horizontal loop
            const totalWidth = TEAM.length * (CARD_WIDTH + CARD_GAP);
            sliderControls.start({
                x: -totalWidth,
                transition: { repeat: Infinity, repeatType: 'loop', duration: SLIDER_SPEED, ease: 'linear' },
            });
        })();
    }

    return (
        <motion.div ref={ref} className="flex gap-6 w-max" animate={sliderControls} initial={{ x: 0 }}>
            {[...TEAM, ...TEAM, ...TEAM].map((m, idx) => (
                <motion.div
                    key={`${m.name}-${idx}`}
                    className="flex-shrink-0 flex justify-center items-center"
                    style={{ width: CARD_WIDTH, height: CARD_WIDTH + 70 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={itemControls[idx % TEAM.length]}
                >
                    <TeamMember
                        imageSrc={m.imageSrc}
                        name={m.name}
                        role={m.role}
                        location={m.location}
                        width={250}
                        height={250}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}

export default function WhoWeAre() {
    return (
        <div
            className="flex items-center flex-col justify-center px-6 md:px-10 py-16 text-black "
        >
            <SectionHeader
                title="Who are"
                highlight="We"
                subtitle="Meet the minds behind RefreeG"
            />

            {/* Mobile layout: horizontal auto-scrolling slider */}
            <div className="md:hidden mt-10 w-full overflow-hidden h-fit py-5">
                <MobileTeamSlider />
            </div>

            {/* Desktop layout: positioned collage */}
            <div className="relative hidden md:block w-full max-w-7xl h-[720px] mt-10">
                {/* Left bottom - CEO */}
                <TeamMember
                    imageSrc="/team.JPG"
                    name="Somto"
                    role="CEO"
                    location="Lagos, NG"
                    width={302}
                    height={302}
                    position="absolute"
                    left="0%"
                    bottom="2%"
                    zIndex={10}
                />

                {/* Upper left - Design Lead */}
                <TeamMember
                    imageSrc="/team.JPG"
                    name="Ada"
                    role="Design Lead"
                    location="Abuja, NG"
                    width={302}
                    height={302}
                    position="absolute"
                    left="20%"
                    top="0%"
                    zIndex={10}
                />

                {/* Center - CFO */}
                <TeamMember
                    imageSrc="/team.JPG"
                    name="Chinedu"
                    role="CFO"
                    location="Lagos, NG"
                    width={302}
                    height={302}
                    position="absolute"
                    left="50%"
                  
                    bottom="0%"
                    zIndex={10}
                    style={{ transform: 'translateX(-50%)' }}
                />

                {/* Upper right - HR */}
                <TeamMember
                    imageSrc="/team.JPG"
                    name="Hassan"
                    role="HR"
                    location="Kano, NG"
                    width={302}
                    height={302}
                    position="absolute"
                    right="20%"
                    top="0%"
                    zIndex={10}
                />

                {/* Lower right - Lead Dev */}
                <TeamMember
                    imageSrc="/team.JPG"
                    name="Uche"
                    role="Lead Dev"
                    location="Lagos, NG"
                    width={302}
                    height={302}
                    position="absolute"
                    right="0%"
                    bottom="0%"
                    zIndex={10}
                />

            </div>
        </div>
    )
}
