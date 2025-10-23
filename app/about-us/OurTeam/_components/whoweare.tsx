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

function DesktopTeamSlider() {
    const { ref, isInView } = useAnimateInView({ once: true, margin: '-50px' });
    const sliderControls = useAnimation();
    
    // Use a single scene and repeat it for the infinite loop
    const scene = [
        { ...TEAM[0], position: { left: '6%', bottom: '6%' }, style: {} }, // Somto (CEO) bottom-left
        { ...TEAM[1], position: { left: '16%', top: '3%' }, style: {} }, // Ada (Design Lead) upper-left
        { ...TEAM[2], position: { left: '50%', top: '22%' }, style: { transform: 'translateX(-50%)' } }, // Chinedu (CFO) center
        { ...TEAM[3], position: { right: '16%', top: '3%' }, style: {} }, // Hassan (HR) upper-right
        { ...TEAM[4], position: { right: '6%', bottom: '6%' }, style: {} }, // Uche (Lead Dev) bottom-right
        { ...TEAM[5], position: { right: '-4%', top: '30%' }, style: {} }, // Tola (QA) slightly off-right
    ];

    const SCENE_WIDTH = 100; // Each scene takes full width (100vw)
    const SLIDER_SPEED = 200; // seconds per full loop (faster since only 2 scenes)

    React.useEffect(() => {
        if (isInView) {
            // Start infinite horizontal loop: shift by one scene width (we render 3 copies)
            const totalWidth = SCENE_WIDTH; // 100% per scene
            sliderControls.start({
                x: `-${totalWidth}%`,
                transition: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: SLIDER_SPEED,
                    ease: 'linear'
                },
            });
        }
    }, [isInView, sliderControls]);

    return (
        <div className="relative hidden md:block w-full max-w-7xl h-[720px] mt-10 overflow-hidden">
            <motion.div 
                ref={ref}
                className="flex w-max"
                animate={sliderControls}
                initial={{ x: 0 }}
            >
                {/* Render scenes multiple times for infinite loop */}
                    {[scene, scene, scene].map((s: any[], sceneIndex: number) => (
                    <div 
                        key={sceneIndex}
                        className="relative flex-shrink-0"
                        style={{ width: '100vw', maxWidth: '1152px', height: '720px' }} // max-w-7xl = 1152px
                    >
                        {/* Team members positioned within each scene */}
                            {s.map((member: any, memberIndex: number) => (
                            <motion.div
                                    key={`${sceneIndex}-${member.name}`}
                                className="absolute"
                                style={{
                                    ...member.position,
                                    zIndex: 10,
                                    ...(member.style || {})
                                }}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ 
                                    opacity: 1, 
                                    y: 0,
                                    transition: { 
                                        duration: 0.6, 
                                        delay: memberIndex * 0.1,
                                        ease: "easeOut"
                                    }
                                }}
                            >
                                <TeamMember
                                    imageSrc={member.imageSrc}
                                    name={member.name}
                                    role={member.role}
                                    location={member.location}
                                    width={302}
                                    height={302}
                                />
                            </motion.div>
                        ))}
                    </div>
                ))}
            </motion.div>
        </div>
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

            {/* Desktop layout: positioned collage slider */}
            <DesktopTeamSlider />
        </div>
    )
}
