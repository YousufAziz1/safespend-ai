import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mx-auto flex w-full max-w-7xl flex-1 items-start gap-8 px-4 sm:px-6 lg:px-8 py-8">
            <Sidebar />
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
