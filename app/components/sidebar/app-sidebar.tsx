import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { House, Users, Mail } from "lucide-react"

const listMenu = [
  {
    name: "Dashboard",
    url: "/admin",
    icon: House
  },
  {
    name: "User Management",
    url: "/admin/user-management",
    icon: Users
  },
  {
    name: "Facility",
    url: "/admin/facility",
    icon: Mail
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="bg-blue-100 text-black" />
      <SidebarContent className="bg-blue-100 text-black">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 font-bold text-lg text-black">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 font-semibold text-md text-black">
              {listMenu.map((menu) => (
                <SidebarMenuItem key={menu.name}>
                  <SidebarMenuButton asChild>
                    <a href={menu.url}>
                      <menu.icon />
                      <span>{menu.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-blue-100 text-black" />
    </Sidebar>
  )
}