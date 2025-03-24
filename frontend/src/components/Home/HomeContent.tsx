'use client'
import Loading from "@/components/ui/loading"
import HomeDetails from "@/components/Home/HomeDetails";
import { FilmService } from "@/service/FilmService";
import {SerialService} from "@/service/SerialService";

export default function MovieContent() {
    const getFilmsInfo= FilmService.getFilmsInfo()
    const getSerialsInfo = SerialService.getSerialsInfo()

    if (getFilmsInfo?.loading || getSerialsInfo?.loading) {
        return <Loading />
    }

    if (!getFilmsInfo?.films || getFilmsInfo?.error || !getSerialsInfo?.serials || getSerialsInfo?.error) {
        return "Страница не найдена"
    }

    return <HomeDetails films={getFilmsInfo?.films} serials={getSerialsInfo?.serials} />
}