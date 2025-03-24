'use client'
import Loading from "@/components/ui/loading"
import FilmDetails from "@/components/FilmPage/FilmDetails";
import { SerialService } from "@/service/SerialService"

export default function SerialContent({ serialName }: { serialName: string }) {
    const serialNameInfo = SerialService.getSerialNameInfo(serialName)

    if (serialNameInfo?.loading) {
        return <Loading />
    }

    if (!serialNameInfo?.serialName || serialNameInfo.error) {
        return "Страница не найдена"
    }

    return <FilmDetails film={serialNameInfo?.serialName} />
}