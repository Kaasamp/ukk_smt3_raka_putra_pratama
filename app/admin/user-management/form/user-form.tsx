'use client'

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type UserFormUser = {
  id: number
  kodeUser?: string
  fullname: string
  email: string
  role: string
}

type UserFormProps = {
  userId?: string
}

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserFormUser | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingKode, setIsGeneratingKode] = useState(false)
  const [error, setError] = useState("")
  const [kodeUser, setKodeUser] = useState("")
  const [fullname, setFullname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("staff")

  useEffect(() => {
    if (!userId) {
      setUser(null)
      setFullname("")
      setEmail("")
      setPassword("")
      setRole("staff")
      return
    }

    let isActive = true
    async function loadUser() {
      try {
        const response = await fetch(`/api/auth/users/${userId}`)
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? "Gagal memuat user.")

        if (isActive) {
          setUser(result.user)
          setKodeUser(result.user.kodeUser ?? "")
          setFullname(result.user.fullname)
          setEmail(result.user.email)
          setRole(result.user.role)
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Gagal memuat user.")
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void loadUser()
    return () => {
      isActive = false
    }
  }, [userId])

  useEffect(() => {
    if (userId) return

    let isActive = true
    async function fetchPreviewKode() {
      setIsGeneratingKode(true)
      try {
        const response = await fetch(`/api/auth/users?previewKode=true&role=${encodeURIComponent(role)}`)
        const result = await response.json()
        if (!response.ok) throw new Error(result.error ?? "Gagal mengambil ID otomatis.")

        if (isActive) {
          setKodeUser(result.kodeUser)
        }
      } catch (genError) {
        if (isActive) {
          setError(genError instanceof Error ? genError.message : "Gagal mengambil ID otomatis.")
        }
      } finally {
        if (isActive) {
          setIsGeneratingKode(false)
        }
      }
    }

    void fetchPreviewKode()
    return () => {
      isActive = false
    }
  }, [userId, role])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      const response = await fetch(userId ? `/api/auth/users/${userId}` : "/api/auth/users", {
        method: userId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: fullname.trim(),
          email: email.trim(),
          ...(password ? { password } : {}),
          role,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Gagal menyimpan user.")

      if (!userId) {
        setFullname("")
        setEmail("")
        setPassword("")
        setRole("staff")
      }

      router.push("/admin/user-management")
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan user.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="m-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{userId ? "Edit user" : "Tambah user"}</h1>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => router.push("/admin/user-management")}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Memuat user...</p>
      ) : userId && !user ? null : (
        <form onSubmit={handleSubmit} autoComplete="off" className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="kodeUser" className="text-sm font-medium">ID User (Autonumber)</label>
            <Input
              id="kodeUser"
              value={isGeneratingKode ? "Memuat ID..." : kodeUser}
              readOnly
              className="h-9 bg-muted/50 font-mono text-sm"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="role" className="text-sm font-medium">Role</label>
            <div className="relative">
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="fullname" className="text-sm font-medium">Nama lengkap</label>
            <Input
              id="fullname"
              autoComplete="off"
              placeholder="Masukkan nama lengkap"
              value={fullname}
              onChange={(event) => setFullname(event.target.value)}
              required
              maxLength={191}
              className="h-9"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              autoComplete="off"
              placeholder="nama@domain.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={191}
              className="h-9"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm font-medium">{user ? "Password baru" : "Password"}</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required={!user}
              minLength={8}
              autoComplete="new-password"
              placeholder={user ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"}
              className="h-9"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-4 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/user-management")} disabled={isSaving}>
              <X className="size-4" aria-hidden="true" />
              Batal
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : user ? "Simpan perubahan" : "Buat user"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}