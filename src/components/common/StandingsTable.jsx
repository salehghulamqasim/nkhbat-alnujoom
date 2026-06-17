import DarkCard from './DarkCard'
import TeamLogo from './TeamLogo'

export default function StandingsTable({ standings }) {
  return (
    <DarkCard className="overflow-hidden">
      <table className="w-full text-sm text-right">
        <thead className="bg-bg-surface text-text-secondary text-xs uppercase">
          <tr>
            <th className="py-3 px-3 w-8 text-center">#</th>
            <th className="py-3 px-2">الفريق</th>
            <th className="py-3 px-1 text-center w-8">لعب</th>
            <th className="py-3 px-1 text-center w-8">ف</th>
            <th className="py-3 px-1 text-center w-8">ت</th>
            <th className="py-3 px-1 text-center w-8">خ</th>
            <th className="py-3 px-3 text-center w-12 font-bold text-text-primary">نقاط</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr
              key={team.id}
              className={`border-t border-border hover:bg-bg-surface transition-colors
                ${index < 2 ? 'border-r-2 border-r-success bg-success/5' : ''}
                ${index === 2 ? 'border-r-2 border-r-warning bg-warning/5' : ''}
              `}
            >
              <td className="py-3 px-3 text-center text-text-secondary">{index + 1}</td>
              <td className="py-3 px-2 font-bold">
                <div className="flex items-center gap-2">
                  <TeamLogo logo={team.logo} name={team.name} size="sm" />
                  <span className="truncate">{team.name}</span>
                </div>
              </td>
              <td className="py-3 px-1 text-center">{team.played}</td>
              <td className="py-3 px-1 text-center text-success">{team.won}</td>
              <td className="py-3 px-1 text-center text-text-secondary">{team.drawn}</td>
              <td className="py-3 px-1 text-center text-danger">{team.lost}</td>
              <td className="py-3 px-3 text-center font-bold text-accent">{team.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DarkCard>
  )
}
