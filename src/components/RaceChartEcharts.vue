<template>
  <div ref="chartContainer" class="race-chart-echarts">
    <v-chart
      ref="chartRef"
      :option="chartOption"
      :autoresize="true"
      class="chart"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
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

// Register ECharts components
use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

const store = useTournamentStore()
const {
  processedChartData,
  currentGame,
  isFiltered,
  filteredGameIndices
} = storeToRefs(store)

const chartRef = ref(null)
const chartContainer = ref(null)

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

// Generate ECharts option
const chartOption = computed(() => {
  const data = getProcessedData()

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
          color: 'rgba(100, 116, 139, 0.15)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 10
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
      backgroundColor: 'rgba(15, 23, 42, 0.98)',
      borderColor: 'rgba(100, 116, 139, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#f1f5f9',
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
                <span style="color: #38bdf8; font-weight: 600;">${gameData.points}</span>
              </div>
            </div>
          </div>
        `
      }
    },
    // Add custom labels and scores
    graphic: [
      // Team labels (rank + name) on the left
      ...data.map((team, index) => {
        const rank = index + 1
        const yPos = 20 + (index + 0.5) * (100 / data.length)
        const rankColor = rank === 1 ? '#fbbf24' :
                         rank === 2 ? '#94a3b8' :
                         rank === 3 ? '#b45309' :
                         '#64748b'

        return [
          // Rank number
          {
            type: 'text',
            left: 20,
            top: yPos + '%',
            style: {
              text: rank.toString(),
              fill: rankColor,
              font: 'bold 13px system-ui',
              textAlign: 'right',
              textVerticalAlign: 'middle'
            },
            z: 100
          },
          // Team name
          {
            type: 'text',
            left: 50,
            top: yPos + '%',
            style: {
              text: team.team,
              fill: '#e2e8f0',
              font: '12px system-ui',
              textAlign: 'left',
              textVerticalAlign: 'middle',
              width: 150,
              overflow: 'truncate'
            },
            z: 100
          }
        ]
      }).flat(),
      // Total scores on the right
      ...data.map((team, index) => {
        const yPos = 20 + (index + 0.5) * (100 / data.length)
        return {
          type: 'text',
          right: 30,
          top: yPos + '%',
          style: {
            text: team.totalScore.toString(),
            fill: '#38bdf8',
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
watch([processedChartData, currentGame, isFiltered, filteredGameIndices], () => {
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
  min-height: 600px;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 600px;
}
</style>
