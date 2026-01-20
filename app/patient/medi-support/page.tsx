"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Heart,
    Brain,
    ShieldCheck,
    WarningCircle
} from "phosphor-react";
import HealthMentorUI from "@/components/health-mentor/HealthMentorUI";

export default function MediSupportPage() {

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-4"
                >
                    <h1 className="text-4xl font-instrument-serif text-[#37322F]">
                        Medical Support Center
                    </h1>
                    <p className="text-lg text-[rgba(55,50,47,0.80)] font-sans max-w-3xl mx-auto">
                        Access comprehensive AI-powered medical support services for diagnosis, consultation, and health guidance
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <Badge className="bg-[oklch(0.6_0.2_45)] text-white border-none">
                            <Heart size={12} weight="regular" className="mr-1" />
                            24/7 Available
                        </Badge>
                        <Badge className="bg-white text-[#37322F] border border-[rgba(55,50,47,0.12)]">
                            <ShieldCheck size={12} weight="regular" className="mr-1" />
                            HIPAA Compliant
                        </Badge>
                        <Badge className="bg-white text-[#37322F] border border-[rgba(55,50,47,0.12)]">
                            <Brain size={12} weight="regular" className="mr-1" />
                            AI-Powered
                        </Badge>
                    </div>
                </motion.div>




                {/* AI Health Consultation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <HealthMentorUI />
                </motion.div>

                {/* Medical Disclaimer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <Alert className="border-2 border-amber-300 bg-amber-50">
                        <WarningCircle size={16} weight="regular" />
                        <AlertDescription className="font-sans">
                            <strong>Medical Disclaimer:</strong> This AI medical support system provides general health information and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for serious medical concerns or emergencies. In case of medical emergencies, call your local emergency services immediately.
                        </AlertDescription>
                    </Alert>
                </motion.div>
            </div>
        </div>
    );
}
