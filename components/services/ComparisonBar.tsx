import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight, Layers } from "lucide-react";

interface ComparisonBarProps {
  selectedServices: any[];
  onClear: () => void;
  onCompare: () => void;
}

export function ComparisonBar({
  selectedServices,
  onClear,
  onCompare,
}: ComparisonBarProps) {
  const router = useRouter();

  if (selectedServices.length === 0) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-5 bg-card/80 backdrop-blur-sm border-border/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {selectedServices.slice(0, 5).map((service) => (
              <Avatar key={service.id} className="border-2 border-background">
                <AvatarImage src={service.professional?.avatarUrl} />
                <AvatarFallback>{service.professional?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {selectedServices.length > 5 && (
                <Avatar className="border-2 border-background">
                    <AvatarFallback>+{selectedServices.length - 5}</AvatarFallback>
                </Avatar>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-galaxia-text-primary">{selectedServices.length} serviço(s) selecionado(s) para comparar</h4>
            <p className="text-sm text-galaxia-text-muted">
              {selectedServices.length < 2 ? "Selecione mais um item para comparar." : "Pronto para comparar!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClear} className="flex items-center gap-1 text-galaxia-text-muted hover:text-galaxia-neon">
            <X className="h-4 w-4" />
            Limpar
          </Button>
          <Button
            onClick={onCompare}
            disabled={selectedServices.length < 2}
            className="bg-gradient-to-r from-galaxia-magenta to-galaxia-neon text-white flex items-center gap-2 shadow-galaxia-glow transition-all duration-300"
          >
            <Layers className="h-4 w-4" />
            Comparar Agora ({selectedServices.length})
          </Button>
        </div>
      </div>
    </Card>
  );
}
