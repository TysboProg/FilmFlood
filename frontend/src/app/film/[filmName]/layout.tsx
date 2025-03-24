import '@/app/globals.css';

export const metadata = {
    title: `Страница с фильмом`,
};

export default function FilmLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-gray-900 text-white h-screen flex flex-col">
            {children}
        </div>
    );
}
