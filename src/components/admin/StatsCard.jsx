import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = 'green' }) {
    const colorClasses = {
        green: 'from-green-500 to-green-600',
        blue: 'from-blue-500 to-blue-600',
        red: 'from-red-500 to-red-600',
        yellow: 'from-yellow-500 to-yellow-600',
        purple: 'from-purple-500 to-purple-600',
    };

    const bgColorClasses = {
        green: 'bg-green-100',
        blue: 'bg-blue-100',
        red: 'bg-red-100',
        yellow: 'bg-yellow-100',
        purple: 'bg-purple-100',
    };

    const iconColorClasses = {
        green: 'text-green-600',
        blue: 'text-blue-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
        purple: 'text-purple-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-lg ${bgColorClasses[color]} flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${iconColorClasses[color]}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {trendValue}
                    </div>
                )}
            </div>

            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
}
