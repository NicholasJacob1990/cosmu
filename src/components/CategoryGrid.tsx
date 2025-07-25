import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Palette, 
  PenTool, 
  Camera, 
  Music, 
  Globe, 
  Megaphone, 
  BarChart,
  FileText,
  Video,
  Smartphone,
  Briefcase
} from "lucide-react";

const categories = [
  {
    name: "Desenvolvimento",
    icon: Code,
    count: 1245,
    gradient: "from-blue-500 to-cyan-500",
    popular: true
  },
  {
    name: "Design & Arte",
    icon: Palette,
    count: 892,
    gradient: "from-purple-500 to-pink-500",
    popular: true
  },
  {
    name: "Redação",
    icon: PenTool,
    count: 567,
    gradient: "from-green-500 to-emerald-500",
    popular: false
  },
  {
    name: "Fotografia",
    icon: Camera,
    count: 234,
    gradient: "from-orange-500 to-red-500",
    popular: false
  },
  {
    name: "Música & Áudio",
    icon: Music,
    count: 345,
    gradient: "from-indigo-500 to-purple-500",
    popular: false
  },
  {
    name: "Web & Mobile",
    icon: Globe,
    count: 678,
    gradient: "from-teal-500 to-blue-500",
    popular: true
  },
  {
    name: "Marketing",
    icon: Megaphone,
    count: 456,
    gradient: "from-yellow-500 to-orange-500",
    popular: false
  },
  {
    name: "Dados & Analytics",
    icon: BarChart,
    count: 123,
    gradient: "from-gray-500 to-slate-500",
    popular: false
  },
  {
    name: "Tradução",
    icon: FileText,
    count: 234,
    gradient: "from-rose-500 to-pink-500",
    popular: false
  },
  {
    name: "Vídeo & Animação",
    icon: Video,
    count: 345,
    gradient: "from-violet-500 to-purple-500",
    popular: false
  },
  {
    name: "Mobile Apps",
    icon: Smartphone,
    count: 189,
    gradient: "from-cyan-500 to-blue-500",
    popular: false
  },
  {
    name: "Consultoria",
    icon: Briefcase,
    count: 167,
    gradient: "from-emerald-500 to-teal-500",
    popular: false
  }
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <Card 
            key={category.name} 
            className="group cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0 relative overflow-hidden"
          >
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {category.count.toLocaleString()} serviços
              </p>
              {category.popular && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 text-xs bg-gradient-primary text-primary-foreground border-0"
                >
                  Popular
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}