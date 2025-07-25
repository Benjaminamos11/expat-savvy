import { Home, User, Briefcase, FileText, Heart, BookOpen } from 'lucide-react'
import { NavBar } from "./tubelight-navbar"

export function NavBarDemo() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'About', url: '/about', icon: User },
    { name: 'Insurance', url: '/insurance-providers', icon: Briefcase },
    { name: 'Healthcare', url: '/healthcare/switching-health-insurance', icon: Heart },
    { name: 'Guides', url: '/guides/how-to', icon: BookOpen },
    { name: 'News', url: '/news', icon: FileText }
  ]

  return <NavBar items={navItems} />
}