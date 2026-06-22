import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  devotionalId: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
  showLabel?: boolean;
};

const FavoriteButton = ({
  devotionalId,
  variant = "outline",
  size = "default",
  showLabel = true,
}: Props) => {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(devotionalId);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowFav = await toggle(devotionalId);
    toast({
      title: nowFav ? "Saved to favorites" : "Removed from favorites",
      description: nowFav ? "Find it any time on the Favorites page." : undefined,
    });
  };

  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={cn("gap-2", fav && "border-accent text-accent")}
      aria-pressed={fav}
      aria-label={fav ? "Remove from favorites" : "Save to favorites"}
    >
      <Heart className={cn("w-4 h-4", fav && "fill-current")} />
      {showLabel && (fav ? "Saved" : "Save")}
    </Button>
  );
};

export default FavoriteButton;
