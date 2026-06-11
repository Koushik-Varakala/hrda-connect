"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, ChevronRight, BrainCircuit } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const QUESTIONS = [
    { id: 1, section: "Justice", text: "When faced with a difficult decision, I prioritize fairness and ethical conduct even if it makes the situation more complicated." },
    { id: 2, section: "Justice", text: "I am comfortable raising concerns about policies or rules when they seem to be applied inconsistently." },
    { id: 3, section: "Leadership", text: "I naturally take charge and begin organizing tasks when a team or committee lacks clear direction." },
    { id: 4, section: "Leadership", text: "I find it rewarding to take responsibility for important decisions that affect my colleagues or practice." },
    { id: 5, section: "Leadership", text: "I frequently notice opportunities to improve administrative or organizational workflows that others overlook." },
    { id: 6, section: "Independence", text: "I am willing to continue advocating for a necessary change or goal, even if my peers are initially skeptical." },
    { id: 7, section: "Independence", text: "I am comfortable making critical decisions based on my own judgment without always waiting for full consensus." },
    { id: 8, section: "Guidance", text: "I actively seek out feedback and advice from more experienced professionals before making major decisions." },
    { id: 9, section: "Guidance", text: "I believe that having strong mentors and structured guidance is crucial to reaching one's full potential quickly." },
    { id: 10, section: "Guidance", text: "I value studying how successful leaders approach systemic challenges." }
];

interface PreRegistrationQuestionnaireProps {
    onComplete: (archetype: string) => void;
}

export function PreRegistrationQuestionnaire({ onComplete }: PreRegistrationQuestionnaireProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const questionsPerPage = 5;
    const totalSteps = Math.ceil(QUESTIONS.length / questionsPerPage);

    const startIndex = currentStep * questionsPerPage;
    const currentQuestions = QUESTIONS.slice(startIndex, startIndex + questionsPerPage);

    const handleAnswer = (questionId: number, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) }));
    };

    const isCurrentStepComplete = currentQuestions.every(q => answers[q.id] !== undefined);

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            calculateAndComplete();
        }
    };

    const calculateAndComplete = () => {
        let justice = 0;
        let leadership = 0;
        let independence = 0;
        let guidance = 0;

        QUESTIONS.forEach(q => {
            const val = answers[q.id] || 3; // default neutral
            if (q.section === "Justice") justice += val;
            if (q.section === "Leadership") leadership += val;
            if (q.section === "Independence") independence += val;
            if (q.section === "Guidance") guidance += val;
        });

        // Basic Archetype Calculation
        let archetype = "Collaborator";
        const maxScore = Math.max(justice, leadership, independence, guidance);
        
        if (justice === maxScore && independence >= 8) archetype = "Rebel";
        else if (justice === maxScore && leadership >= 10) archetype = "Guardian";
        else if (leadership === maxScore) archetype = "Leader";
        else if (guidance === maxScore && justice >= 8) archetype = "Disciple";
        else if (independence === maxScore) archetype = "Lone Wolf";
        else if (leadership >= 12 && independence >= 8) archetype = "Strategist";

        onComplete(archetype);
    };

    const progress = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);

    return (
        <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-slate-50 border-b pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Membership Assessment</CardTitle>
                        <CardDescription>
                            Please complete this short profile before registering.
                        </CardDescription>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <div className="space-y-8">
                    {currentQuestions.map((q, index) => (
                        <div key={q.id} className="space-y-4">
                            <Label className="text-base font-medium leading-relaxed">
                                <span className="text-primary mr-2">{q.id}.</span> 
                                {q.text}
                            </Label>
                            
                            <RadioGroup 
                                onValueChange={(val) => handleAnswer(q.id, val)} 
                                value={answers[q.id]?.toString()}
                                className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between pt-2"
                            >
                                {[
                                    { val: 1, label: "Strongly Disagree" },
                                    { val: 2, label: "Disagree" },
                                    { val: 3, label: "Neutral" },
                                    { val: 4, label: "Agree" },
                                    { val: 5, label: "Strongly Agree" }
                                ].map((option) => (
                                    <div key={option.val} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.val.toString()} id={`q${q.id}-${option.val}`} />
                                        <Label 
                                            htmlFor={`q${q.id}-${option.val}`} 
                                            className="text-sm font-normal cursor-pointer sm:text-xs text-slate-600"
                                        >
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                            
                            {index < currentQuestions.length - 1 && <div className="border-b border-slate-100 pt-4"></div>}
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="bg-slate-50 border-t py-4 flex justify-between">
                <div className="text-sm text-slate-500">
                    Step {currentStep + 1} of {totalSteps}
                </div>
                <Button 
                    onClick={handleNext} 
                    disabled={!isCurrentStepComplete}
                    className="gap-2"
                >
                    {currentStep < totalSteps - 1 ? (
                        <>Next Questions <ChevronRight className="w-4 h-4" /></>
                    ) : (
                        <>Complete Assessment <CheckCircle className="w-4 h-4" /></>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
