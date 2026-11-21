import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, Award, BadgeCheck, Ban, Banknote, BarChart3,
  Bell, Bot, Briefcase, Building2, Cake, Calendar, CalendarCheck, CalendarClock, CalendarDays, CalendarPlus, CalendarX,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Clock, CloudSun, Coffee,
  Copy, CreditCard, Crown, Download, Droplets, Dumbbell, Edit, ExternalLink, Eye, EyeOff,
  FileBarChart, Filter, Flag, Flame, Flower2, Gift, Handshake, Heart, IceCream, Info,
  KeyRound, Landmark, LayoutDashboard, Leaf, LineChart, Lock, LogOut, Mail, Map, MapPin, Menu, MessageSquare,
  Minus, MoreVertical, Package, Percent, Phone, PieChart, Play, Plus, Printer, QrCode, RefreshCw, Repeat,
  Receipt, RotateCcw, Salad, Sandwich, Save, ScrollText, Search, Send, Settings, ShieldCheck, ShoppingBag,
  Shuffle, Smartphone, Sparkles, Sprout, Star, Store, Sun, Target, Ticket, Timer, Trash2, TrendingDown,
  TrendingUp, Trophy, Truck, Upload, User, UserCog, Users, Utensils, Wallet, Wind, Wrench,
  X, Zap, Banknote as Cash, GlassWater, Soup,
  AtSign, Camera, CircleDot, Code2, Share2, Video,
} from 'lucide-react';

/**
 * Curated icon registry. Navigation and data files reference icons by name so
 * they stay plain data — the bundle only pulls the icons actually used.
 */
const registry = {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, Award, BadgeCheck, Ban, Banknote, BarChart3, Bell, Bot,
  Briefcase, Building2, Cake, Calendar, CalendarCheck, CalendarClock, CalendarDays, CalendarPlus, CalendarX, Check,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Clock, CloudSun, Coffee, Copy,
  CreditCard, Crown, Download, Droplets, Dumbbell, Edit, ExternalLink, Eye, EyeOff, FileBarChart,
  Filter, Flag, Flame, Flower2, Gift, GlassWater, Handshake, Heart, IceCream, Info,
  KeyRound, Landmark, LayoutDashboard, Leaf, LineChart, Lock, LogOut, Mail, Map, MapPin, Menu, MessageSquare,
  Minus, MoreVertical, Package, Percent, Phone, PieChart, Play, Plus, Printer, QrCode, Receipt, RefreshCw,
  Repeat, RotateCcw, Salad, Sandwich, Save, ScrollText, Search, Send, Settings, ShieldCheck, ShoppingBag,
  Shuffle, Smartphone, Soup, Sparkles, Sprout, Star, Store, Sun, Target, Ticket, Timer, Trash2,
  TrendingDown, TrendingUp, Trophy, Truck, Upload, User, UserCog, Users, Utensils, Wallet,
  Wind, Wrench, X, Zap,
  Cash,
  // Brand icons are no longer shipped by lucide-react — alias them to close equivalents.
  Facebook: Share2,
  Github: Code2,
  Instagram: Camera,
  Tennis: CircleDot,
  Twitter: AtSign,
  UserClock: CalendarClock,
  Youtube: Video,
};

export default function Icon({ name, size = 18, strokeWidth = 2, className = '', style }) {
  const Cmp = registry[name] || Sparkles;
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} style={style} />;
}

export { registry };
