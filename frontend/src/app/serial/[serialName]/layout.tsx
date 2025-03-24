import '@/app/globals.css';

export const metadata = {
    title: 'Film Page',
};

export default function SerialLayout({
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
