import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface RememberInputsProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

export function RememberInputs({ checked, onChange }: RememberInputsProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        id="remember-inputs"
        data-testid="switch-remember"
      />
      <Label htmlFor="remember-inputs" className="cursor-pointer text-muted-foreground text-xs">
        Remember my inputs
      </Label>
    </div>
  );
}
