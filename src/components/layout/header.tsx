import { BookOpen } from "lucide-react";

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function Header({ title, showLogo = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 h-14 px-4 max-w-lg mx-auto">
        {showLogo && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        <h1 className="font-semibold text-lg truncate">
          {title || "StudentBoard"}
        </h1>
      </div>
    </header>
  );
}
