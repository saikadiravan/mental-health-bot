import { CRISIS_RESOURCES } from "@/lib/crisis-detection";
import { Phone, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CrisisModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CrisisModal({ open, onClose }: CrisisModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle>Connect to a Professional</DialogTitle>
          </div>
          <DialogDescription>
            If you're in crisis or experiencing thoughts of self-harm, please reach out to a trained professional immediately. You are not alone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {CRISIS_RESOURCES.map(r => (
            <div
              key={r.name}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
            >
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.contact}</p>
              </div>
              {r.contact.startsWith("http") && (
                <a href={r.contact} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              )}
            </div>
          ))}
        </div>

        <Button onClick={onClose} variant="outline" className="w-full mt-2">
          I understand, continue chatting
        </Button>
      </DialogContent>
    </Dialog>
  );
}
