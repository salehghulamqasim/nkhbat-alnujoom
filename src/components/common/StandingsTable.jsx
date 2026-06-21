import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'
import DarkCard from './DarkCard'
import TeamLogo from './TeamLogo'

export default function StandingsTable({ standings }) {
  const { t } = useTranslation()

  return (
    <DarkCard className="overflow-hidden">
      <table className="w-full text-sm text-start">
        <thead className="bg-bg-surface text-text-secondary text-xs uppercase">
          <tr>
            <th className="py-3 px-3 w-8 text-center">{t.standingsTable.rank}</th>
            <th className="py-3 px-2 text-start">{t.standingsTable.team}</th>
            <th className="py-3 px-1 text-center w-8">{t.standingsTable.played}</th>
            <th className="py-3 px-1 text-center w-8">{t.standingsTable.won}</th>
            <th className="py-3 px-1 text-center w-8">{t.standingsTable.drawn}</th>
            <th className="py-3 px-1 text-center w-8">{t.standingsTable.lost}</th>
            <th className="py-3 px-1 text-center w-10">{t.standingsTable.gd}</th>
            <th className="py-3 px-3 text-center w-12 font-bold text-text-primary">{t.standingsTable.pts}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => {
            const gd = (team.gf || 0) - (team.ga || 0)
            const formattedGd = gd > 0 ? `+${gd}` : gd

            return (
              <tr
                key={team.id}
                className={`border-t border-border hover:bg-bg-surface transition-colors
                  ${index < 2 ? 'border-s-2 border-s-success bg-success/5' : ''}
                  ${index === 2 ? 'border-s-2 border-s-warning bg-warning/5' : ''}
                `}
              >
                <td className="py-3 px-3 text-center text-text-secondary">{index + 1}</td>
                <td className="py-3 px-2 font-bold">
                  <Link
                    to={`/teams/${team.id}`}
                    className="flex items-center gap-2 hover:text-accent transition-colors duration-200"
                  >
                    <TeamLogo logo={team.logo} name={team.name} size="sm" />
                    <span className="truncate">{team.name}</span>
                  </Link>
                </td>
                <td className="py-3 px-1 text-center">{team.played}</td>
                <td className="py-3 px-1 text-center text-success">{team.won}</td>
                <td className="py-3 px-1 text-center text-text-secondary">{team.drawn}</td>
                <td className="py-3 px-1 text-center text-danger">{team.lost}</td>
                <td
                  className={`py-3 px-1 text-center text-xs dir-ltr font-medium ${
                    gd > 0 ? 'text-success' : gd < 0 ? 'text-danger' : 'text-text-secondary'
                  }`}
                >
                  {formattedGd}
                </td>
                <td className="py-3 px-3 text-center font-bold text-accent">{team.pts}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </DarkCard>
  )
}
