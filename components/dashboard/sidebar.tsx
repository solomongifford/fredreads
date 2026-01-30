'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  UserCheck, 
  FileText, 
  Tag,
  Shield,
  LogOut 
} from 'lucide-react';
import { logout } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Classes', href: '/classes', icon: BookOpen },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Volunteers', href: '/volunteers', icon: UserCheck },
  { name: 'Activity Log', href: '/activity-log', icon: FileText },
  { name: 'Tag Manager', href: '/tags', icon: Tag },
  { name: 'Admins', href: '/admins', icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-64 bg-[#333333] text-white">
      <div className="p-6 border-b border-[#4a4a4a]">
        <h2 className="text-xl font-semibold text-white">Fredericksburg READS Literacy Council</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-[#8B4513] text-white'
                  : 'text-gray-300 hover:bg-[#4a4a4a] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#4a4a4a]">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-[#4a4a4a]"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
