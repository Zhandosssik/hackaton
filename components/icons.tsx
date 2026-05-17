import {
  AlertTriangle,
  BookOpen,
  Bot,
  Camera,
  Check,
  Code,
  Dumbbell,
  FileText,
  Flame,
  Gem,
  GraduationCap,
  History,
  CalendarDays,
  Home,
  Image as ImageIcon,
  Link2,
  Lock,
  MessageSquare,
  Moon,
  Play,
  Puzzle,
  Shield,
  Sparkles,
  Star,
  Sun,
  Target,
  Trophy,
  User,
  Video,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { EducationIconId } from "@/types/education";
import type { AchievementIconId } from "@/types/game";
import type { BenefitIconId, NavIconId } from "@/types/icons";
import type { SectionId } from "@/types/lesson";

export const ICON_STROKE = 1.75;

type IconProps = {
  className?: string;
};

function renderIcon(
  Icon: LucideIcon,
  className = "h-5 w-5 shrink-0",
  strokeWidth = ICON_STROKE,
) {
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}

const educationIcons: Record<EducationIconId, LucideIcon> = {
  robot: Bot,
  history: History,
  puzzle: Puzzle,
  chat: MessageSquare,
  code: Code,
  image: ImageIcon,
  video: Video,
  alert: AlertTriangle,
  chain: Link2,
  shield: Shield,
};

const navIcons: Record<NavIconId, LucideIcon> = {
  home: Home,
  book: BookOpen,
  target: Target,
  calendar: CalendarDays,
  trophy: Trophy,
  user: User,
};

const benefitIcons: Record<BenefitIconId, LucideIcon> = {
  target: Target,
  zap: Zap,
  book: BookOpen,
};

const achievementIcons: Record<AchievementIconId, LucideIcon> = {
  "book-open": BookOpen,
  graduation: GraduationCap,
  target: Target,
  zap: Zap,
  flame: Flame,
  dumbbell: Dumbbell,
  star: Star,
  gem: Gem,
};

const practiceSectionIcons: Record<SectionId, LucideIcon> = {
  text: FileText,
  photo: Camera,
  video: Video,
};

export function EducationIcon({
  name,
  className = "h-5 w-5 shrink-0",
}: {
  name: EducationIconId;
  className?: string;
}) {
  return renderIcon(educationIcons[name], className);
}

export function NavIcon({
  name,
  className = "h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]",
}: {
  name: NavIconId;
  className?: string;
}) {
  return renderIcon(navIcons[name], className);
}

export function BenefitIcon({
  name,
  className = "h-7 w-7 text-white",
}: {
  name: BenefitIconId;
  className?: string;
}) {
  return renderIcon(benefitIcons[name], className);
}

export function AchievementIcon({
  name,
  className = "h-7 w-7 text-brand-purple dark:text-brand-purple-light",
}: {
  name: AchievementIconId;
  className?: string;
}) {
  return renderIcon(achievementIcons[name], className);
}

export function PracticeSectionIcon({
  sectionId,
  className = "h-4 w-4 shrink-0",
}: {
  sectionId: SectionId;
  className?: string;
}) {
  return renderIcon(practiceSectionIcons[sectionId], className);
}

export function IconLogo({ className = "h-4 w-4" }: IconProps) {
  return renderIcon(Sparkles, className);
}

export function IconLock({ className = "h-5 w-5 shrink-0" }: IconProps) {
  return renderIcon(Lock, className);
}

export function IconCheck({ className = "h-5 w-5 shrink-0" }: IconProps) {
  return renderIcon(Check, className, 2);
}

export function IconX({ className = "h-5 w-5 shrink-0" }: IconProps) {
  return renderIcon(X, className, 2);
}

export function IconPlay({ className = "h-10 w-10" }: IconProps) {
  return <Play className={className} fill="currentColor" strokeWidth={0} aria-hidden />;
}

export function IconFlame({ className = "h-5 w-5 shrink-0 text-orange-500" }: IconProps) {
  return renderIcon(Flame, className);
}

export function ThemeSunIcon({ className = "h-4 w-4" }: IconProps) {
  return renderIcon(Sun, className);
}

export function ThemeMoonIcon({ className = "h-4 w-4" }: IconProps) {
  return renderIcon(Moon, className);
}
