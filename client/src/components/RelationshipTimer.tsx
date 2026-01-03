import { useEffect, useState, memo } from "react";
import { Heart } from "lucide-react";

interface RelationshipTimerProps {
  startDate: string | Date;
}

interface TimeUnits {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
}

export const RelationshipTimer = memo(function RelationshipTimer({ startDate }: RelationshipTimerProps) {
  const [time, setTime] = useState<TimeUnits | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      // Parse date as YYYY-MM-DD (local date, not UTC)
      const dateStr = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
      const [year, month, day] = dateStr.split('-').map(Number);
      const start = new Date(year, month - 1, day, 0, 0, 0, 0).getTime(); // Local midnight
      const now = new Date().getTime();
      const diff = now - start;

      const totalSeconds = Math.floor(diff / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);
      
      // Calculate years, months, days
      const years = Math.floor(totalDays / 365);
      const remainingDaysAfterYears = totalDays % 365;
      const months = Math.floor(remainingDaysAfterYears / 30);
      const days = remainingDaysAfterYears % 30;

      setTime({
        years,
        months,
        days,
        hours: totalHours % 24,
        minutes: totalMinutes % 60,
        seconds: totalSeconds % 60,
        totalDays,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  if (!time) return null;

  const showYears = time.totalDays > 360;

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 rounded-2xl p-8 border border-rose-200 dark:border-rose-800">
      <div className="flex items-center justify-center mb-6">
        <Heart className="text-rose-500 mr-2" size={28} />
        <h2 className="text-2xl font-bold text-rose-700 dark:text-rose-300">Nossa jornada</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {showYears && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border border-rose-200 dark:border-rose-800">
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{time.years}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {time.years === 1 ? 'Ano' : 'Anos'}
            </div>
          </div>
        )}

        {showYears && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border border-rose-200 dark:border-rose-800">
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{time.months}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {time.months === 1 ? 'Mês' : 'Meses'}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border border-rose-200 dark:border-rose-800">
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
            {showYears ? time.days : time.totalDays}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {showYears ? 'Dias' : 'Dias Juntos'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border border-rose-200 dark:border-rose-800">
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{time.hours.toString().padStart(2, "0")}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Horas</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border border-rose-200 dark:border-rose-800">
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{time.minutes.toString().padStart(2, "0")}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Minutos</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border border-rose-200 dark:border-rose-800">
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{time.seconds.toString().padStart(2, "0")}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Segundos</div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Juntos desde: {(() => {
          const dateStr = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
          const [year, month, day] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" });
        })()}</p>
      </div>
    </div>
  );
});
