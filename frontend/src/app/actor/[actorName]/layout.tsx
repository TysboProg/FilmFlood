import '@/app/globals.css'

export const metadata = {
    title: 'ActorPage',
};

export default function ActorLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-gray-900 text-white">
            {children}
        </div>
    )
}