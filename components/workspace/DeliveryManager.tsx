import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    UploadCloud, 
    FileText, 
    ImageIcon, 
    Archive, 
    Paperclip,
    ThumbsUp,
    MessageSquareWarning,
    History,
    Download
} from 'lucide-react';

const mockDeliveries = [
    {
        id: 'del_002',
        version: 2,
        timestamp: '2025-07-30T14:30:00Z',
        author: 'João Silva',
        message: 'Seguem os ajustes no conceito A, com as variações de cores que você sugeriu. Acredito que agora chegamos mais perto do resultado ideal. Me diga o que acha!',
        files: [
            { name: 'logo_conceito_A_v2_cor1.png', size: '1.3 MB', type: 'image' },
            { name: 'logo_conceito_A_v2_cor2.png', size: '1.3 MB', type: 'image' },
        ],
        status: 'Pendente de Revisão'
    },
    {
        id: 'del_001',
        version: 1,
        timestamp: '2025-07-28T10:00:00Z',
        author: 'João Silva',
        message: 'Aqui estão os 3 conceitos iniciais do logo, conforme combinamos no briefing. Fico no aguardo do seu feedback!',
        files: [
            { name: 'logo_conceito_A.png', size: '1.2 MB', type: 'image' },
            { name: 'logo_conceito_B.png', size: '1.4 MB', type: 'image' },
            { name: 'logo_conceito_C.png', size: '1.1 MB', type: 'image' },
        ],
        status: 'Aprovado'
    }
];

const getFileIcon = (type) => {
    switch (type) {
        case 'image': return <ImageIcon className="h-5 w-5 text-galaxia-blue" />;
        case 'zip': return <Archive className="h-5 w-5 text-yellow-600" />;
        default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Aprovado': return <Badge className="bg-green-100 text-green-800 border-green-200">Aprovado</Badge>;
        case 'Pendente de Revisão': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente de Revisão</Badge>;
        case 'Revisão Solicitada': return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Revisão Solicitada</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
};


export function DeliveryManager() {
    const [deliveries, setDeliveries] = useState(mockDeliveries);

    return (
        <div className="space-y-8">
            {/* 1. Upload Box (Para o Profissional) */}
            <Card>
                <CardHeader>
                    <CardTitle>Enviar Nova Entrega</CardTitle>
                    <CardDescription>Faça o upload dos arquivos do projeto e adicione uma mensagem para o cliente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-muted/50 transition-colors">
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">Arraste e solte os arquivos aqui, ou</p>
                            <Button variant="link">clique para selecionar</Button>
                            <Input type="file" className="hidden" multiple />
                        </div>
                        <Textarea placeholder="Escreva uma mensagem para o cliente sobre esta entrega..." rows={4} />
                        <Button className="w-full">
                            <UploadCloud className="h-4 w-4 mr-2" />
                            Enviar Entrega v{deliveries.length + 1}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Histórico de Entregas */}
            <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico de Entregas
                </h3>
                <div className="space-y-6">
                    {deliveries.map(delivery => (
                        <Card key={delivery.id} className="overflow-hidden">
                            <CardHeader className="flex flex-row justify-between items-start bg-muted/50 p-4">
                                <div>
                                    <h4 className="font-bold">Entrega v{delivery.version}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Enviado por {delivery.author} em {new Date(delivery.timestamp).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                                {getStatusBadge(delivery.status)}
                            </CardHeader>
                            <CardContent className="p-4">
                                <p className="text-sm mb-4 italic border-l-4 pl-4 py-2 bg-muted/20">"{delivery.message}"</p>
                                
                                <div className="space-y-3">
                                    <h5 className="font-semibold flex items-center gap-2 text-sm">
                                        <Paperclip className="h-4 w-4" /> 
                                        Arquivos ({delivery.files.length})
                                    </h5>
                                    {delivery.files.map(file => (
                                        <div key={file.name} className="flex justify-between items-center p-2 rounded-md bg-muted/40">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon(file.type)}
                                                <div>
                                                    <p className="text-sm font-medium">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">{file.size}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {delivery.status === 'Pendente de Revisão' && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                                <ThumbsUp className="h-4 w-4 mr-2"/>
                                                Aprovar Entrega e Liberar Pagamento
                                            </Button>
                                            <Button variant="outline" className="flex-1">
                                                <MessageSquareWarning className="h-4 w-4 mr-2"/>
                                                Solicitar Revisão
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
} 