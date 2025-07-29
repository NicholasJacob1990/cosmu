import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, Paperclip, Send, Lightbulb } from 'lucide-react';

interface SubmitProposalSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectBudget: number;
}

export function SubmitProposalSheet({ open, onOpenChange, projectBudget }: SubmitProposalSheetProps) {
    const [proposalValue, setProposalValue] = useState(projectBudget);
    const [deliveryTime, setDeliveryTime] = useState(5);
    const [coverLetter, setCoverLetter] = useState("");

    const fee = proposalValue * 0.15; // 15% de taxa da plataforma
    const earnings = proposalValue - fee;

    const handleSubmit = () => {
        console.log({
            proposalValue,
            deliveryTime,
            coverLetter
        });
        // Lógica de envio da proposta
        onOpenChange(false); // Fecha o sheet
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-2xl">Envie sua Melhor Proposta</SheetTitle>
                    <SheetDescription>
                        Destaque suas habilidades e explique por que você é a melhor escolha para este projeto.
                    </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 px-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {/* Termos da Proposta */}
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <h4 className="font-semibold">Defina seus termos</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="value">Seu Valor (R$)</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        value={proposalValue}
                                        onChange={(e) => setProposalValue(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="time">Prazo de Entrega (dias)</Label>
                                    <Input
                                        id="time"
                                        type="number"
                                        value={deliveryTime}
                                        onChange={(e) => setDeliveryTime(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-2 border-t pt-3">
                                <div className="flex justify-between">
                                    <span>Taxa de serviço GalaxIA (15%):</span>
                                    <span className="font-medium text-foreground">- R$ {fee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg text-foreground">
                                    <span>Você receberá:</span>
                                    <span className="text-green-600">R$ {earnings.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Carta de Apresentação */}
                    <div>
                        <Label htmlFor="cover-letter" className="font-semibold text-base">Carta de Apresentação</Label>
                        <Textarea
                            id="cover-letter"
                            placeholder="Apresente-se, destaque sua experiência relevante e explique como você pode ajudar o cliente a atingir seus objetivos..."
                            className="min-h-[200px] mt-2"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                        />
                    </div>
                    
                    {/* Anexos */}
                    <div>
                        <Label htmlFor="attachments" className="font-semibold text-base">Anexos</Label>
                        <div className="mt-2 flex items-center justify-center w-full">
                            <label
                                htmlFor="dropzone-file"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Paperclip className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Clique para enviar</span> ou arraste e solte
                                    </p>
                                    <p className="text-xs text-muted-foreground">PDF, PNG, JPG, ou MP4 (MAX. 25MB)</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" />
                            </label>
                        </div>
                    </div>
                    
                    <div className="bg-galaxia-magenta/5 border border-galaxia-magenta/20 rounded-lg p-4 flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-galaxia-magenta mt-1" />
                      <div>
                        <h5 className="font-semibold text-galaxia-magenta">Dica Pro</h5>
                        <p className="text-sm text-muted-foreground">Propostas personalizadas e que demonstram entendimento do problema têm 80% mais chances de serem escolhidas. Evite mensagens genéricas!</p>
                      </div>
                    </div>
                </div>

                <SheetFooter className="pt-6">
                    <SheetClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </SheetClose>
                    <Button 
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Proposta Agora
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
} 