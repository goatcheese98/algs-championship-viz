<template>
  <div ref="chartContainer" class="race-chart-echarts">
    <v-chart
      ref="chartRef"
      :option="chartOption"
      :autoresize="true"
      class="chart"
    />

    <div
      v-if="leftSidebarTeams.length"
      class="left-team-overlay"
      :style="{ gridTemplateRows: `repeat(${leftSidebarTeams.length}, minmax(0, 1fr))` }"
    >
      <div
        v-for="team in leftSidebarTeams"
        :key="team.team"
        class="left-team-row"
      >
        <span class="left-team-rank" :style="{ color: getRankColor(team.rank) }">
          {{ team.rank }}
        </span>

        <img
          v-if="team.logoUrl"
          :src="team.logoUrl"
          :alt="`${team.team} logo`"
          class="left-team-logo"
          @error="handleLogoError(team.team)"
        />

        <div
          v-else
          class="left-team-logo left-team-logo-fallback"
          :style="{ backgroundColor: team.fallbackColor }"
        >
          {{ team.fallbackInitials }}
        </div>

        <span class="left-team-name">{{ team.team }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useTournamentStore } from '@/stores/tournament'
import { storeToRefs } from 'pinia'
import { useTeamConfig } from '@/composables/useTeamConfig'

// Register ECharts components
use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

const { isDark } = useTheme()

const store = useTournamentStore()
const {
  processedChartData,
  currentGame,
  isFiltered,
  filteredGameIndices
} = storeToRefs(store)

// Reactive chart palette based on theme
const chartColors = computed(() => isDark.value ? {
  axisLabel: '#64748b',
  gridLine: 'rgba(100, 116, 139, 0.15)',
  tooltipBg: 'rgba(15, 23, 42, 0.98)',
  tooltipBorder: 'rgba(100, 116, 139, 0.3)',
  tooltipText: '#f1f5f9',
  score: '#f87171',
  teamName: '#e2e8f0',
  rankSubtle: '#64748b',
} : {
  axisLabel: '#7a5c3c',
  gridLine: 'rgba(139, 110, 80, 0.2)',
  tooltipBg: 'rgba(252, 247, 240, 0.99)',
  tooltipBorder: 'rgba(139, 110, 80, 0.35)',
  tooltipText: '#1a0e00',
  score: '#b91c1c',
  teamName: '#2d1e08',
  rankSubtle: '#7a5c3c',
})

const chartRef = ref(null)
const chartContainer = ref(null)
const failedLogos = ref(new Set())

const { getTeamLogo, getFallbackConfig } = useTeamConfig()

const getRankColor = (rank) => {
  if (rank === 1) return '#fbbf24'
  if (rank === 2) return '#94a3b8'
  if (rank === 3) return '#b45309'
  return '#64748b'
}

const handleLogoError = (teamName) => {
  if (failedLogos.value.has(teamName)) return

  const updatedSet = new Set(failedLogos.value)
  updatedSet.add(teamName)
  failedLogos.value = updatedSet
}

// Process data for current game state
const getProcessedData = () => {
  if (!processedChartData.value.length) return []

  return processedChartData.value.map(team => {
    let games = team.games.filter(g => g.gameNumber <= currentGame.value)

    if (isFiltered.value && filteredGameIndices.value.length > 0) {
      games = games.filter(g => filteredGameIndices.value.includes(g.gameNumber))
    }

    // Recalculate cumulative scores
    let cumulative = 0
    const processedGames = games.map(g => {
      const game = { ...g, startX: cumulative }
      cumulative += g.points
      return game
    })

    const totalScore = games.reduce((sum, g) => sum + g.points, 0)

    return {
      ...team,
      games: processedGames,
      totalScore
    }
  }).sort((a, b) => b.totalScore - a.totalScore)
}

const displayTeams = computed(() => getProcessedData())

const leftSidebarTeams = computed(() => {
  return displayTeams.value.map((team, index) => {
    const fallback = getFallbackConfig(team.team)
    const logoUrl = failedLogos.value.has(team.team) ? null : getTeamLogo(team.team)

    return {
      ...team,
      rank: index + 1,
      logoUrl,
      fallbackColor: fallback.backgroundColor,
      fallbackInitials: fallback.initials
    }
  })
})

// Generate ECharts option
const chartOption = computed(() => {
  const data = displayTeams.value

  if (!data.length) {
    return {
      title: {
        text: 'No data available',
        left: 'center',
        top: 'center',
        textStyle: { color: '#64748b' }
      }
    }
  }

  // Prepare data for stacked bars
  const teamNames = data.map(d => d.team)
  const maxScore = Math.max(10, ...data.map(d => d.totalScore))

  // Calculate dynamic height based on number of teams
  const teamCount = data.length
  const calculatedHeight = Math.max(500, teamCount * 30)

  // Create series for each game (stacked segments)
  const allGameNumbers = new Set()
  data.forEach(team => {
    team.games.forEach(game => allGameNumbers.add(game.gameNumber))
  })

  const sortedGameNumbers = Array.from(allGameNumbers).sort((a, b) => a - b)

  const series = sortedGameNumbers.map(gameNum => {
    const isLastGame = gameNum === sortedGameNumbers[sortedGameNumbers.length - 1]
    return {
      name: `Game ${gameNum}`,
      type: 'bar',
      stack: 'total',
      barWidth: '75%',
      barGap: '0%',
      label: {
        show: true,
        position: 'inside',
        formatter: (params) => params.value >= 4 ? String(params.value) : '',
        color: 'rgba(255, 255, 255, 0.92)',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: '"JetBrains Mono", monospace',
        textShadowBlur: 3,
        textShadowColor: 'rgba(0, 0, 0, 0.6)',
      },
      data: data.map(team => {
        const game = team.games.find(g => g.gameNumber === gameNum)
        return {
          value: game ? game.points : 0,
          itemStyle: {
            color: game ? game.color : 'transparent',
            borderRadius: isLastGame ? [0, 5, 5, 0] : 0,
            borderColor: 'rgba(0,0,0,0.15)',
            borderWidth: 0.5,
            shadowBlur: isLastGame ? 3 : 0,
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowOffsetX: isLastGame ? 2 : 0
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 8,
              shadowColor: 'rgba(0,0,0,0.4)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.3)'
            }
          },
          gameData: game || null,
          team: team.team
        }
      })
    }
  })

  return {
    animation: true,
    animationDuration: 400,
    animationEasing: 'cubicOut',
    animationThreshold: 2000, // Only animate if less than 2000 series
    progressive: 1000, // Render 1000 elements at a time for large datasets
    progressiveThreshold: 3000,
    grid: {
      left: 210,
      right: 80,
      top: 20,
      bottom: 40,
      containLabel: false
    },
    xAxis: {
      type: 'value',
      max: Math.ceil(maxScore * 1.05),
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: chartColors.value.gridLine,
          type: 'dashed'
        }
      },
      axisLabel: {
        color: chartColors.value.axisLabel,
        fontSize: 13,
        fontWeight: 500
      }
    },
    yAxis: {
      type: 'category',
      data: teamNames,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        show: false
      }
    },
    series: series,
    tooltip: {
      trigger: 'item',
      backgroundColor: chartColors.value.tooltipBg,
      borderColor: chartColors.value.tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: chartColors.value.tooltipText,
        fontSize: 12
      },
      formatter: (params) => {
        const gameData = params.data.gameData
        if (!gameData) return ''

        const placementMap = {
          12: '1st', 9: '2nd', 7: '3rd', 5: '4th', 4: '5th',
          3: '6th', 2: '8th', 1: '11th', 0: '16th'
        }

        const placement = placementMap[gameData.placementPoints] || `${gameData.placementPoints} pts`

        return `
          <div style="padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${params.data.team}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              Game ${gameData.gameNumber} • ${gameData.map}
            </div>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="color: #94a3b8;">Placement:</span>
                <span style="color: #fbbf24; font-weight: 500;">${placement}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="color: #94a3b8;">Kills:</span>
                <span style="color: #ef4444; font-weight: 500;">${gameData.kills}</span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 16px;">
                <span style="color: #94a3b8;">Points:</span>
                <span style="color: #f87171; font-weight: 600;">${gameData.points}</span>
              </div>
            </div>
          </div>
        `
      }
    },
    // Add total scores on the right
    graphic: [
      ...data.map((team, index) => {
        const yPos = (index + 0.5) * (100 / data.length)
        return {
          type: 'text',
          right: 30,
          top: yPos + '%',
          style: {
            text: team.totalScore.toString(),
            fill: chartColors.value.score,
            font: 'bold 13px "JetBrains Mono", monospace',
            textAlign: 'right',
            textVerticalAlign: 'middle'
          },
          z: 100
        }
      })
    ]
  }
})

// Watch for data changes and update chart (optimized)
watch([processedChartData, currentGame, isFiltered, filteredGameIndices, isDark], () => {
  nextTick(() => {
    if (chartRef.value && processedChartData.value.length > 0) {
      // Use notMerge: false and lazyUpdate: false for better performance
      chartRef.value.setOption(chartOption.value, {
        notMerge: false,
        lazyUpdate: false
      })
    }
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    if (chartRef.value) {
      chartRef.value.setOption(chartOption.value)
    }
  })
})
</script>

<style scoped>
.race-chart-echarts {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.left-team-overlay {
  position: absolute;
  left: 20px;
  top: 20px;
  bottom: 40px;
  width: 180px;
  display: grid;
  pointer-events: none;
  z-index: 20;
}

.left-team-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.left-team-rank {
  width: 20px;
  text-align: right;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.left-team-logo {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid rgba(100, 116, 139, 0.35);
}

.left-team-logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f8fafc;
  font-size: 10px;
  font-weight: 700;
}

.left-team-name {
  color: var(--chart-team-name);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
