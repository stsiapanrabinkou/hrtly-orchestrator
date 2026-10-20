import { useState } from "react";
import { ChevronDown, Globe2, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Text } from "@/shared/ui/typography";
import { useTheme } from "@/theme/ThemeProvider";
import { mockClinician, type ClinicianProfile } from "@/flows/_mocks/clinician";

type Props = {
  profile?: ClinicianProfile;
  onProfileOpen?: () => void;
  onSignOutPreview?: () => void;
};

export function HeaderControls({ profile = mockClinician, onProfileOpen, onSignOutPreview }: Props) {
  const { mode, toggle } = useTheme();
  const [dialog, setDialog] = useState<"profile" | "sign-out" | null>(null);
  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <Button variant="ghost" size="icon" className="size-10" onClick={toggle}
        aria-label={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        title={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
        {mode === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 gap-1 px-2 text-xs" aria-label="Choose language, current language English">
            <Globe2 className="hidden size-4 sm:block" /><span>EN</span><ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          <DropdownMenuRadioGroup value="en">
            <DropdownMenuRadioItem value="en" className="min-h-10">English</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="es" className="min-h-10">Español</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="ml-1 border-l pl-2 sm:ml-2 sm:pl-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-1 xl:px-2" aria-label={`Open account menu for ${profile.name}`}>
              <Avatar className="size-8"><AvatarFallback className="bg-secondary text-primary">{profile.initials}</AvatarFallback></Avatar>
              <span className="hidden text-left xl:block">
                <Text className="text-xs font-medium">{profile.name}</Text>
                <Text variant="small" className="text-[10px]">{profile.role}</Text>
              </span>
              <ChevronDown className="hidden size-3 text-muted-foreground xl:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel><Text className="text-sm font-medium">{profile.name}</Text><Text variant="small">{profile.role}</Text></DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="min-h-10" onSelect={() => { setDialog("profile"); onProfileOpen?.(); }}><UserRound />My profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="min-h-10" variant="destructive" onSelect={() => { setDialog("sign-out"); onSignOutPreview?.(); }}><LogOut />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={dialog !== null} onOpenChange={open => { if (!open) setDialog(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialog === "profile" ? "My profile" : "Sign out"}</DialogTitle>
            <DialogDescription>{dialog === "profile" ? "Your clinician account details." : "Are you sure you want to sign out?"}</DialogDescription>
          </DialogHeader>
          {dialog === "profile" && <div className="flex items-center gap-3 rounded-lg border p-4"><Avatar className="size-12"><AvatarFallback className="bg-secondary text-primary">{profile.initials}</AvatarFallback></Avatar><div><Text className="font-medium">{profile.name}</Text><Text variant="small">{profile.role}</Text></div></div>}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
