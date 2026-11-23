'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Printer, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

type ManagedFacility = {
    id: number
    nama_facilicy: string
    singkatJur: string
    createdAt: string
}

const PAGE_SIZE = 10

export default function FacilityPage() {
    const router = useRouter()
    const [jurusan, setJurusan] = useState<ManagedFacility[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalJurusan, setTotalJurusan] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    async function loadJurusan(page = currentPage) {
        setIsLoading(true)
        setError("")
        try {
            const response = await fetch(`/api/auth/jurusan?page=${page}&pageSize=${PAGE_SIZE}`)
            const result = await response.json()
            if (!response.ok) throw new Error(result.error ?? "Gagal memuat jurusan.")
            setJurusan(result.categories ?? result.jurusan ?? [])
            setTotalJurusan(result.pagination?.totalCategories ?? result.pagination?.totalJurusan ?? 0)
            setCurrentPage(result.pagination?.page ?? 1)
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Gagal memuat jurusan.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void loadJurusan(1)
    }, [])

    function goToPage(page: number) {
        setCurrentPage(page)
        void loadJurusan(page)
    }

    async function deleteJurusan(item: ManagedFacility) {
        if (!window.confirm(`Hapus jurusan ${item.kelas}?`)) return
        setError("")
        try {
            const response = await fetch(`/api/auth/jurusan/${item.id}`, {
                method: "DELETE",
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error ?? "Gagal menghapus jurusan.")
            if (jurusan.length === 1 && currentPage > 1) {
                goToPage(currentPage - 1)
            } else {
                await loadJurusan(currentPage)
            }
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Gagal menghapus jurusan.")
        }
    }

    // State untuk menyimpan teks tanggal hari ini saat tombol cetak diklik
    const [tanggalCetak, setTanggalCetak] = useState("")

    // Fungsi untuk menyiapkan tanggal dan membuka jendela Print / Save PDF bawaan browser
    function handlePrint() {
        // Mengubah tanggal sistem hari ini ke format Indonesia (contoh: 22 November 2026)
        const today = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        setTanggalCetak(today) // Simpan tanggal ke state agar tampil di judul & area tanda tangan

        // Beri jeda 100ms agar React selesai merender teks tanggalCetak sebelum dialog print muncul
        setTimeout(() => {
            window.print() // Perintah bawaan browser untuk mencetak halaman / Save as PDF
        }, 100)
    }

    const totalPages = Math.max(1, Math.ceil(totalJurusan / PAGE_SIZE))

    return (
        <Card className="m-6 px-4">
            {/* ================= KOP SURAT ================= */}
            {/* 'hidden' = sembunyi di layar web biasa | 'print:flex' = muncul sejajar ke samping saat mode cetak */}
            <header className="hidden items-center border-b-4 border-double border-black pb-4 mb-6 print:flex">
                {/* Logo vektor SVG (bisa diganti <img src="/logo.png" alt="Logo" className="mr-5 h-20 w-20 object-contain" />) */}
                <img
                    src="/img/mvppersegi.webp"
                    alt="Logo SMK MVP ARS Internasional"
                    className="mr-5 h-20 w-20 shrink-0 object-contain"
                />

                {/* Identitas instansi/sekolah di tengah kop surat */}
                <div className="flex-1 text-center text-black">
                    <p className="text-sm font-semibold uppercase tracking-wide">
                        PEMERINTAH PROVINSI JAWA BARAT
                    </p>
                    <p className="text-sm font-semibold uppercase">
                        DINAS PENDIDIKAN
                    </p>
                    <h2 className="text-xl font-bold uppercase tracking-wider">
                        SMK MVP ARS INTERNASIONAL
                    </h2>
                    <p className="mt-1 text-xs">
                        Jl. Sekolah Internasional No. 1-6, Kota Bandung, Jawa Barat | Telp: (022) 720-xxxx
                    </p>
                    <p className="text-xs">
                        Website: www.smkmvp.sch.id | Email: info@smkmvp.sch.id
                    </p>
                </div>
            </header>

            {/* ================= JUDUL LAPORAN ================= */}
            {/* 'hidden print:block' = hanya muncul di atas tabel saat dicetak */}
            <div className="mb-5 hidden text-center text-black print:block">
                <h3 className="text-base font-bold uppercase underline">
                    LAPORAN DATA KOMPETENSI KEAHLIAN / JURUSAN
                </h3>
                <p className="mt-1 text-xs">Dicetak pada tanggal: {tanggalCetak}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="mb-1 text-2xl font-bold">Fasility</h1>
                    <p className="text-sm text-muted-foreground">Kelola data Fasility.</p>
                </div>
                {/* Tombol Cetak Laporan: otomatis nonaktif jika data masih loading atau kosong */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrint}
                    disabled={isLoading || jurusan.length === 0}
                >
                    <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                    Cetak Laporan
                </Button>
                <Button onClick={() => router.push("/admin/jurusan/form/add")}>
                    <Plus aria-hidden="true" />
                    Tambah Jurusan
                </Button>
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

            <div className="mt-5 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead></TableHead>
                            <TableHead>Nama Jurusan</TableHead>
                            <TableHead>Singkatan Jurusan</TableHead>
                            <TableHead>Dibuat</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center">Memuat jurusan...</TableCell></TableRow>
                        ) : (jurusan?.length ?? 0) === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center">Belum ada jurusan.</TableCell></TableRow>
                        ) : jurusan.map((jurusan) => (
                            <TableRow key={jurusan.id}>
                                <TableCell>{jurusan.kodeJurusan}</TableCell>
                                <TableCell className="font-medium">{jurusan.kelas}</TableCell>
                                <TableCell>{jurusan.nameJurusan}</TableCell>
                                <TableCell className="capitalize">{jurusan.singkatJur}</TableCell>
                                <TableCell>{new Date(jurusan.createdAt).toLocaleDateString("id-ID")}</TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${jurusan.kelas}`}
                                            title="Edit jurusan"
                                            onClick={() => router.push(`/admin/jurusan/form/${jurusan.id}`)}
                                        >
                                            <Pencil aria-hidden="true" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Hapus ${jurusan.kelas}`}
                                            title="Hapus jurusan"
                                            onClick={() => void deleteJurusan(jurusan)}
                                        >
                                            <Trash2 aria-hidden="true" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                aria-disabled={currentPage === 1 || isLoading}
                                className={currentPage === 1 || isLoading ? "pointer-events-none opacity-50" : undefined}
                                onClick={(event) => {
                                    event.preventDefault()
                                    if (currentPage > 1 && !isLoading) goToPage(currentPage - 1)
                                }}
                            />
                        </PaginationItem>
                        {getPageItems(currentPage, totalPages).map((item, index) => (
                            <PaginationItem key={`${item}-${index}`}>
                                {item === "ellipsis" ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        isActive={item === currentPage}
                                        aria-label={`Go to page ${item}`}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            if (!isLoading && item !== currentPage) goToPage(item)
                                        }}
                                    >
                                        {item}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                aria-disabled={currentPage === totalPages || isLoading}
                                className={currentPage === totalPages || isLoading ? "pointer-events-none opacity-50" : undefined}
                                onClick={(event) => {
                                    event.preventDefault()
                                    if (currentPage < totalPages && !isLoading) goToPage(currentPage + 1)
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </Card>
    )
}
function getPageItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
    if (totalPages <= 4) {
        return Array.from({ length: totalPages }, (_, index) => index + 1)
    }
    if (currentPage <= 2) return [1, 2, 3, "ellipsis"]
    if (currentPage >= totalPages - 1) {
        return ["ellipsis", totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis"]
}